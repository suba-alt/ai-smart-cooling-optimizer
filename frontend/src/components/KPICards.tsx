import React from "react";
import { Cpu, Flame, Droplets, Zap, Gauge, TrendingUp } from "lucide-react";
import { Telemetry, Prediction, WaterStress, ThermalRisk } from "../types";

interface KPICardsProps {
  telemetry: Telemetry;
  prediction: Prediction;
  waterStress: WaterStress;
  thermalRisk: ThermalRisk;
}

export const KPICards: React.FC<KPICardsProps> = ({
  telemetry,
  prediction,
  waterStress,
  thermalRisk,
}) => {
  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "CRITICAL":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "HIGH":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "MEDIUM":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    }
  };

  const getStressBadgeColor = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "HIGH":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "MODERATE":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* 1. GPU Utilization */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">GPU Utilization</span>
          <Cpu className="h-4 w-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-white">{telemetry.gpu_usage}%</span>
          <span className="text-xs text-slate-400">Power: {telemetry.power_consumption}W</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className="bg-cyan-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, telemetry.gpu_usage)}%` }}
          />
        </div>
      </div>

      {/* 2. CPU Utilization */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">CPU Utilization</span>
          <Gauge className="h-4 w-4 text-indigo-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-white">{telemetry.cpu_usage}%</span>
          <span className="text-xs text-slate-400">Load: {telemetry.server_load}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className="bg-indigo-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, telemetry.cpu_usage)}%` }}
          />
        </div>
      </div>

      {/* 3. Current Server Temp */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Server Temp</span>
          <Flame className="h-4 w-4 text-rose-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-black text-white">{telemetry.server_temperature}°C</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getRiskBadgeColor(thermalRisk.risk_level)}`}>
            {thermalRisk.risk_level}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-2">
          GPU: {telemetry.gpu_temperature}°C | Amb: {telemetry.ambient_temperature}°C
        </div>
      </div>

      {/* 4. Predicted Temperature (30 Min) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Predicted Temp (30m)</span>
          <TrendingUp className="h-4 w-4 text-amber-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-black text-amber-300">{prediction.predicted_temperature}°C</span>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
            Conf: {prediction.confidence_score}%
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-2">
          Limit: {thermalRisk.safe_temperature_limit}°C (Safe Baseline)
        </div>
      </div>

      {/* 5. Water Stress Score */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Water Stress</span>
          <Droplets className="h-4 w-4 text-sky-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-black text-sky-300">{waterStress.score}<span className="text-sm font-normal text-slate-400">/100</span></span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStressBadgeColor(waterStress.level)}`}>
            {waterStress.level}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-2">
          Avail: {telemetry.water_availability}% | Simulated
        </div>
      </div>

      {/* 6. AI Cooling Demand */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Cooling Demand</span>
          <Zap className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-emerald-300">{prediction.predicted_cooling_demand}%</span>
          <span className="text-xs text-slate-400">Current: {telemetry.cooling_level}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, prediction.predicted_cooling_demand)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
