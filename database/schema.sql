-- AI Smart Cooling Optimizer Database Schema
-- SIH Prototype: AI-Based Water-Efficient Cooling Optimization for AI / Data-Center Infrastructure

CREATE DATABASE IF NOT EXISTS ai_cooling_optimizer;
USE ai_cooling_optimizer;

-- 1. Server Telemetry Metrics
CREATE TABLE IF NOT EXISTS server_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    server_id VARCHAR(50) NOT NULL,
    cpu_usage FLOAT NOT NULL,
    gpu_usage FLOAT NOT NULL,
    memory_usage FLOAT NOT NULL,
    server_load FLOAT NOT NULL,
    gpu_temperature FLOAT NOT NULL,
    server_temperature FLOAT NOT NULL,
    ambient_temperature FLOAT NOT NULL,
    humidity FLOAT NOT NULL,
    power_consumption FLOAT NOT NULL,
    cooling_level FLOAT NOT NULL,
    water_availability FLOAT NOT NULL,
    water_consumption FLOAT NOT NULL,
    outside_temperature FLOAT NOT NULL,
    cooling_efficiency FLOAT NOT NULL,
    dielectric_temperature FLOAT NOT NULL,
    dielectric_efficiency FLOAT NOT NULL,
    INDEX (timestamp),
    INDEX (server_id)
);

-- 2. AI Model Predictions
CREATE TABLE IF NOT EXISTS predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    server_id VARCHAR(50) NOT NULL,
    predicted_temperature FLOAT NOT NULL,
    predicted_workload FLOAT NOT NULL,
    predicted_cooling_demand FLOAT NOT NULL,
    prediction_horizon_minutes INT NOT NULL DEFAULT 30,
    confidence_score FLOAT NOT NULL,
    INDEX (timestamp),
    INDEX (server_id)
);

-- 3. Optimization Recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    server_id VARCHAR(50) NOT NULL,
    current_cooling_mode VARCHAR(50) NOT NULL,
    recommended_cooling_mode VARCHAR(50) NOT NULL,
    current_cooling_level FLOAT NOT NULL,
    recommended_cooling_level FLOAT NOT NULL,
    thermal_risk VARCHAR(20) NOT NULL,
    recommendation_text TEXT NOT NULL,
    reason TEXT NOT NULL,
    INDEX (timestamp)
);

-- 4. Cooling Profiles
CREATE TABLE IF NOT EXISTS cooling_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    thermal_effectiveness FLOAT NOT NULL,
    water_consumption_factor FLOAT NOT NULL,
    energy_consumption_factor FLOAT NOT NULL,
    min_operating_temp FLOAT NOT NULL,
    max_operating_temp FLOAT NOT NULL,
    suitability_description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 5. Water Savings Tracking
CREATE TABLE IF NOT EXISTS water_savings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    baseline_water_consumption FLOAT NOT NULL,
    optimized_water_consumption FLOAT NOT NULL,
    water_saved FLOAT NOT NULL,
    saving_percentage FLOAT NOT NULL,
    water_stress_score FLOAT NOT NULL,
    INDEX (timestamp)
);

-- 6. Energy Savings Tracking
CREATE TABLE IF NOT EXISTS energy_savings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    baseline_energy_consumption FLOAT NOT NULL,
    optimized_energy_consumption FLOAT NOT NULL,
    energy_saved FLOAT NOT NULL,
    saving_percentage FLOAT NOT NULL,
    INDEX (timestamp)
);

-- 7. System & Thermal Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    server_id VARCHAR(50) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX (timestamp),
    INDEX (severity)
);

-- Seed Initial Cooling Profiles
INSERT INTO cooling_profiles (name, display_name, thermal_effectiveness, water_consumption_factor, energy_consumption_factor, min_operating_temp, max_operating_temp, suitability_description)
VALUES
('air', 'Direct Air Cooling', 0.65, 0.00, 1.25, 15.0, 75.0, 'Suitable for low to moderate workloads and cooler ambient conditions. Zero freshwater consumption, but energy intensive at higher loads.'),
('water_evaporative', 'Water / Evaporative Cooling', 0.85, 1.00, 0.80, 15.0, 88.0, 'High thermal rejection capacity for heavy workloads. High freshwater consumption; penalized during elevated water stress conditions.'),
('dielectric_immersion', 'Dielectric-Liquid Immersion Cooling', 0.95, 0.05, 0.55, 10.0, 95.0, 'Simulated dielectric profile with exceptional thermal transfer. Drastically reduces freshwater dependence and overall heat rejection power.'),
('hybrid', 'Intelligent Hybrid Cooling', 0.88, 0.25, 0.70, 15.0, 90.0, 'Balances air assist and closed-loop liquid cooling dynamically. Ideal compromise when water availability is restricted.')
ON DUPLICATE KEY UPDATE display_name=VALUES(display_name);
