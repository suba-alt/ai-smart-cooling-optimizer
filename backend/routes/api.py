from flask import Blueprint, request, jsonify
from config import Config
from db import db
from simulation.simulator import simulator
from ml.prediction_service import prediction_service
from services.water_stress_engine import water_stress_engine
from services.thermal_risk_engine import thermal_risk_engine
from services.cooling_decision_engine import cooling_decision_engine
from services.dielectric_health_engine import dielectric_health_engine
from services.workload_engine import workload_engine
from services.savings_engine import savings_engine
from services.recommendation_engine import recommendation_engine

api_bp = Blueprint("api", __name__, url_prefix="/api")

# In-memory settings state allowing live tuning without restarting
runtime_settings = {
    "safe_temp_limit": Config.SAFE_TEMP_LIMIT,
    "water_cost_weight": Config.WATER_COST_WEIGHT,
    "energy_cost_weight": Config.ENERGY_COST_WEIGHT,
    "cooling_effectiveness_weight": Config.COOLING_EFFECTIVENESS_WEIGHT,
    "water_stress_penalty_weight": Config.WATER_STRESS_PENALTY_WEIGHT
}

def run_pipeline(scenario="normal", server_id="server_01", save_to_db=True):
    """
    Executes the complete end-to-end dataflow pipeline:
    DATA -> AI PREDICTION -> WATER STRESS -> COOLING OPTIMIZATION ->
    DIELECTRIC HEALTH -> WORKLOAD RECOMMENDATION -> RESOURCE/ENERGY ESTIMATION -> ALERTS
    """
    # 1. Telemetry Generation / Retrieval
    simulator.set_scenario(scenario)
    servers_data = simulator.generate_all_servers(scenario=scenario)
    primary_telemetry = servers_data.get(server_id, servers_data["server_01"])

    # 2. AI Predictions (30-min horizon)
    prediction = prediction_service.predict_conditions(primary_telemetry)

    # 3. Water Stress Calculation
    water_stress = water_stress_engine.calculate_water_stress(
        primary_telemetry,
        predicted_demand=prediction.get("predicted_cooling_demand", 50.0)
    )

    # 4. Thermal Risk Evaluation
    thermal_risk = thermal_risk_engine.evaluate_risk(
        primary_telemetry.get("server_temperature", 60.0),
        predicted_temp=prediction.get("predicted_temperature", 65.0),
        safe_limit=runtime_settings["safe_temp_limit"]
    )

    # 5. Dielectric Health Evaluation
    dielectric_health = dielectric_health_engine.evaluate_health(primary_telemetry)

    # 6. Cooling Mode & Level Optimization
    custom_weights = {
        "water_cost_weight": runtime_settings["water_cost_weight"],
        "energy_cost_weight": runtime_settings["energy_cost_weight"],
        "cooling_effectiveness_weight": runtime_settings["cooling_effectiveness_weight"],
        "water_stress_penalty_weight": runtime_settings["water_stress_penalty_weight"]
    }
    cooling_decision = cooling_decision_engine.evaluate_cooling_modes(
        primary_telemetry,
        prediction,
        water_stress["score"],
        dielectric_health,
        custom_weights=custom_weights,
        safe_limit=runtime_settings["safe_temp_limit"]
    )
    cooling_level_opt = cooling_decision_engine.optimize_cooling_level(
        primary_telemetry,
        safe_limit=runtime_settings["safe_temp_limit"]
    )

    # 7. Multi-Server Workload Distribution
    workload_eval = workload_engine.evaluate_workload_distribution(servers_data)

    # 8. Dynamic Resource & Energy Savings
    savings = savings_engine.calculate_savings(
        primary_telemetry,
        cooling_decision["recommended_mode_id"],
        cooling_level_opt["recommended_cooling_level"],
        water_stress["score"]
    )

    # 9. Natural Language Recommendation Synthesis
    rec_synthesis = recommendation_engine.generate_recommendations(
        primary_telemetry,
        prediction,
        thermal_risk,
        water_stress,
        cooling_decision,
        cooling_level_opt,
        dielectric_health,
        workload_eval
    )

    # 10. Generate System Alerts where required
    alerts = []
    if thermal_risk["risk_level"] in ["HIGH", "CRITICAL"]:
        alerts.append({
            "server_id": server_id,
            "alert_type": "THERMAL_WARNING",
            "severity": thermal_risk["risk_level"],
            "message": f"Thermal Alert: Server temperature is {thermal_risk['effective_temperature']}°C ({thermal_risk['risk_level']}). Target limit is {runtime_settings['safe_temp_limit']}°C."
        })
    if water_stress["level"] in ["HIGH", "CRITICAL"]:
        alerts.append({
            "server_id": server_id,
            "alert_type": "WATER_STRESS",
            "severity": water_stress["level"],
            "message": f"Water Stress Alert: Local water stress score is {water_stress['score']}/100. Water-intensive cooling restricted."
        })
    if dielectric_health["alert_needed"]:
        alerts.append({
            "server_id": server_id,
            "alert_type": "COOLING_DEGRADATION",
            "severity": dielectric_health["status"],
            "message": dielectric_health["recommendation"]
        })

    # Save to database if requested
    if save_to_db:
        try:
            db.execute_insert("server_metrics", primary_telemetry)
            db.execute_insert("predictions", {
                "timestamp": primary_telemetry["timestamp"],
                "server_id": server_id,
                "predicted_temperature": prediction["predicted_temperature"],
                "predicted_workload": prediction["predicted_workload"],
                "predicted_cooling_demand": prediction["predicted_cooling_demand"],
                "prediction_horizon_minutes": prediction["prediction_horizon_minutes"],
                "confidence_score": prediction["confidence_score"]
            })
            db.execute_insert("recommendations", {
                "timestamp": primary_telemetry["timestamp"],
                "server_id": server_id,
                "current_cooling_mode": simulator.server_states[server_id]["cooling_mode"],
                "recommended_cooling_mode": cooling_decision["recommended_mode_id"],
                "current_cooling_level": cooling_level_opt["current_cooling_level"],
                "recommended_cooling_level": cooling_level_opt["recommended_cooling_level"],
                "thermal_risk": thermal_risk["risk_level"],
                "recommendation_text": rec_synthesis["summary"],
                "reason": cooling_decision["selection_rationale"]
            })
            db.execute_insert("water_savings", {
                "timestamp": primary_telemetry["timestamp"],
                "baseline_water_consumption": savings["water"]["baseline_liters_per_hour"],
                "optimized_water_consumption": savings["water"]["optimized_liters_per_hour"],
                "water_saved": savings["water"]["saved_liters_per_hour"],
                "saving_percentage": savings["water"]["saving_percentage"],
                "water_stress_score": water_stress["score"]
            })
            db.execute_insert("energy_savings", {
                "timestamp": primary_telemetry["timestamp"],
                "baseline_energy_consumption": savings["energy"]["baseline_power_watts"],
                "optimized_energy_consumption": savings["energy"]["optimized_power_watts"],
                "energy_saved": savings["energy"]["saved_power_watts"],
                "saving_percentage": savings["energy"]["saving_percentage"]
            })
            for a in alerts:
                db.execute_insert("alerts", a)
        except Exception as e:
            print(f"[Pipeline Notice] DB logging notice: {e}")

    # History for charts
    history = simulator.generate_historical_series(server_id=server_id, count=20)

    return {
        "scenario": scenario,
        "telemetry": primary_telemetry,
        "all_servers": servers_data,
        "prediction": prediction,
        "water_stress": water_stress,
        "thermal_risk": thermal_risk,
        "cooling_decision": cooling_decision,
        "cooling_level_optimization": cooling_level_opt,
        "dielectric_health": dielectric_health,
        "workload_optimization": workload_eval,
        "savings": savings,
        "recommendation": rec_synthesis,
        "alerts": alerts,
        "history": history,
        "simulation_state": {
            "current_cooling_mode": simulator.server_states.get(server_id, {}).get("cooling_mode", "hybrid"),
            "current_cooling_level": simulator.server_states.get(server_id, {}).get("cooling_level", 60.0),
            "label": "Simulation Only — No Real Hardware Control"
        }
    }

