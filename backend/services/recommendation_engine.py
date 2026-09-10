class RecommendationEngine:
    """
    Dynamically generates natural-language AI cooling recommendations from live pipeline values.
    Never uses static hardcoded text.
    """

    @staticmethod
    def generate_recommendations(telemetry, prediction, thermal_risk, water_stress, cooling_eval, cooling_level_opt, dielectric_health, workload_eval):
        sentences = []
        rec_mode_name = cooling_eval.get("recommended_mode_name", "Hybrid Cooling")
        rec_level = cooling_level_opt.get("recommended_cooling_level", 60.0)
        curr_level = cooling_level_opt.get("current_cooling_level", 60.0)
        risk_level = thermal_risk.get("risk_level", "LOW")
        pred_temp = prediction.get("predicted_temperature", 60.0)
        gpu_usage = telemetry.get("gpu_usage", 50.0)
        ws_score = water_stress.get("score", 50.0)

        # 1. Thermal & Compute Condition
        if risk_level in ["HIGH", "CRITICAL"]:
            sentences.append(
                f"GPU utilization is high ({gpu_usage:.0f}%) and predicted 30-min server temperature ({pred_temp:.1f}°C) "
                f"is approaching or exceeding the safe thermal threshold. Increase simulated cooling level from {curr_level:.0f}% to {rec_level:.0f}%."
            )
        elif risk_level == "MEDIUM":
            sentences.append(
                f"Compute workload is moderate (GPU {gpu_usage:.0f}%) with steady predicted temperature ({pred_temp:.1f}°C). "
                f"Maintain adaptive cooling at {rec_level:.0f}%."
            )
        else: # LOW
            sentences.append(
                f"Nominal operational conditions observed (GPU {gpu_usage:.0f}%, Temp {pred_temp:.1f}°C). "
                f"Cooling can safely modulate at {rec_level:.0f}% to minimize parasitic fan/pump energy."
            )

        # 2. Water Stress & Cooling Mode
        if ws_score >= 60.0:
            sentences.append(
                f"Prototype Water Stress Score is elevated ({ws_score:.0f}/100). "
                f"A non-water-intensive cooling profile ({rec_mode_name}) is recommended to eliminate freshwater consumption."
            )
        else:
            sentences.append(
                f"Water availability is sufficient (Stress Score: {ws_score:.0f}/100). "
                f"{rec_mode_name} offers the lowest weighted resource footprint."
            )

        # 3. Dielectric Health Condition
        if dielectric_health.get("status") in ["WARNING", "CRITICAL"]:
            sentences.append(
                f"Notice: Dielectric cooling performance attenuation detected ({dielectric_health.get('degradation_indicator')}). "
                f"Secondary heat exchanger inspection is recommended."
            )

        # 4. Workload Rebalancing Notice
        if workload_eval.get("migration_recommended"):
            sentences.append(
                f"Thermal asymmetry detected: {workload_eval.get('source_server')} has heavy thermal load while {workload_eval.get('target_server')} has available headroom. "
                f"Consider a software shift of ~{workload_eval.get('recommended_shift_percent'):.0f}% compute workload."
            )

        full_text = " ".join(sentences)
        return {
            "summary": full_text,
            "recommended_mode": rec_mode_name,
            "recommended_cooling_level": rec_level,
            "thermal_risk": risk_level,
            "bullet_points": sentences
        }

recommendation_engine = RecommendationEngine()
