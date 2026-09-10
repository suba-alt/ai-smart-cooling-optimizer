class WorkloadEngine:
    """
    Analyzes multi-server thermal and compute load distributions.
    Generates dynamic software workload-rebalancing recommendations.
    Strictly software simulation: no real migration or physical hardware changes.
    """

    @staticmethod
    def evaluate_workload_distribution(servers_telemetry):
        # servers_telemetry is a dict: {'server_01': {...}, 'server_02': {...}, ...}
        if not servers_telemetry or len(servers_telemetry) < 2:
            return {
                "migration_recommended": False,
                "message": "Insufficient server cluster nodes available for rebalancing evaluation."
            }

        # Find hottest / highest-load server
        sorted_by_stress = sorted(
            servers_telemetry.items(),
            key=lambda x: (
                float(x[1].get("server_temperature", 50.0)) * 0.6 +
                float(x[1].get("gpu_usage", 50.0)) * 0.4
            ),
            reverse=True
        )

        source_id, source_data = sorted_by_stress[0]
        target_id, target_data = sorted_by_stress[-1]

        source_temp = float(source_data.get("server_temperature", 60.0))
        source_gpu = float(source_data.get("gpu_usage", 50.0))
        target_temp = float(target_data.get("server_temperature", 50.0))
        target_gpu = float(target_data.get("gpu_usage", 30.0))

        temp_delta = source_temp - target_temp
        gpu_delta = source_gpu - target_gpu

        # Rebalancing threshold: source temp > 78°C or source GPU > 80% with delta >= 20%
        if (source_temp >= 78.0 or source_gpu >= 80.0) and (gpu_delta >= 25.0 or temp_delta >= 12.0):
            # Compute recommended shift percentage (e.g., 15% - 35%)
            shift_percent = round(min(40.0, max(15.0, gpu_delta * 0.45)), 0)
            est_temp_relief = round(shift_percent * 0.28, 1)

            reason = (
                f"{source_id} has high thermal load ({source_temp:.1f}°C, GPU {source_gpu:.0f}%) "
                f"while {target_id} has spare capacity ({target_temp:.1f}°C, GPU {target_gpu:.0f}%). "
                f"Shifting simulated ~{shift_percent:.0f}% compute workload from {source_id} to {target_id} "
                f"is projected to relieve ~{est_temp_relief:.1f}°C thermal stress on {source_id}."
            )

            return {
                "migration_recommended": True,
                "source_server": source_id,
                "target_server": target_id,
                "recommended_shift_percent": shift_percent,
                "estimated_temperature_relief_celsius": est_temp_relief,
                "source_current_temp": source_temp,
                "source_current_gpu": source_gpu,
                "target_current_temp": target_temp,
                "target_current_gpu": target_gpu,
                "reason": reason,
                "simulation_label": "Software recommendation only (No real hardware migration)"
            }
        else:
            return {
                "migration_recommended": False,
                "source_server": source_id,
                "target_server": target_id,
                "recommended_shift_percent": 0.0,
                "reason": f"Cluster load is sufficiently balanced ({source_id} at {source_temp:.1f}°C vs {target_id} at {target_temp:.1f}°C). No workload reallocation needed.",
                "simulation_label": "Software recommendation only"
            }

workload_engine = WorkloadEngine()