# ----------------- 1. GET /api/telemetry -----------------
@api_bp.route("/telemetry", methods=["GET"])
def get_telemetry():
    server_id = request.args.get("server_id", "server_01")
    telemetry = simulator.generate_server_record(server_id=server_id)
    history = simulator.generate_historical_series(server_id=server_id, count=20)
    return jsonify({
        "status": "success",
        "data": {
            "latest": telemetry,
            "history": history
        }
    })

# ----------------- 2. POST /api/predict -----------------
@api_bp.route("/predict", methods=["POST"])
def post_predict():
    payload = request.get_json() or {}
    prediction = prediction_service.predict_conditions(payload)
    return jsonify({
        "status": "success",
        "data": prediction
    })

# ----------------- 3. POST /api/cooling-decision -----------------
@api_bp.route("/cooling-decision", methods=["POST"])
def post_cooling_decision():
    payload = request.get_json() or {}
    telemetry = payload.get("telemetry", simulator.generate_server_record())
    prediction = payload.get("prediction") or prediction_service.predict_conditions(telemetry)
    water_stress = payload.get("water_stress") or water_stress_engine.calculate_water_stress(telemetry)
    dielectric = payload.get("dielectric_health") or dielectric_health_engine.evaluate_health(telemetry)
    
    decision = cooling_decision_engine.evaluate_cooling_modes(
        telemetry,
        prediction,
        water_stress.get("score", 50.0),
        dielectric,
        safe_limit=runtime_settings["safe_temp_limit"]
    )
    level_opt = cooling_decision_engine.optimize_cooling_level(
        telemetry,
        safe_limit=runtime_settings["safe_temp_limit"]
    )

    return jsonify({
        "status": "success",
        "data": {
            "mode_decision": decision,
            "level_optimization": level_opt
        }
    })

# ----------------- 4. GET /api/liquid-health -----------------
@api_bp.route("/liquid-health", methods=["GET"])
def get_liquid_health():
    telemetry = simulator.generate_server_record()
    health = dielectric_health_engine.evaluate_health(telemetry)
    return jsonify({
        "status": "success",
        "data": health
    })

