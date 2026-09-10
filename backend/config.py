import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Server
    PORT = int(os.getenv('PORT', 5000))
    DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 't')
    
    # Database
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'ai_cooling_optimizer')
    USE_SQLITE_FALLBACK = True

    # Thermal Thresholds (Configurable in Settings)
    SAFE_TEMP_LIMIT = float(os.getenv('SAFE_TEMP_LIMIT', 80.0))
    TEMP_LOW_THRESHOLD = float(os.getenv('TEMP_LOW_THRESHOLD', 70.0))
    TEMP_MEDIUM_THRESHOLD = float(os.getenv('TEMP_MEDIUM_THRESHOLD', 80.0))
    TEMP_HIGH_THRESHOLD = float(os.getenv('TEMP_HIGH_THRESHOLD', 90.0))
    
    # Prediction Horizon
    PREDICTION_HORIZON_MINUTES = int(os.getenv('PREDICTION_HORIZON_MINUTES', 30))
    
    # Optimization Weights (Configurable in Settings)
    WATER_COST_WEIGHT = float(os.getenv('WATER_COST_WEIGHT', 0.45))
    ENERGY_COST_WEIGHT = float(os.getenv('ENERGY_COST_WEIGHT', 0.35))
    COOLING_EFFECTIVENESS_WEIGHT = float(os.getenv('COOLING_EFFECTIVENESS_WEIGHT', 0.20))
    WATER_STRESS_PENALTY_WEIGHT = float(os.getenv('WATER_STRESS_PENALTY_WEIGHT', 1.5))
    
    # Baseline Constants for Efficiency Benchmarking (Simulated)
    BASELINE_WATER_RATE = 1.8  # Liters per kWh thermal rejection under traditional evaporative cooling
    BASELINE_ENERGY_PUE = 1.45 # Standard legacy PUE
    OPTIMIZED_DIELECTRIC_PUE = 1.08 # Simulated immersion PUE
    
    # Cooling Profiles Static Spec
    COOLING_PROFILES = {
        'air': {
            'id': 'air',
            'display_name': 'Direct Air Cooling',
            'thermal_effectiveness': 0.65,
            'water_consumption_factor': 0.00,
            'energy_consumption_factor': 1.25,
            'min_operating_temp': 15.0,
            'max_operating_temp': 75.0,
            'suitability_description': 'Suitable for low to moderate workloads and cooler ambient conditions. Zero freshwater consumption, but energy intensive at higher loads.'
        },
        'water_evaporative': {
            'id': 'water_evaporative',
            'display_name': 'Water / Evaporative Cooling',
            'thermal_effectiveness': 0.85,
            'water_consumption_factor': 1.00,
            'energy_consumption_factor': 0.80,
            'min_operating_temp': 15.0,
            'max_operating_temp': 88.0,
            'suitability_description': 'High thermal rejection capacity for heavy workloads. High freshwater consumption; penalized during elevated water stress conditions.'
        },
        'dielectric_immersion': {
            'id': 'dielectric_immersion',
            'display_name': 'Dielectric-Liquid Immersion Cooling',
            'thermal_effectiveness': 0.95,
            'water_consumption_factor': 0.05,
            'energy_consumption_factor': 0.55,
            'min_operating_temp': 10.0,
            'max_operating_temp': 95.0,
            'suitability_description': 'Simulated dielectric profile with exceptional thermal transfer. Drastically reduces freshwater dependence and overall heat rejection power.'
        },
        'hybrid': {
            'id': 'hybrid',
            'display_name': 'Intelligent Hybrid Cooling',
            'thermal_effectiveness': 0.88,
            'water_consumption_factor': 0.25,
            'energy_consumption_factor': 0.70,
            'min_operating_temp': 15.0,
            'max_operating_temp': 90.0,
            'suitability_description': 'Balances air assist and closed-loop liquid cooling dynamically. Ideal compromise when water availability is restricted.'
        }
    }
