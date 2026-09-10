# AI Smart Cooling Optimizer — API Reference Documentation

Complete API specification for the **AI-Based Water-Efficient Cooling Optimization for AI / Data-Center Infrastructure** prototype.

- **Base URL:** `http://localhost:5000`
- **Default Content-Type:** `application/json`
- **CORS:** Enabled for all origin clients (*)

---

## 1. GET `/api/telemetry`
Fetches the latest simulated server telemetry and recent 20-step historical time series.

- **Method:** `GET`
- **Query Parameters:** `server_id` (optional, default: `server_01`)
- **Headers:** None required
- **Sample Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "latest": {
      "timestamp": "2026-09-10 09:40:00",
      "server_id": "server_01",
      "cpu_usage": 87.2,
      "gpu_usage": 92.4,
      "memory_usage": 89.8,
      "server_load": 90.3,
      "gpu_temperature": 84.6,
      "server_temperature": 80.1,
      "ambient_temperature": 31.2,
      "humidity": 48.5,
      "power_consumption": 472.0,
      "cooling_level": 70.0,
      "water_availability": 14.5,
      "water_consumption": 2.24,
      "outside_temperature": 35.1,
      "cooling_efficiency": 0.95,
      "dielectric_temperature": 54.2,
      "dielectric_efficiency": 0.945
    },
    "history": [ ... ]
  }
}
```

---

## 2. POST `/api/predict`
Executes trained `RandomForestRegressor` models for 30-min horizon forecasting.

- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Sample Request Body:**
```json
{
  "cpu_usage": 87.0,
  "gpu_usage": 92.0,
  "memory_usage": 88.0,
  "server_load": 90.0,
  "power_consumption": 470.0,
  "server_temperature": 84.0,
  "ambient_temperature": 31.0,
  "humidity": 50.0,
  "cooling_level": 70.0,
  "dielectric_temperature": 55.0
}
```
- **Sample Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "predicted_temperature": 84.1,
    "predicted_workload": 88.0,
    "predicted_cooling_demand": 98.6,
    "prediction_horizon_minutes": 30,
    "confidence_score": 83.9,
    "prediction_variance_std": 1.896
  }
}
```

---

## 3. POST `/api/cooling-decision`
Evaluates all 4 cooling profiles against the thermal safety constraint and calculates candidate cooling levels.

- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Sample Request Body:**
```json
{
  "telemetry": {
    "server_load": 90.0,
    "server_temperature": 84.0,
    "cooling_level": 70.0
  },
  "prediction": {
    "predicted_temperature": 86.0
  },
  "water_stress": {
    "score": 85.0
  },
  "dielectric_health": {
    "status": "NORMAL"
  }
}
```
- **Sample Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "mode_decision": {
      "modes": [
        {
          "id": "air",
          "display_name": "Direct Air Cooling",
          "is_valid": false,
          "invalidation_reason": "Thermal safety limit violated: Direct air cooling cannot dissipate heat density when temperature (86.0C) exceeds 76C.",
          "score": 3.365
        },
        {
          "id": "water_evaporative",
          "display_name": "Water / Evaporative Cooling",
          "is_valid": true,
          "score": 5.569
        },
        {
          "id": "dielectric_immersion",
          "display_name": "Dielectric-Liquid Immersion Cooling",
          "is_valid": true,
          "score": 1.195
        },
        {
          "id": "hybrid",
          "display_name": "Intelligent Hybrid Cooling",
          "is_valid": true,
          "score": 2.350
        }
      ],
      "recommended_mode_id": "dielectric_immersion",
      "recommended_mode_name": "Dielectric-Liquid Immersion Cooling",
      "recommended_mode_score": 1.195,
      "selection_rationale": "Selected Dielectric-Liquid Immersion Cooling because it meets the thermal safety target (86.0C) while completely mitigating freshwater usage under elevated water stress (Score: 85)."
    },
    "level_optimization": {
      "current_cooling_level": 70.0,
      "recommended_cooling_level": 85.0,
      "predicted_temp_at_recommended": 78.4,
      "target_safe_temperature": 80.0,
      "reason": "Current cooling: 70% -> Recommended cooling: 85% — minimum simulated cooling level required to maintain configured thermal target (80.0C)."
    }
  }
}
```

---

## 4. GET `/api/liquid-health`
Simulated dielectric liquid immersion cooling health and degradation monitor.

- **Method:** `GET`
- **Sample Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "status": "NORMAL",
    "color": "green",
    "dielectric_temperature": 42.0,
    "dielectric_efficiency": 0.95,
    "performance_factor": 95.0,
    "thermal_delta": 18.0,
    "electrical_conductivity_category": "Ultra-Low / Dielectric Grade (< 10 pS/m, Nominal)",
    "degradation_indicator": "Optimal Fluid Dynamics",
    "maintenance_status": "System Operational (Nominal)",
    "recommendation": "Dielectric coolant circulation and heat transfer rates operating within nominal simulated parameters.",
    "alert_needed": false,
    "scientific_note": "Simulated thermal indicators only. No physical chemical or molecular diagnosis implied."
  }
}
```

---

## 5. GET `/api/dashboard`
Aggregated endpoint serving the React dashboard in a single request.

