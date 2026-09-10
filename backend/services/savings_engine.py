from config import Config

class SavingsEngine:
    """
    Calculates dynamic water and energy savings against legacy baseline operations.
    All outputs are explicitly labeled 'Estimated / Simulated / Potential'.
    """

    @staticmethod
    def calculate_savings(telemetry, recommended_mode_id, recommended_cooling_level, water_stress_score):
        power_w = float(telemetry.get("power_consumption", 350.0))
        power_kw = power_w / 1000.0
        rec_cooling = float(recommended_cooling_level) / 100.0

        # --- 1. WATER RESOURCE EFFICIENCY ---
        # Baseline: Traditional wet cooling tower / evaporative baseline (~1.8 L per kWh of thermal heat rejection)
        baseline_water_hourly = round(power_kw * Config.BASELINE_WATER_RATE * max(0.4, rec_cooling), 2)
        
        # Profile factor for recommended mode
        profile_factor = Config.COOLING_PROFILES.get(recommended_mode_id, {}).get("water_consumption_factor", 0.05)
        
        # Optimized water usage
        optimized_water_hourly = round(baseline_water_hourly * profile_factor, 2)
        water_saved_hourly = round(max(0.0, baseline_water_hourly - optimized_water_hourly), 2)
        
        if baseline_water_hourly > 0:
            water_saving_pct = round((water_saved_hourly / baseline_water_hourly) * 100.0, 1)
        else:
            water_saving_pct = 0.0

        # Project 24-hour simulated savings
        water_saved_daily = round(water_saved_hourly * 24.0, 1)

        # --- 2. ENERGY EFFICIENCY ---
        # Baseline legacy facility cooling overhead (PUE 1.45 means cooling overhead is 0.45 * IT power)
        baseline_cooling_power_w = power_w * (Config.BASELINE_ENERGY_PUE - 1.0)
        
        # Mode energy multiplier
        energy_factor = Config.COOLING_PROFILES.get(recommended_mode_id, {}).get("energy_consumption_factor", 0.65)
        optimized_cooling_power_w = baseline_cooling_power_w * energy_factor * (rec_cooling / 0.70)
        optimized_cooling_power_w = round(max(20.0, optimized_cooling_power_w), 1)
        
        energy_saved_w = round(max(0.0, baseline_cooling_power_w - optimized_cooling_power_w), 1)
        if baseline_cooling_power_w > 0:
            energy_saving_pct = round((energy_saved_w / baseline_cooling_power_w) * 100.0, 1)
        else:
            energy_saving_pct = 0.0

        daily_kwh_saved = round((energy_saved_w * 24.0) / 1000.0, 2)

        return {
            "water": {
                "baseline_liters_per_hour": baseline_water_hourly,
                "optimized_liters_per_hour": optimized_water_hourly,
                "saved_liters_per_hour": water_saved_hourly,
                "saved_liters_per_day": water_saved_daily,
                "saving_percentage": water_saving_pct,
                "label": "Estimated / Simulated / Potential Water Resource Saving",
                "disclaimer": "Simulated estimate based on conventional cooling-tower baseline; real facility water usage depends on complete central plant heat rejection architecture."
            },
            "energy": {
                "baseline_power_watts": round(baseline_cooling_power_w, 1),
                "optimized_power_watts": optimized_cooling_power_w,
                "saved_power_watts": energy_saved_w,
                "saved_kwh_per_day": daily_kwh_saved,
                "saving_percentage": energy_saving_pct,
                "label": "Estimated / Simulated / Potential Cooling Energy Saving",
                "disclaimer": "Simulated energy savings model; actual data center energy savings vary with IT hardware and facility PUE."
            }
        }

savings_engine = SavingsEngine()
