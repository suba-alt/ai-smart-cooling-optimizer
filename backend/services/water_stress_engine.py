from config import Config

class WaterStressEngine:
    """
    Computes a normalized Prototype Water Stress Score (0–100).
    Higher score instructs the cooling decision engine to penalize water-intensive modes.
    Note: Explicitly labeled as a Prototype Water Stress Score for simulation testing,
    not an official real-world index.
    """

    @staticmethod
    def calculate_water_stress(telemetry, predicted_demand=50.0):
        water_availability = float(telemetry.get("water_availability", 80.0))
        water_consumption = float(telemetry.get("water_consumption", 2.0))
        ambient_temp = float(telemetry.get("ambient_temperature", 25.0))
        outside_temp = float(telemetry.get("outside_temperature", 28.0))
        humidity = float(telemetry.get("humidity", 50.0))

        # 1. Scarcity Factor (0 - 100): Lower availability = higher stress
        scarcity_factor = max(0.0, min(100.0, 100.0 - water_availability))

        # 2. Consumption Pressure Factor (0 - 100): Normalized against peak rate (15 L/min)
        consumption_factor = max(0.0, min(100.0, (water_consumption / 15.0) * 100.0))

        # 3. Demand Pressure Factor (0 - 100): From AI predicted cooling demand
        demand_factor = max(0.0, min(100.0, float(predicted_demand)))

        # 4. Regional Climate Heat / Dryness Factor (0 - 100)
        # Higher outside temp and lower humidity exacerbate evaporative cooling stress
        heat_penalty = max(0.0, min(50.0, (outside_temp - 20.0) * 2.5))
        dryness_penalty = max(0.0, min(50.0, (60.0 - humidity) * 1.25))
        climate_factor = max(0.0, min(100.0, heat_penalty + dryness_penalty))

        # Weighted combination:
        # 40% availability scarcity + 25% predicted demand + 20% climate stress + 15% current consumption
        raw_score = (
            0.40 * scarcity_factor +
            0.25 * demand_factor +
            0.20 * climate_factor +
            0.15 * consumption_factor
        )

        water_stress_score = round(max(0.0, min(100.0, raw_score)), 1)

        # Categorize stress severity
        if water_stress_score < 30.0:
            stress_level = "LOW"
            color = "green"
            description = "Abundant freshwater availability. Standard evaporative cooling permitted if thermal demands require it."
        elif water_stress_score < 60.0:
            stress_level = "MODERATE"
            color = "yellow"
            description = "Moderate water supply constraints. Favor hybrid or dielectric cooling where thermal constraints allow."
        elif water_stress_score < 80.0:
            stress_level = "HIGH"
            color = "orange"
            description = "Significant regional water stress. Evaporative cooling penalized; prioritizing closed-loop dielectric/hybrid profiles."
        else:
            stress_level = "CRITICAL"
            color = "red"
            description = "Critical water deficit. Evaporative freshwater cooling strongly penalized to preserve regional water reserves."

        return {
            "score": water_stress_score,
            "level": stress_level,
            "color": color,
            "description": description,
            "factors": {
                "scarcity_factor": round(scarcity_factor, 1),
                "demand_factor": round(demand_factor, 1),
                "climate_factor": round(climate_factor, 1),
                "consumption_factor": round(consumption_factor, 1)
            },
            "disclaimer": "Prototype Water Stress Score (Simulated index for optimization research; not an official index)"
        }

water_stress_engine = WaterStressEngine()
