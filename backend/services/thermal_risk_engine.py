from config import Config

class ThermalRiskEngine:
    """
    Evaluates thermal risk against configurable limits.
    Labels clearly state thresholds are simulation demonstration parameters.
    """

    @staticmethod
    def evaluate_risk(current_temp, predicted_temp=None, safe_limit=None):
        safe_limit = safe_limit or Config.SAFE_TEMP_LIMIT
        low_thr = Config.TEMP_LOW_THRESHOLD
        med_thr = Config.TEMP_MEDIUM_THRESHOLD
        high_thr = Config.TEMP_HIGH_THRESHOLD

        effective_temp = max(float(current_temp), float(predicted_temp)) if predicted_temp else float(current_temp)

        if effective_temp < low_thr:
            risk = "LOW"
            color = "green"
            description = f"Temperature ({effective_temp:.1f}°C) is well within nominal thermal limits (< {low_thr}°C)."
        elif effective_temp < med_thr:
            risk = "MEDIUM"
            color = "yellow"
            description = f"Temperature ({effective_temp:.1f}°C) is elevated ({low_thr}-{med_thr}°C). Active thermal monitoring enabled."
        elif effective_temp < high_thr:
            risk = "HIGH"
            color = "orange"
            description = f"Temperature ({effective_temp:.1f}°C) is approaching safe threshold ({med_thr}-{high_thr}°C). Cooling escalation advised."
        else:
            risk = "CRITICAL"
            color = "red"
            description = f"Temperature ({effective_temp:.1f}°C) has reached or exceeded critical safety limit (> {high_thr}°C). Maximum cooling and workload shifting required."

        is_above_safe_limit = effective_temp > safe_limit

        return {
            "risk_level": risk,
            "color": color,
            "effective_temperature": round(effective_temp, 1),
            "safe_temperature_limit": round(safe_limit, 1),
            "is_above_safe_limit": is_above_safe_limit,
            "description": description
        }

thermal_risk_engine = ThermalRiskEngine()
