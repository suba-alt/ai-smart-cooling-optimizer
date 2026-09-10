import React from "react";
import { Zap, ShieldCheck } from "lucide-react";
import { DashboardData } from "../types";
import { EnergySavingsChart } from "../components/Charts/EnergySavingsChart";

interface EnergyEfficiencyPageProps {
  data: DashboardData;
}

export const EnergyEfficiencyPage: React.FC<EnergyEfficiencyPageProps> = ({ data }) => {
  const e = data.savings.energy;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-6 w-6 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">Cooling Energy Optimization & PUE Impact</h2>
        </div>
        <p className="text-xs text-slate-400">
          Models parasitic cooling energy overhead reductions against legacy data-center PUE baselines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Baseline Facility Overhead</span>
          <p className="text-2xl font-black text-slate-300 mt-1">{e.baseline_power_watts} W</p>
          <span className="text-xs text-slate-500">Legacy PUE 1.45 baseline cooling power</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Optimized Cooling Power</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{e.optimized_power_watts} W</p>
          <span className="text-xs text-slate-500">Immersion / Hybrid fluid dynamics power</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Estimated Energy Saved</span>
          <p className="text-2xl font-black text-cyan-300 mt-1">~{e.saved_kwh_per_day} kWh/day</p>
          <span className="text-xs text-emerald-400 font-medium">-{e.saving_percentage}% Simulated Reduction</span>
        </div>
      </div>

      <EnergySavingsChart savings={data.savings} />

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 leading-relaxed">
        <strong>PUE Projection:</strong> Simulated immersion cooling dramatically lowers thermal resistance, allowing rejection at higher liquid loop temperatures and cutting compressor chilling duty. Actual facility savings depend on IT density and mechanical heat rejection infrastructure.
      </div>
    </div>
  );
};
