import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Savings } from "../../types";

interface WaterSavingsChartProps {
  savings: Savings;
}

export const WaterSavingsChart: React.FC<WaterSavingsChartProps> = ({ savings }) => {
  const chartData = [
    {
      name: "Water Rate (L/hr)",
      Baseline: savings.water.baseline_liters_per_hour,
      Optimized: savings.water.optimized_liters_per_hour,
    },
    {
      name: "24h Resource (Liters)",
      Baseline: Number((savings.water.baseline_liters_per_hour * 24).toFixed(1)),
      Optimized: Number((savings.water.optimized_liters_per_hour * 24).toFixed(1)),
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Baseline vs Optimized Water Resource Usage</h3>
        <span className="text-xs font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
          -{savings.water.saving_percentage}% Simulated Conservation
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-4">{savings.water.label} (Estimated / Simulated / Potential)</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "0.75rem", fontSize: "12px" }} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
            <Bar dataKey="Baseline" fill="#64748b" radius={[6, 6, 0, 0]} name="Baseline Evaporative Water" />
            <Bar dataKey="Optimized" fill="#38bdf8" radius={[6, 6, 0, 0]} name="AI Optimized Water" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-slate-500 mt-2">{savings.water.disclaimer}</p>
    </div>
  );
};
