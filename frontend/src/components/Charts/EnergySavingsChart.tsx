import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Savings } from "../../types";

interface EnergySavingsChartProps {
  savings: Savings;
}

export const EnergySavingsChart: React.FC<EnergySavingsChartProps> = ({ savings }) => {
  const chartData = [
    {
      name: "Cooling Power (Watts)",
      Baseline: savings.energy.baseline_power_watts,
      Optimized: savings.energy.optimized_power_watts,
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Baseline vs Optimized Energy Usage</h3>
        <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
          -{savings.energy.saving_percentage}% Simulated Reduction
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-4">{savings.energy.label} (Estimated / Simulated / Potential)</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="40%">
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} unit="W" tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "0.75rem", fontSize: "12px" }} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
            <Bar dataKey="Baseline" fill="#64748b" radius={[6, 6, 0, 0]} name="Baseline Facility Cooling (W)" />
            <Bar dataKey="Optimized" fill="#10b981" radius={[6, 6, 0, 0]} name="AI Optimized Cooling (W)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>Projected Daily Energy Saved:</span>
        <span className="font-bold text-emerald-400">{savings.energy.saved_kwh_per_day} kWh/day</span>
      </div>
      <p className="text-[10px] text-slate-500 mt-1">{savings.energy.disclaimer}</p>
    </div>
  );
};