# ----------------- 5. GET /api/dashboard -----------------
@api_bp.route("/dashboard", methods=["GET"])
def get_dashboard():
    scenario = request.args.get("scenario", simulator.current_scenario)
    server_id = request.args.get("server_id", "server_01")
    dashboard_data = run_pipeline(scenario=scenario, server_id=server_id, save_to_db=False)
    return jsonify({
        "status": "success",
        "data": dashboard_data
    })

# ----------------- 6. POST /api/control/recommendation -----------------
@api_bp.route("/control/recommendation", methods=["POST"])
def post_control_recommendation():
    payload = request.get_json() or {}
    action = payload.get("action", "accept") # accept | switch_mode
    server_id = payload.get("server_id", "server_01")
    target_mode = payload.get("mode")
    target_level = payload.get("cooling_level")

    if server_id not in simulator.server_states:
        simulator.server_states[server_id] = {"cooling_mode": "hybrid", "cooling_level": 60.0}

    if action == "accept":
        if target_mode:
            simulator.server_states[server_id]["cooling_mode"] = target_mode
        if target_level is not None:
            simulator.server_states[server_id]["cooling_level"] = float(target_level)
        message = f"Simulation state updated: Applied recommended cooling mode ({target_mode}) and level ({target_level}%)."
    elif action == "switch_mode":
        if target_mode:
            simulator.server_states[server_id]["cooling_mode"] = target_mode
        message = f"Simulation state updated: Switched cooling mode to {target_mode}."
    else:
        message = "Simulation state unchanged."

    return jsonify({
        "status": "success",
        "message": message,
        "data": {
            "server_id": server_id,
            "current_cooling_mode": simulator.server_states[server_id]["cooling_mode"],
            "current_cooling_level": simulator.server_states[server_id]["cooling_level"],
            "simulation_notice": "Simulation Only — No physical equipment or industrial controllers affected."
        }
    })

# ----------------- 7. POST /api/simulate -----------------
@api_bp.route("/simulate", methods=["POST"])
def post_simulate():
    payload = request.get_json() or {}
    scenario = payload.get("scenario", "normal")
    server_id = payload.get("server_id", "server_01")
    if scenario not in simulator.SCENARIOS:
        return jsonify({
            "status": "error",
            "message": f"Invalid scenario '{scenario}'. Allowed scenarios: {simulator.SCENARIOS}"
        }), 400

    result = run_pipeline(scenario=scenario, server_id=server_id, save_to_db=True)
    return jsonify({
        "status": "success",
        "message": f"Simulation executed successfully for scenario '{scenario}'.",
        "data": result
    })

# ----------------- 8. GET /api/alerts -----------------
@api_bp.route("/alerts", methods=["GET"])
def get_alerts():
    db_alerts = db.get_recent_alerts(limit=15)
    return jsonify({
        "status": "success",
        "data": db_alerts
    })

# ----------------- 9. GET /api/water-saving -----------------
@api_bp.route("/water-saving", methods=["GET"])
def get_water_saving():
    telemetry = simulator.generate_server_record()
    savings = savings_engine.calculate_savings(telemetry, "dielectric_immersion", 70.0, 50.0)
    return jsonify({
        "status": "success",
        "data": savings["water"]
    })

# ----------------- 10. GET /api/energy-saving -----------------
@api_bp.route("/energy-saving", methods=["GET"])
def get_energy_saving():
    telemetry = simulator.generate_server_record()
    savings = savings_engine.calculate_savings(telemetry, "dielectric_immersion", 70.0, 50.0)
    return jsonify({
        "status": "success",
        "data": savings["energy"]
    })

# ----------------- 11. GET /api/cooling-profiles -----------------
@api_bp.route("/cooling-profiles", methods=["GET"])
def get_cooling_profiles():
    profiles = db.get_cooling_profiles()
    return jsonify({
        "status": "success",
        "data": profiles
    })

# ----------------- 12. POST /api/workload-optimize -----------------
@api_bp.route("/workload-optimize", methods=["POST"])
def post_workload_optimize():
    payload = request.get_json()
    if not payload:
        payload = simulator.generate_all_servers()
    eval_result = workload_engine.evaluate_workload_distribution(payload)
    return jsonify({
        "status": "success",
        "data": eval_result
    })

# ----------------- Settings Endpoints -----------------
@api_bp.route("/settings", methods=["GET"])
def get_settings():
    return jsonify({
        "status": "success",
        "data": runtime_settings
    })

@api_bp.route("/settings", methods=["POST"])
def update_settings():
    payload = request.get_json() or {}
    for k in runtime_settings.keys():
        if k in payload:
            runtime_settings[k] = float(payload[k])
    return jsonify({
        "status": "success",
        "message": "Settings updated successfully.",
        "data": runtime_settings
    })

# ----------------- ML Metrics Endpoint -----------------
@api_bp.route("/ml-metrics", methods=["GET"])
def get_ml_metrics():
    metrics = prediction_service.get_metrics()
    return jsonify({
        "status": "success",
        "data": metrics
    })
