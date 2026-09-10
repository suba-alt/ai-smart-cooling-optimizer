import time
import random
import math
from datetime import datetime, timezone, timedelta

class TelemetrySimulator:
    """
    Physics-grounded telemetry simulator for data-center and AI server racks.
    Generates meaningful, correlated thermal and resource metrics across 7 scenarios.
    """

    SCENARIOS = [
        "normal",
        "low_workload",
        "high_workload",
        "high_workload_water_stress",
        "thermal_spike",
        "dielectric_degradation",
        "recovery"
    ]

    def __init__(self):
        self.current_scenario = "normal"
        self.server_states = {
            "server_01": {"cooling_mode": "hybrid", "cooling_level": 60.0},
            "server_02": {"cooling_mode": "air", "cooling_level": 40.0},
            "server_03": {"cooling_mode": "dielectric_immersion", "cooling_level": 35.0}
        }

    def set_scenario(self, scenario_name):
        if scenario_name in self.SCENARIOS:
            self.current_scenario = scenario_name
            return True
        return False

    def generate_server_record(self, server_id="server_01", scenario=None, timestamp=None, cooling_override=None, mode_override=None):
        scenario = scenario or self.current_scenario
        ts = timestamp or datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

        curr_cooling = cooling_override if cooling_override is not None else self.server_states.get(server_id, {}).get("cooling_level", 55.0)
        curr_mode = mode_override if mode_override is not None else self.server_states.get(server_id, {}).get("cooling_mode", "hybrid")

        if scenario == "low_workload":
            if server_id == "server_01":
                gpu_usage = random.uniform(18.0, 28.0)
                cpu_usage = random.uniform(15.0, 25.0)
                ambient_temp = random.uniform(21.0, 23.0)
                water_avail = random.uniform(85.0, 95.0)
                dielectric_degrade = False
            elif server_id == "server_02":
                gpu_usage = random.uniform(10.0, 20.0)
                cpu_usage = random.uniform(12.0, 22.0)
                ambient_temp = 22.0
                water_avail = 90.0
                dielectric_degrade = False
            else:
                gpu_usage = random.uniform(5.0, 15.0)
                cpu_usage = random.uniform(8.0, 15.0)
                ambient_temp = 21.5
                water_avail = 90.0
                dielectric_degrade = False

        elif scenario == "high_workload":
            if server_id == "server_01":
                gpu_usage = random.uniform(88.0, 94.0)
                cpu_usage = random.uniform(82.0, 90.0)
                ambient_temp = random.uniform(27.0, 29.5)
                water_avail = random.uniform(70.0, 80.0)
                dielectric_degrade = False
            elif server_id == "server_02":
                gpu_usage = random.uniform(35.0, 45.0)
                cpu_usage = random.uniform(30.0, 42.0)
                ambient_temp = 26.0
                water_avail = 75.0
                dielectric_degrade = False
            else:
                gpu_usage = random.uniform(20.0, 30.0)
                cpu_usage = random.uniform(20.0, 28.0)
                ambient_temp = 25.0
                water_avail = 75.0
                dielectric_degrade = False

        elif scenario == "high_workload_water_stress":
            if server_id == "server_01":
                gpu_usage = random.uniform(91.0, 93.5)
                cpu_usage = random.uniform(86.0, 89.0)
                ambient_temp = random.uniform(30.5, 32.0)
                water_avail = random.uniform(12.0, 18.0)
                dielectric_degrade = False
            elif server_id == "server_02":
                gpu_usage = random.uniform(38.0, 48.0)
                cpu_usage = random.uniform(35.0, 45.0)
                ambient_temp = 30.0
                water_avail = random.uniform(12.0, 18.0)
                dielectric_degrade = False
            else:
                gpu_usage = random.uniform(15.0, 25.0)
                cpu_usage = random.uniform(18.0, 26.0)
                ambient_temp = 29.5
                water_avail = random.uniform(12.0, 18.0)
                dielectric_degrade = False

        elif scenario == "thermal_spike":
            if server_id == "server_01":
                gpu_usage = random.uniform(96.0, 99.0)
                cpu_usage = random.uniform(92.0, 97.0)
                ambient_temp = random.uniform(32.5, 34.5)
                water_avail = random.uniform(50.0, 65.0)
                dielectric_degrade = False
            elif server_id == "server_02":
                gpu_usage = random.uniform(40.0, 50.0)
                cpu_usage = random.uniform(38.0, 48.0)
                ambient_temp = 31.0
                water_avail = 60.0
                dielectric_degrade = False
            else:
                gpu_usage = random.uniform(25.0, 35.0)
                cpu_usage = random.uniform(22.0, 30.0)
                ambient_temp = 30.0
                water_avail = 60.0
                dielectric_degrade = False

        elif scenario == "dielectric_degradation":
            if server_id == "server_01":
                gpu_usage = random.uniform(72.0, 78.0)
                cpu_usage = random.uniform(68.0, 74.0)
                ambient_temp = random.uniform(25.0, 27.0)
                water_avail = random.uniform(55.0, 70.0)
                dielectric_degrade = True
            elif server_id == "server_02":
                gpu_usage = random.uniform(45.0, 55.0)
                cpu_usage = random.uniform(40.0, 50.0)
                ambient_temp = 25.0
                water_avail = 65.0
                dielectric_degrade = False
            else:
                gpu_usage = random.uniform(30.0, 40.0)
                cpu_usage = random.uniform(25.0, 35.0)
                ambient_temp = 24.5
                water_avail = 65.0
                dielectric_degrade = False

        elif scenario == "recovery":
            if server_id == "server_01":
                gpu_usage = random.uniform(38.0, 48.0)
                cpu_usage = random.uniform(35.0, 45.0)
                ambient_temp = random.uniform(23.0, 25.0)
                water_avail = random.uniform(75.0, 85.0)
                dielectric_degrade = False
            elif server_id == "server_02":
                gpu_usage = random.uniform(30.0, 40.0)
                cpu_usage = random.uniform(28.0, 36.0)
                ambient_temp = 23.5
                water_avail = 80.0
                dielectric_degrade = False
            else:
                gpu_usage = random.uniform(20.0, 30.0)
                cpu_usage = random.uniform(18.0, 26.0)
                ambient_temp = 23.0
                water_avail = 80.0
                dielectric_degrade = False

        else: # normal
            if server_id == "server_01":
                gpu_usage = random.uniform(52.0, 68.0)
                cpu_usage = random.uniform(48.0, 62.0)
                ambient_temp = random.uniform(23.5, 25.5)
                water_avail = random.uniform(78.0, 88.0)
                dielectric_degrade = False
            elif server_id == "server_02":
                gpu_usage = random.uniform(40.0, 55.0)
                cpu_usage = random.uniform(38.0, 50.0)
                ambient_temp = 24.0
                water_avail = 82.0
                dielectric_degrade = False
            else:
                gpu_usage = random.uniform(25.0, 38.0)
                cpu_usage = random.uniform(22.0, 35.0)
                ambient_temp = 23.5
                water_avail = 85.0
                dielectric_degrade = False

        memory_usage = round(0.5 * cpu_usage + 0.5 * gpu_usage + random.uniform(-3.0, 3.0), 1)
        memory_usage = max(10.0, min(99.0, memory_usage))

        server_load = round(0.6 * gpu_usage + 0.4 * cpu_usage, 1)
        power_consumption = round(120.0 + (server_load / 100.0) * 360.0 + (gpu_usage / 100.0) * 80.0 + random.uniform(-8.0, 8.0), 1)

        outside_temp = round(ambient_temp + random.uniform(2.0, 6.0), 1)
        humidity = round(random.uniform(42.0, 58.0), 1)

        if dielectric_degrade:
            dielectric_efficiency = round(random.uniform(0.68, 0.74), 3)
            dielectric_temp = round(58.0 + (server_load / 100.0) * 16.0 + random.uniform(1.0, 3.0), 1)
        else:
            dielectric_efficiency = round(random.uniform(0.93, 0.98), 3)
            dielectric_temp = round(34.0 + (server_load / 100.0) * 20.0 - (curr_cooling / 100.0) * 8.0 + random.uniform(-1.0, 1.5), 1)

        base_cooling_efficiency = 0.88 if not dielectric_degrade else 0.70
        cooling_efficiency = round(base_cooling_efficiency + (curr_cooling / 100.0) * 0.10 + random.uniform(-0.02, 0.02), 3)

        thermal_generation = (power_consumption - 120.0) * 0.14
        cooling_mitigation = (curr_cooling / 100.0) * (34.0 * cooling_efficiency)
        ambient_penalty = (ambient_temp - 22.0) * 0.85

        gpu_temperature = round(38.0 + thermal_generation - cooling_mitigation + ambient_penalty + random.uniform(-0.8, 1.2), 1)
        server_temperature = round(gpu_temperature - random.uniform(3.5, 6.0), 1)

        gpu_temperature = max(35.0, min(99.0, gpu_temperature))
        server_temperature = max(32.0, min(94.0, server_temperature))

        if curr_mode == "water_evaporative":
            water_consumption = round((curr_cooling / 100.0) * 12.5 + random.uniform(0.2, 1.0), 2)
        elif curr_mode == "hybrid":
            water_consumption = round((curr_cooling / 100.0) * 3.2 + random.uniform(0.1, 0.4), 2)
        elif curr_mode == "dielectric_immersion":
            water_consumption = round((curr_cooling / 100.0) * 0.6 + random.uniform(0.01, 0.08), 2)
        else: # air
            water_consumption = 0.0

        return {
            "timestamp": ts,
            "server_id": server_id,
            "cpu_usage": round(cpu_usage, 1),
            "gpu_usage": round(gpu_usage, 1),
            "memory_usage": memory_usage,
            "server_load": server_load,
            "gpu_temperature": gpu_temperature,
            "server_temperature": server_temperature,
            "ambient_temperature": round(ambient_temp, 1),
            "humidity": humidity,
            "power_consumption": power_consumption,
            "cooling_level": round(curr_cooling, 1),
            "water_availability": round(water_avail, 1),
            "water_consumption": water_consumption,
            "outside_temperature": outside_temp,
            "cooling_efficiency": cooling_efficiency,
            "dielectric_temperature": dielectric_temp,
            "dielectric_efficiency": dielectric_efficiency
        }

    def generate_all_servers(self, scenario=None):
        scenario = scenario or self.current_scenario
        records = {}
        for s_id in ["server_01", "server_02", "server_03"]:
            records[s_id] = self.generate_server_record(server_id=s_id, scenario=scenario)
        return records

    def generate_historical_series(self, server_id="server_01", count=25, interval_seconds=120):
        records = []
        now = datetime.now(timezone.utc)
        for i in range(count - 1, -1, -1):
            ts = (now - timedelta(seconds=i * interval_seconds)).strftime("%Y-%m-%d %H:%M:%S")
            rec = self.generate_server_record(server_id=server_id, scenario=self.current_scenario, timestamp=ts)
            records.append(rec)
        return records

simulator = TelemetrySimulator()
