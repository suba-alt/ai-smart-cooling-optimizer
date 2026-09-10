export interface Telemetry {
  timestamp: string;
  server_id: string;
  cpu_usage: number;
  gpu_usage: number;
  memory_usage: number;
  server_load: number;
  gpu_temperature: number;
  server_temperature: number;
  ambient_temperature: number;
  humidity: number;
  power_consumption: number;
  cooling_level: number;
  water_availability: number;
  water_consumption: number;
  outside_temperature: number;
  cooling_efficiency: number;
  dielectric_temperature: number;
  dielectric_efficiency: number;
}

export interface Prediction {
  predicted_temperature: number;
  predicted_workload: number;
  predicted_cooling_demand: number;
  prediction_horizon_minutes: number;
  confidence_score: number;
  prediction_variance_std?: number;
}

export interface WaterStress {
  score: number;
  level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  color: string;
  description: string;
  factors: {
    scarcity_factor: number;
    demand_factor: number;
    climate_factor: number;
    consumption_factor: number;
  };
  disclaimer: string;
}

export interface ThermalRisk {
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  color: string;
  effective_temperature: number;
  safe_temperature_limit: number;
  is_above_safe_limit: boolean;
  description: string;
}

export interface CoolingModeEval {
  id: string;
  name: string;
  display_name: string;
  thermal_effectiveness: number;
  water_consumption_factor: number;
  energy_consumption_factor: number;
  suitability_description: string;
  is_valid: boolean;
  invalidation_reason: string | null;
  score: number;
  score_breakdown: {
    resource_cost: number;
    base_score: number;
    water_stress_penalty: number;
  };
}

export interface CoolingDecision {
  modes: CoolingModeEval[];
  recommended_mode_id: string;
  recommended_mode_name: string;
  recommended_mode_score: number;
  selection_rationale: string;
}

export interface CoolingLevelOpt {
  current_cooling_level: number;
  recommended_cooling_level: number;
  predicted_temp_at_recommended: number;
  target_safe_temperature: number;
  reason: string;
}

export interface DielectricHealth {
  status: "NORMAL" | "WARNING" | "CRITICAL";
  color: string;
  dielectric_temperature: number;
  dielectric_efficiency: number;
  performance_factor: number;
  thermal_delta: number;
  electrical_conductivity_category: string;
  degradation_indicator: string;
  maintenance_status: string;
  recommendation: string;
  alert_needed: boolean;
  scientific_note: string;
}

export interface WorkloadOptimization {
  migration_recommended: boolean;
  source_server?: string;
  target_server?: string;
  recommended_shift_percent?: number;
  estimated_temperature_relief_celsius?: number;
  source_current_temp?: number;
  source_current_gpu?: number;
  target_current_temp?: number;
  target_current_gpu?: number;
  reason: string;
  simulation_label: string;
}

export interface Savings {
  water: {
    baseline_liters_per_hour: number;
    optimized_liters_per_hour: number;
    saved_liters_per_hour: number;
    saved_liters_per_day: number;
    saving_percentage: number;
    label: string;
    disclaimer: string;
  };
  energy: {
    baseline_power_watts: number;
    optimized_power_watts: number;
    saved_power_watts: number;
    saved_kwh_per_day: number;
    saving_percentage: number;
    label: string;
    disclaimer: string;
  };
}

export interface Recommendation {
  summary: string;
  recommended_mode: string;
  recommended_cooling_level: number;
  thermal_risk: string;
  bullet_points: string[];
}

export interface Alert {
  id?: number;
  server_id: string;
  alert_type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  timestamp?: string;
}

export interface DashboardData {
  scenario: string;
  telemetry: Telemetry;
  all_servers: Record<string, Telemetry>;
  prediction: Prediction;
  water_stress: WaterStress;
  thermal_risk: ThermalRisk;
  cooling_decision: CoolingDecision;
  cooling_level_optimization: CoolingLevelOpt;
  dielectric_health: DielectricHealth;
  workload_optimization: WorkloadOptimization;
  savings: Savings;
  recommendation: Recommendation;
  alerts: Alert[];
  history: Telemetry[];
  simulation_state: {
    current_cooling_mode: string;
    current_cooling_level: number;
    label: string;
  };
}

export interface Settings {
  safe_temp_limit: number;
  water_cost_weight: number;
  energy_cost_weight: number;
  cooling_effectiveness_weight: number;
  water_stress_penalty_weight: number;
}
