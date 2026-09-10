import React from "react";
import { Cpu, ShieldCheck, AlertOctagon, CheckCircle2 } from "lucide-react";
import { DashboardData } from "../types";
import { CoolingModesPanel } from "../components/CoolingModesPanel";
import { CoolingVsTempChart } from "../components/Charts/CoolingVsTempChart";

interface CoolingOptimizationPageProps {
  data: DashboardData;
}

export const CoolingOptimizationPage: React.FC<CoolingOptimizationPageProps> = ({ data }) => {
  const opt = data.cooling_level_optimization;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Cpu className="h-6 w-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Dynamic Cooling Optimization Engine</h2>
        </div>
        <p className="text-xs text-slate-400">
          Evaluates safety constraints across 4 cooling profiles, computes multi-objective resource costs, and iteratively calculates the minimum required cooling level.
        </p>
      </div>

      {/* Safety Constraint & Formula Rule Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Decision Logic & Safety Constraint Rule</h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Thermal Safety Guarantee:</strong> Any cooling mode unable to satisfy the thermal safety threshold (predicted temperature &le; {opt.target_safe_temperature}°C) is automatically marked <strong>INVALID</strong> and excluded from consideration.
        </p>
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 font-mono text-xs text-cyan-300">
          score = (water_weight * water_cost + energy_weight * energy_cost) / (effectiveness_weight * thermal_eff) + water_stress_penalty
        </div>
        <p className="text-xs text-slate-400">
          Among all thermally valid modes, the system selects the strategy yielding the lowest weighted score.
        </p>
      </div>

      {/* Cooling Level Optimization Search Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-2">Cooling Level Minimum Search (Section 12)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-3">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400">Current Cooling Level</span>
            <p className="text-2xl font-bold text-slate-200 mt-1">{opt.current_cooling_level}%</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400">Minimum Safe Recommended</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{opt.recommended_cooling_level}%</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400">Projected Temp at Target</span>
            <p className="text-2xl font-bold text-cyan-300 mt-1">{opt.predicted_temp_at_recommended}°C</p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200">
          <strong>Search Result:</strong> {opt.reason}
        </div>
      </div>

      {/* Modes Comparison */}
      <CoolingModesPanel decision={data.cooling_decision} />

      {/* Dynamic Graph */}
      <CoolingVsTempChart history={data.history} />
    </div>
  );
};
