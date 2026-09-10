import React from "react";
import { Droplets, ShieldAlert, CheckCircle2 } from "lucide-react";
import { DashboardData } from "../types";
import { WaterSavingsChart } from "../components/Charts/WaterSavingsChart";

interface ResourceEfficiencyPageProps {
  data: DashboardData;
}

export const ResourceEfficiencyPage: React.FC<ResourceEfficiencyPageProps> = ({ data }) => {
  const w = data.savings.water;
  const ws = data.water_stress;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Droplets className="h-6 w-6 text-sky-400" />
          <h2 className="text-xl font-bold text-white">Water Resource Conservation & Stress Optimization</h2>
        </div>
        <p className="text-xs text-slate-400">
          Evaluates local freshwater dependency and dynamically restricts evaporative cooling consumption under elevated water stress.
        </p>
      </div>

      {/* Water Stress Score Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Prototype Water Stress Index</h3>
          <span className="text-xs font-bold text-sky-300 bg-sky-950 px-2.5 py-0.5 rounded-full border border-sky-800">
            {ws.level} STRESS ({ws.score}/100)
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">{ws.description}</p>

        {/* Factors Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400">Scarcity Factor:</span>
            <p className="text-lg font-bold text-white mt-0.5">{ws.factors.scarcity_factor}/100</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400">Demand Factor:</span>
            <p className="text-lg font-bold text-white mt-0.5">{ws.factors.demand_factor}/100</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400">Climate Heat Factor:</span>
            <p className="text-lg font-bold text-white mt-0.5">{ws.factors.climate_factor}/100</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400">Draw Factor:</span>
            <p className="text-lg font-bold text-white mt-0.5">{ws.factors.consumption_factor}/100</p>
          </div>
        </div>

        <p className="text-[10px] text-slate-500 mt-3">{ws.disclaimer}</p>
      </div>

      {/* Savings Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Baseline Evaporative Draw</span>
          <p className="text-2xl font-black text-slate-300 mt-1">{w.baseline_liters_per_hour} L/h</p>
          <span className="text-xs text-slate-500">Traditional wet cooling tower baseline</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Optimized Draw</span>
          <p className="text-2xl font-black text-sky-400 mt-1">{w.optimized_liters_per_hour} L/h</p>
          <span className="text-xs text-slate-500">Under recommended cooling strategy</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Potential Water Saved</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">~{w.saved_liters_per_day} L/day</p>
          <span className="text-xs text-emerald-400 font-medium">-{w.saving_percentage}% Simulated Reduction</span>
        </div>
      </div>

      {/* Bar Chart */}
      <WaterSavingsChart savings={data.savings} />
    </div>
  );
};
