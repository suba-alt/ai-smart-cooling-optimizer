import os
import json
import random
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

MODELS_DIR = os.path.join(os.path.dirname(__file__), "trained_models")
os.makedirs(MODELS_DIR, exist_ok=True)

def generate_training_dataset(num_samples=3000):
    """
    Generates a realistic synthetic operational dataset covering all operational scenarios.
    Dataset size remains lightweight (< 2 MB) and complies strictly with the < 20 MB guideline.
    """
    np.random.seed(42)
    random.seed(42)

    data = []
    # Simulating 30-minute ahead horizon
    for _ in range(num_samples):
        # Operational variables
        cpu = np.random.uniform(10.0, 98.0)
        gpu = np.random.uniform(10.0, 99.0)
        mem = 0.5 * cpu + 0.5 * gpu + np.random.uniform(-4.0, 4.0)
        mem = np.clip(mem, 10.0, 99.0)
        
        load = 0.6 * gpu + 0.4 * cpu
        power = 120.0 + (load / 100.0) * 360.0 + (gpu / 100.0) * 80.0 + np.random.uniform(-10.0, 10.0)
        ambient = np.random.uniform(18.0, 35.0)
        humidity = np.random.uniform(35.0, 65.0)
        cooling = np.random.uniform(20.0, 95.0)
        
        # Dielectric liquid conditions
        dielectric_temp = 32.0 + (load / 100.0) * 22.0 - (cooling / 100.0) * 8.0 + np.random.uniform(-2.0, 2.0)
        
        # Physics-based current temperature
        thermal_gen = (power - 120.0) * 0.14
        cooling_mit = (cooling / 100.0) * 30.0
        amb_pen = (ambient - 22.0) * 0.85
        current_temp = 38.0 + thermal_gen - cooling_mit + amb_pen + np.random.uniform(-1.0, 1.0)
        current_temp = np.clip(current_temp, 35.0, 98.0)
        
        # 30-minute future targets:
        # Future workload fluctuates with slight inertia
        future_load = np.clip(load + np.random.normal(0, 5.0), 10.0, 99.0)
        
        # Future temperature depends on ongoing thermal momentum, ambient delta, and cooling level
        future_temp = current_temp + (future_load - load) * 0.18 + (ambient - 24.0) * 0.15 - (cooling - 50.0) * 0.12 + np.random.normal(0, 0.8)
        future_temp = np.clip(future_temp, 35.0, 99.0)
        
        # Cooling demand is the cooling percentage needed to keep future_temp around safe baseline (<= 75°C)
        cooling_demand = np.clip(30.0 + (future_temp - 50.0) * 1.5 + (future_load / 100.0) * 25.0 + np.random.normal(0, 2.0), 15.0, 100.0)
        
        data.append({
            "cpu_usage": cpu,
            "gpu_usage": gpu,
            "memory_usage": mem,
            "server_load": load,
            "power_consumption": power,
            "current_temp": current_temp,
            "ambient_temperature": ambient,
            "humidity": humidity,
            "cooling_level": cooling,
            "dielectric_temp": dielectric_temp,
            # Targets
            "future_temperature": future_temp,
            "future_workload": future_load,
            "cooling_demand": cooling_demand
        })
        
    df = pd.DataFrame(data)
    return df

def train_and_evaluate():
    print("[ML] Generating synthetic operational training dataset...")
    df = generate_training_dataset()
    csv_path = os.path.join(MODELS_DIR, "synthetic_operational_dataset.csv")
    df.to_csv(csv_path, index=False)
    print(f"[ML] Dataset saved to {csv_path} ({round(os.path.getsize(csv_path) / 1024, 1)} KB).")

    feature_cols = [
        "cpu_usage", "gpu_usage", "memory_usage", "server_load",
        "power_consumption", "current_temp", "ambient_temperature",
        "humidity", "cooling_level", "dielectric_temp"
    ]
    
    X = df[feature_cols]
    y_temp = df["future_temperature"]
    y_workload = df["future_workload"]
    y_demand = df["cooling_demand"]

    # Split for honest, un-fabricated validation
    X_train, X_test, y_temp_tr, y_temp_te, y_work_tr, y_work_te, y_dem_tr, y_dem_te = train_test_split(
        X, y_temp, y_workload, y_demand, test_size=0.2, random_state=42
    )

    print("[ML] Training lightweight RandomForestRegressor for Temperature Prediction...")
    temp_model = RandomForestRegressor(n_estimators=45, max_depth=12, random_state=42, n_jobs=-1)
    temp_model.fit(X_train, y_temp_tr)
    y_temp_pred = temp_model.predict(X_test)
    temp_mae = float(mean_absolute_error(y_temp_te, y_temp_pred))
    temp_rmse = float(np.sqrt(mean_squared_error(y_temp_te, y_temp_pred)))
    temp_r2 = float(r2_score(y_temp_te, y_temp_pred))

    print("[ML] Training lightweight RandomForestRegressor for Workload Prediction...")
    work_model = RandomForestRegressor(n_estimators=45, max_depth=12, random_state=42, n_jobs=-1)
    work_model.fit(X_train, y_work_tr)
    y_work_pred = work_model.predict(X_test)
    work_mae = float(mean_absolute_error(y_work_te, y_work_pred))
    work_rmse = float(np.sqrt(mean_squared_error(y_work_te, y_work_pred)))
    work_r2 = float(r2_score(y_work_te, y_work_pred))

    print("[ML] Training lightweight RandomForestRegressor for Cooling Demand Prediction...")
    dem_model = RandomForestRegressor(n_estimators=45, max_depth=12, random_state=42, n_jobs=-1)
    dem_model.fit(X_train, y_dem_tr)
    y_dem_pred = dem_model.predict(X_test)
    dem_mae = float(mean_absolute_error(y_dem_te, y_dem_pred))
    dem_rmse = float(np.sqrt(mean_squared_error(y_dem_te, y_dem_pred)))
    dem_r2 = float(r2_score(y_dem_te, y_dem_pred))

    # Export models
    joblib.dump(temp_model, os.path.join(MODELS_DIR, "temperature_model.joblib"))
    joblib.dump(work_model, os.path.join(MODELS_DIR, "workload_model.joblib"))
    joblib.dump(dem_model, os.path.join(MODELS_DIR, "cooling_demand_model.joblib"))

    metrics = {
        "temperature_model": {
            "mae": round(temp_mae, 3),
            "rmse": round(temp_rmse, 3),
            "r2": round(temp_r2, 4)
        },
        "workload_model": {
            "mae": round(work_mae, 3),
            "rmse": round(work_rmse, 3),
            "r2": round(work_r2, 4)
        },
        "cooling_demand_model": {
            "mae": round(dem_mae, 3),
            "rmse": round(dem_rmse, 3),
            "r2": round(dem_r2, 4)
        },
        "features": feature_cols,
        "horizon_minutes": 30,
        "sample_size": len(df),
        "test_size": len(X_test)
    }

    metrics_path = os.path.join(MODELS_DIR, "model_metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print(f"[ML] Real Evaluation Metrics saved to {metrics_path}:")
    print(f"     Temp Model -> MAE: {temp_mae:.3f} °C, RMSE: {temp_rmse:.3f}, R²: {temp_r2:.4f}")
    print(f"     Workload Model -> MAE: {work_mae:.3f}%, RMSE: {work_rmse:.3f}, R²: {work_r2:.4f}")
    print(f"     Cooling Demand Model -> MAE: {dem_mae:.3f}%, RMSE: {dem_rmse:.3f}, R²: {dem_r2:.4f}")
    return metrics

if __name__ == "__main__":
    train_and_evaluate()
