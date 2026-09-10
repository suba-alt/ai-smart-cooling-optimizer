import unittest
import json
import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app
from simulation.simulator import simulator
from services.water_stress_engine import water_stress_engine
from services.thermal_risk_engine import thermal_risk_engine
from services.cooling_decision_engine import cooling_decision_engine
from services.dielectric_health_engine import dielectric_health_engine
from services.workload_engine import workload_engine
from services.savings_engine import savings_engine
from services.recommendation_engine import recommendation_engine
from ml.prediction_service import prediction_service

class TestAISmartCoolingOptimizer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()

    # 1. Test Low Workload Scenario
    def test_01_low_workload_scenario(self):
        rec = simulator.generate_server_record("server_01", scenario="low_workload")
        self.assertLess(rec["server_load"], 40.0)
        self.assertLess(rec["server_temperature"], 60.0)
        risk = thermal_risk_engine.evaluate_risk(rec["server_temperature"])
        self.assertEqual(risk["risk_level"], "LOW")

    # 2. Test High Workload Scenario
    def test_02_high_workload_scenario(self):
        rec = simulator.generate_server_record("server_01", scenario="high_workload")
        self.assertGreater(rec["server_load"], 75.0)
        self.assertGreater(rec["server_temperature"], 70.0)
        pred = prediction_service.predict_conditions(rec)
        self.assertGreater(pred["predicted_temperature"], 65.0)

    # 3. Test High Workload + High Water Stress (Section 21)
    def test_03_high_workload_high_water_stress_scenario(self):
        rec = simulator.generate_server_record("server_01", scenario="high_workload_water_stress")
        pred = prediction_service.predict_conditions(rec)
        stress = water_stress_engine.calculate_water_stress(rec, pred["predicted_cooling_demand"])
        
        self.assertGreaterEqual(stress["score"], 60.0) # High or critical stress
        eval_modes = cooling_decision_engine.evaluate_cooling_modes(
            rec, pred, stress["score"], {"status": "NORMAL"}
        )
        # Dielectric immersion or hybrid must be chosen over water evaporative
        self.assertIn(eval_modes["recommended_mode_id"], ["dielectric_immersion", "hybrid"])
        self.assertNotEqual(eval_modes["recommended_mode_id"], "water_evaporative")

    # 4. Test Thermal Spike Scenario
    def test_04_thermal_spike_scenario(self):
        rec = simulator.generate_server_record("server_01", scenario="thermal_spike")
        risk = thermal_risk_engine.evaluate_risk(rec["server_temperature"])
        self.assertIn(risk["risk_level"], ["HIGH", "CRITICAL"])
        level_opt = cooling_decision_engine.optimize_cooling_level(rec)
        self.assertGreaterEqual(level_opt["recommended_cooling_level"], 80.0)

    # 5. Test Dielectric Degradation Scenario
    def test_05_dielectric_degradation_scenario(self):
        rec = simulator.generate_server_record("server_01", scenario="dielectric_degradation")
        health = dielectric_health_engine.evaluate_health(rec)
        self.assertIn(health["status"], ["WARNING", "CRITICAL"])
        self.assertTrue(health["alert_needed"])
        self.assertIn("degradation", health["recommendation"].lower())

    # 6. Test Recovery Condition Scenario
    def test_06_recovery_scenario(self):
        rec = simulator.generate_server_record("server_01", scenario="recovery")
        health = dielectric_health_engine.evaluate_health(rec)
        self.assertEqual(health["status"], "NORMAL")
        self.assertLess(rec["server_load"], 60.0)

    # 7. Test Invalid Telemetry Handling
    def test_07_invalid_telemetry_handling(self):
        # Empty or partial dictionary shouldn't crash prediction or engines
        pred = prediction_service.predict_conditions({})
        self.assertIn("predicted_temperature", pred)
        self.assertIn("confidence_score", pred)

        stress = water_stress_engine.calculate_water_stress({})
        self.assertGreaterEqual(stress["score"], 0.0)
        self.assertLessEqual(stress["score"], 100.0)

    # 8. Test API Failure and Error Codes
    def test_08_api_failure_handling(self):
        # Invalid scenario must return 400
        resp = self.client.post("/api/simulate", json={"scenario": "non_existent_scenario_123"})
        self.assertEqual(resp.status_code, 400)
        data = resp.get_json()
        self.assertEqual(data["status"], "error")

        # Non-existent endpoint must return 404 JSON
        resp404 = self.client.get("/api/invalid-endpoint-xyz")
        self.assertEqual(resp404.status_code, 404)
        self.assertEqual(resp404.get_json()["status"], "error")

    # 9. Test Cooling Decision Safety Constraint (Unsafe mode NEVER selected)
    def test_09_safety_constraint_enforcement(self):
        # Hot server (88°C, load 90%)
        hot_telemetry = {
            "server_temperature": 88.0,
            "server_load": 92.0,
            "cooling_level": 70.0
        }
        pred = {"predicted_temperature": 89.0}
        eval_result = cooling_decision_engine.evaluate_cooling_modes(
            hot_telemetry, pred, water_stress_score=20.0, dielectric_health={"status": "NORMAL"}
        )
        
        # Air cooling MUST be invalid because it cannot safely maintain 88°C under 80°C limit
        air_mode = next(m for m in eval_result["modes"] if m["id"] == "air")
        self.assertFalse(air_mode["is_valid"])
        self.assertIsNotNone(air_mode["invalidation_reason"])
        self.assertNotEqual(eval_result["recommended_mode_id"], "air")

    # 10. Test Resource Saving Calculation Correctness
    def test_10_resource_savings_correctness(self):
        savings = savings_engine.calculate_savings(
            {"power_consumption": 500.0},
            recommended_mode_id="dielectric_immersion",
            recommended_cooling_level=70.0,
            water_stress_score=80.0
        )
        water = savings["water"]
        energy = savings["energy"]

        # Formula check: (baseline - optimized) / baseline * 100
        expected_water_saving_pct = round(((water["baseline_liters_per_hour"] - water["optimized_liters_per_hour"]) / water["baseline_liters_per_hour"]) * 100.0, 1)
        self.assertEqual(water["saving_percentage"], expected_water_saving_pct)
        self.assertGreater(water["saving_percentage"], 80.0) # Immersion has 95% reduction vs evaporative
        self.assertGreater(energy["saving_percentage"], 20.0)

    # Additional Explicit Verification: Recommendations change when inputs change
    def test_11_recommendations_change_dynamically(self):
        rec_low = recommendation_engine.generate_recommendations(
            {"gpu_usage": 20.0}, {"predicted_temperature": 48.0}, {"risk_level": "LOW"},
            {"score": 20.0}, {"recommended_mode_name": "Direct Air Cooling"},
            {"current_cooling_level": 30.0, "recommended_cooling_level": 35.0},
            {"status": "NORMAL"}, {"migration_recommended": False}
        )
        rec_high = recommendation_engine.generate_recommendations(
            {"gpu_usage": 95.0}, {"predicted_temperature": 89.0}, {"risk_level": "CRITICAL"},
            {"score": 85.0}, {"recommended_mode_name": "Dielectric-Liquid Immersion Cooling"},
            {"current_cooling_level": 70.0, "recommended_cooling_level": 95.0},
            {"status": "WARNING", "degradation_indicator": "Attenuation"},
            {"migration_recommended": True, "source_server": "server_01", "target_server": "server_02", "recommended_shift_percent": 30.0}
        )
        self.assertNotEqual(rec_low["summary"], rec_high["summary"])
        self.assertIn("Nominal", rec_low["summary"])
        self.assertIn("safe thermal threshold", rec_high["summary"])
        self.assertIn("Dielectric", rec_high["summary"])

    # Additional Explicit Verification: Workload Shift Recommendation Logic
    def test_12_workload_rebalancing_trigger(self):
        balanced_cluster = {
            "server_01": {"server_temperature": 60.0, "gpu_usage": 50.0},
            "server_02": {"server_temperature": 58.0, "gpu_usage": 48.0}
        }
        res_balanced = workload_engine.evaluate_workload_distribution(balanced_cluster)
        self.assertFalse(res_balanced["migration_recommended"])

        unbalanced_cluster = {
            "server_01": {"server_temperature": 86.0, "gpu_usage": 94.0},
            "server_02": {"server_temperature": 55.0, "gpu_usage": 35.0}
        }
        res_unbalanced = workload_engine.evaluate_workload_distribution(unbalanced_cluster)
        self.assertTrue(res_unbalanced["migration_recommended"])
        self.assertEqual(res_unbalanced["source_server"], "server_01")
        self.assertEqual(res_unbalanced["target_server"], "server_02")
        self.assertGreater(res_unbalanced["recommended_shift_percent"], 10.0)

if __name__ == "__main__":
    unittest.main()
