import os
import json
import numpy as np
import pandas as pd
import joblib
from config import Config

MODELS_DIR = os.path.join(os.path.dirname(__file__), "trained_models")

class PredictionService:
    def __init__(self):
        self.models_loaded = False
        self.temp_model = None
        self.workload_model = None
        self.demand_model = None
        self.metrics = {}
        self.feature_cols = [
            "cpu_usage", "gpu_usage", "memory_usage", "server_load",
            "power_consumption", "current_temp", "ambient_temperature",
            "humidity", "cooling_level", "dielectric_temp"
        ]
        self._load_models()

    def _load_models(self):
        try:
            temp_path = os.path.join(MODELS_DIR, "temperature_model.joblib")
            work_path = os.path.join(MODELS_DIR, "workload_model.joblib")
            dem_path = os.path.join(MODELS_DIR, "cooling_demand_model.joblib")
            metrics_path = os.path.join(MODELS_DIR, "model_metrics.json")

            if os.path.exists(temp_path) and os.path.exists(work_path) and os.path.exists(dem_path):
                self.temp_model = joblib.load(temp_path)
                self.workload_model = joblib.load(work_path)
                self.demand_model = joblib.load(dem_path)
                self.models_loaded = True
                if os.path.exists(metrics_path):
                    with open(metrics_path, "r", encoding="utf-8") as f:
                        self.metrics = json.load(f)
                print("[PredictionService] Models loaded successfully.")
            else:
                print("[PredictionService Warning] Models not found. Training needed.")
        except Exception as e:
            print(f"[PredictionService Error] Error loading models: {e}")

    def _extract_feature_vector(self, t, cooling_override=None):
        return pd.DataFrame([{
            "cpu_usage": float(t.get("cpu_usage", 50.0)),
            "gpu_usage": float(t.get("gpu_usage", 50.0)),
            "memory_usage": float(t.get("memory_usage", 50.0)),
            "server_load": float(t.get("server_load", 50.0)),
            "power_consumption": float(t.get("power_consumption", 250.0)),
            "current_temp": float(t.get("server_temperature", t.get("gpu_temperature", 60.0))),
            "ambient_temperature": float(t.get("ambient_temperature", 24.0)),
            "humidity": float(t.get("humidity", 50.0)),
            "cooling_level": float(cooling_override if cooling_override is not None else t.get("cooling_level", 60.0)),
            "dielectric_temp": float(t.get("dielectric_temperature", 40.0))
        }])[self.feature_cols]

    def predict_conditions(self, telemetry):
        if not self.models_loaded:
            self._load_models()

        X = self._extract_feature_vector(telemetry)

        # Ensemble predictions
        pred_temp = float(self.temp_model.predict(X)[0])
        pred_workload = float(self.workload_model.predict(X)[0])
        pred_demand = float(self.demand_model.predict(X)[0])

        # Compute confidence indicator derived from individual tree prediction variance
        # Lower tree variance = higher agreement/confidence
        tree_preds = [tree.predict(X.values)[0] for tree in self.temp_model.estimators_]
        std_dev = float(np.std(tree_preds))
        # Map std_dev (e.g. 0.3 - 2.5) to an honest confidence index (75% - 99%)
        confidence = max(70.0, min(99.0, round(100.0 - (std_dev * 8.5), 1)))

        return {
            "predicted_temperature": round(pred_temp, 1),
            "predicted_workload": round(pred_workload, 1),
            "predicted_cooling_demand": round(pred_demand, 1),
            "prediction_horizon_minutes": Config.PREDICTION_HORIZON_MINUTES,
            "confidence_score": confidence,
            "prediction_variance_std": round(std_dev, 3)
        }

    def estimate_temperature_at_cooling_level(self, telemetry, target_cooling_level):
        """Used by the cooling level optimization search (Section 12)."""
        if not self.models_loaded:
            self._load_models()
        X = self._extract_feature_vector(telemetry, cooling_override=target_cooling_level)
        return float(self.temp_model.predict(X)[0])

    def get_metrics(self):
        return self.metrics

prediction_service = PredictionService()
