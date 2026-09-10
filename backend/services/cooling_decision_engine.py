from config import Config
from ml.prediction_service import prediction_service

class CoolingDecisionEngine:
    """
    Evaluates 4 cooling profiles against strict thermal safety constraints,
    scores valid modes using dynamic weighted resource costs,
    and performs model-driven cooling level optimization.
    """

    def evaluate_cooling_modes(self, telemetry, prediction, water_stress_score, dielectric_health, custom_weights=None, safe_limit=None):
        safe_limit = safe_limit or Config.SAFE_TEMP_LIMIT
        weights = custom_weights or {}
        w_water = float(weights.get("water_cost_weight", Config.WATER_COST_WEIGHT))
        w_energy = float(weights.get("energy_cost_weight", Config.ENERGY_COST_WEIGHT))
        w_eff = float(weights.get("cooling_effectiveness_weight", Config.COOLING_EFFECTIVENESS_WEIGHT))
        stress_mult = float(weights.get("water_stress_penalty_weight", Config.WATER_STRESS_PENALTY_WEIGHT))

        pred_temp = float(prediction.get("predicted_temperature", 65.0))
        server_load = float(telemetry.get("server_load", 50.0))
        current_temp = float(telemetry.get("server_temperature", 60.0))
        effective_temp = max(current_temp, pred_temp)

        is_dielectric_degraded = dielectric_health.get("status") in ["WARNING", "CRITICAL"]

        evaluated_modes = []

        for p_id, p in Config.COOLING_PROFILES.items():
            mode_eval = {
                "id": p_id,
                "name": p_id,
                "display_name": p["display_name"],
                "thermal_effectiveness": p["thermal_effectiveness"],
                "water_consumption_factor": p["water_consumption_factor"],
                "energy_consumption_factor": p["energy_consumption_factor"],
                "suitability_description": p["suitability_description"],
                "is_valid": True,
                "invalidation_reason": None,
                "score": 0.0,
                "score_breakdown": {}
            }

            # --- 1. THERMAL SAFETY CONSTRAINT ---
            # Rule: Any mode that cannot satisfy the thermal safety constraint is marked INVALID
            if p_id == "air":
                # Air cooling max operating limit is 75°C. In high heat density or high load (>75%), air cooling fails safe limit.
                if effective_temp > 76.0 or server_load > 75.0:
                    mode_eval["is_valid"] = False
                    mode_eval["invalidation_reason"] = f"Thermal safety limit violated: Direct air cooling cannot dissipate heat density when temperature ({effective_temp:.1f}°C) exceeds 76°C."
            
            elif p_id == "water_evaporative":
                # Fails only under extreme thermal spike beyond its max limit (88°C)
                if effective_temp > 92.0:
                    mode_eval["is_valid"] = False
                    mode_eval["invalidation_reason"] = f"Thermal capacity exceeded: Critical temperature ({effective_temp:.1f}°C) exceeds evaporative heat exchange thresholds."

            elif p_id == "dielectric_immersion":
                # Highest thermal capacity (up to 95°C). Invalid only if severely compromised or exceeding 98°C
                if effective_temp > 96.0:
                    mode_eval["is_valid"] = False
                    mode_eval["invalidation_reason"] = f"Immersion safety threshold exceeded at {effective_temp:.1f}°C."

            elif p_id == "hybrid":
                # Hybrid operates effectively up to 90°C
                if effective_temp > 91.0:
                    mode_eval["is_valid"] = False
                    mode_eval["invalidation_reason"] = f"Thermal load exceeds hybrid cooling threshold at {effective_temp:.1f}°C."

            # --- 2. DYNAMIC RESOURCE SCORING (For valid modes) ---
            eff = p["thermal_effectiveness"]
            if p_id == "dielectric_immersion" and is_dielectric_degraded:
                eff = max(0.65, eff - 0.22) # Simulated degraded effectiveness

            # Weighted resource cost:
            resource_cost = (w_water * p["water_consumption_factor"]) + (w_energy * p["energy_consumption_factor"])
            base_score = resource_cost / max(0.01, (w_eff * eff))

            # Water stress penalty
            water_penalty = (float(water_stress_score) / 100.0) * p["water_consumption_factor"] * stress_mult

            total_score = round(base_score + water_penalty, 3)
            mode_eval["score"] = total_score
            mode_eval["score_breakdown"] = {
                "resource_cost": round(resource_cost, 3),
                "base_score": round(base_score, 3),
                "water_stress_penalty": round(water_penalty, 3)
            }

            evaluated_modes.append(mode_eval)

        # Select the valid mode with lowest score
        valid_modes = [m for m in evaluated_modes if m["is_valid"]]
        if valid_modes:
            recommended_mode = min(valid_modes, key=lambda x: x["score"])
        else:
            # Fallback to highest thermal effectiveness mode if all theoretically invalid
            recommended_mode = max(evaluated_modes, key=lambda x: x["thermal_effectiveness"])
            recommended_mode["invalidation_reason"] = "Forced emergency selection: Extreme thermal threshold exceeded."

        return {
            "modes": evaluated_modes,
            "recommended_mode_id": recommended_mode["id"],
            "recommended_mode_name": recommended_mode["display_name"],
            "recommended_mode_score": recommended_mode["score"],
            "selection_rationale": self._generate_mode_rationale(recommended_mode, water_stress_score, effective_temp, safe_limit)
        }

    def _generate_mode_rationale(self, mode, water_stress, temp, safe_limit):
        m_id = mode["id"]
        if m_id == "dielectric_immersion":
            if water_stress >= 60:
                return f"Selected {mode['display_name']} because it meets the thermal safety target ({temp:.1f}°C) while completely mitigating freshwater usage under elevated water stress (Score: {water_stress})."
            else:
                return f"Selected {mode['display_name']} for superior thermal dissipation and lowest overall energy/resource consumption footprint."
        elif m_id == "hybrid":
            return f"Selected {mode['display_name']} as an optimal balance between air assist and liquid cooling, conserving water resources while maintaining safe thermal equilibrium."
        elif m_id == "water_evaporative":
            return f"Selected {mode['display_name']} due to high heat rejection capacity under acceptable regional water availability conditions."
        else: # air
            return f"Selected {mode['display_name']} because thermal load is modest ({temp:.1f}°C <= {safe_limit}°C), eliminating water consumption entirely."

    def optimize_cooling_level(self, telemetry, safe_limit=None):
        """
        Section 12: Minimum Recommended Cooling Level Optimization.
        Searches candidate levels using the trained temperature model.
        """
        safe_limit = safe_limit or Config.SAFE_TEMP_LIMIT
        current_cooling = float(telemetry.get("cooling_level", 60.0))

        # Search candidates from 20% to 100% in steps of 5%
        candidates = list(range(20, 105, 5))
        safe_candidates = []

        target_thermal_threshold = safe_limit - 1.0 # 1.0°C safety buffer

        for cand in candidates:
            est_temp = prediction_service.estimate_temperature_at_cooling_level(telemetry, cand)
            if est_temp <= target_thermal_threshold:
                safe_candidates.append((cand, est_temp))

        if safe_candidates:
            # Pick the minimum level that satisfies thermal safety
            recommended_cooling, predicted_temp_at_rec = min(safe_candidates, key=lambda x: x[0])
            reason = f"Current cooling: {current_cooling:.0f}% → Recommended cooling: {recommended_cooling:.0f}% — minimum simulated cooling level required to maintain the configured thermal target ({safe_limit:.1f}°C)."
        else:
            # Max cooling required
            recommended_cooling = 100.0
            predicted_temp_at_rec = prediction_service.estimate_temperature_at_cooling_level(telemetry, 100.0)
            reason = f"Current cooling: {current_cooling:.0f}% → Recommended cooling: 100% — maximum simulated cooling required; temperature may remain elevated without workload shedding."

        return {
            "current_cooling_level": round(current_cooling, 1),
            "recommended_cooling_level": round(recommended_cooling, 1),
            "predicted_temp_at_recommended": round(predicted_temp_at_rec, 1),
            "target_safe_temperature": round(safe_limit, 1),
            "reason": reason
        }

cooling_decision_engine = CoolingDecisionEngine()