- **Method:** `GET`
- **Query Parameters:** `scenario` (optional), `server_id` (optional)
- **Sample Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "scenario": "normal",
    "telemetry": { ... },
    "prediction": { ... },
    "water_stress": { ... },
    "thermal_risk": { ... },
    "cooling_decision": { ... },
    "cooling_level_optimization": { ... },
    "dielectric_health": { ... },
    "workload_optimization": { ... },
    "savings": { ... },
    "recommendation": { ... },
    "alerts": [ ... ],
    "history": [ ... ],
    "simulation_state": {
      "current_cooling_mode": "hybrid",
      "current_cooling_level": 60.0,
      "label": "Simulation Only — No Real Hardware Control"
    }
  }
}
```

---

## 6. POST `/api/control/recommendation`
Simulated control panel endpoint to apply or switch cooling modes in software.

- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Sample Request Body:**
```json
{
  "action": "accept",
  "server_id": "server_01",
  "mode": "dielectric_immersion",
  "cooling_level": 85.0
}
```
- **Sample Response (200 OK):**
```json
{
  "status": "success",
  "message": "Simulation state updated: Applied recommended cooling mode (dielectric_immersion) and level (85%).",
  "data": {
    "server_id": "server_01",
    "current_cooling_mode": "dielectric_immersion",
    "current_cooling_level": 85.0,
    "simulation_notice": "Simulation Only — No physical equipment or industrial controllers affected."
  }
}
```

---

## 7. POST `/api/simulate`
Executes end-to-end dataflow pipeline for a selected operational scenario.

- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Sample Request Body:**
```json
{
  "scenario": "high_workload_water_stress",
  "server_id": "server_01"
}
```
- **Allowed Scenarios:**
  - `normal`
  - `low_workload`
  - `high_workload`
  - `high_workload_water_stress` (One-Click Demo)
  - `thermal_spike`
  - `dielectric_degradation`
  - `recovery`

---

## 8. GET `/api/alerts`
Retrieves system and thermal alerts recorded by the optimization engine.

- **Method:** `GET`
- **Sample Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "server_id": "server_01",
      "alert_type": "WATER_STRESS",
      "severity": "HIGH",
      "message": "Water Stress Alert: Local water stress score is 78/100. Water-intensive cooling restricted."
    }
  ]
}
```

---

## 9. GET `/api/water-saving`
Dynamic water resource conservation estimates against baseline evaporative cooling.

- **Method:** `GET`
- **Sample Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "baseline_liters_per_hour": 0.63,
    "optimized_liters_per_hour": 0.03,
    "saved_liters_per_hour": 0.60,
    "saved_liters_per_day": 14.4,
    "saving_percentage": 95.2,
    "label": "Estimated / Simulated / Potential Water Resource Saving",
    "disclaimer": "Simulated estimate based on conventional cooling-tower baseline; real facility water usage depends on complete central plant heat rejection architecture."
  }
}
```

---

## 10. GET `/api/energy-saving`
Dynamic cooling energy consumption reduction and PUE savings estimates.

- **Method:** `GET`
- **Sample Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "baseline_power_watts": 211.5,
    "optimized_power_watts": 124.6,
    "saved_power_watts": 86.9,
    "saved_kwh_per_day": 2.09,
    "saving_percentage": 41.1,
    "label": "Estimated / Simulated / Potential Cooling Energy Saving",
    "disclaimer": "Simulated energy savings model; actual data center energy savings vary with IT hardware and facility PUE."
  }
}
```

---

## 11. GET `/api/cooling-profiles`
Returns specifications for the 4 software cooling profiles.

- **Method:** `GET`
- **Sample Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "name": "air",
      "display_name": "Direct Air Cooling",
      "thermal_effectiveness": 0.65,
      "water_consumption_factor": 0.0,
      "energy_consumption_factor": 1.25,
      "min_operating_temp": 15.0,
      "max_operating_temp": 75.0,
      "suitability_description": "Suitable for low to moderate workloads and cooler ambient conditions. Zero freshwater consumption, but energy intensive at higher loads."
    }
  ]
}
```

---

## 12. POST `/api/workload-optimize`
Software recommendation engine for multi-server compute redistribution.

- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Sample Request Body:** `{}` (or custom multi-server dictionary)
- **Sample Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "migration_recommended": true,
    "source_server": "server_01",
    "target_server": "server_02",
    "recommended_shift_percent": 23.0,
    "estimated_temperature_relief_celsius": 6.4,
    "source_current_temp": 84.0,
    "source_current_gpu": 92.0,
    "target_current_temp": 58.0,
    "target_current_gpu": 40.0,
    "reason": "server_01 has high thermal load (84.0C, GPU 92%) while server_02 has spare capacity (58.0C, GPU 40%). Shifting simulated ~23% compute workload from server_01 to server_02 is projected to relieve ~6.4C thermal stress on server_01.",
    "simulation_label": "Software recommendation only (No real hardware migration)"
  }
}
```

---

## 13. GET & POST `/api/settings`
View and tune live thermal limits and multi-objective optimization weights.

- **GET `/api/settings`**: Returns current active configuration.
- **POST `/api/settings`**: Updates weights in runtime memory.
- **Sample POST Body:**
```json
{
  "safe_temp_limit": 82.0,
  "water_cost_weight": 0.50,
  "energy_cost_weight": 0.30
}
```

---

## 14. GET `/api/ml-metrics`
Returns honest, un-fabricated model evaluation metrics (MAE, RMSE, R2) computed directly during training on the test set.

- **Method:** `GET`
- **Sample Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "temperature_model": { "mae": 0.983, "rmse": 1.282, "r2": 0.9929 },
    "workload_model": { "mae": 4.093, "rmse": 5.148, "r2": 0.9271 },
    "cooling_demand_model": { "mae": 2.597, "rmse": 3.411, "r2": 0.9818 }
  }
}
```
