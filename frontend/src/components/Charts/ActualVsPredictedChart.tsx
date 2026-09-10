import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ReferenceLine } from "recharts";
import { Telemetry, Prediction } from "../../types";

interface ActualVsPredictedChartProps {
  history: Telemetry[];
  prediction: Prediction;
  safeLimit: number;
}

export const ActualVsPredictedChart: React.FC<ActualVsPredictedChartProps> = ({ history, prediction, safeLimit }) => {
  const chartData = history.slice(-10).map((d) => ({
    time: d.timestamp ? d.timestamp.split(" ")[1] : "",
    actual: d.server_temperature,
    predicted: null as number | null,
  }));

  // Append future 30-min forecast point
  chartData.push({
    time: "+30m (AI Forecast)",
    actual: null as any,
    predicted: prediction.predicted_temperature,
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Actual vs Predicted Temperature</h3>
        <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
          30-Min Horizon Forecast
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-4">RandomForest regression projection with safe thermal ceiling comparison</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} domain={[30, 100]} unit="°C" tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "0.75rem", fontSize: "12px" }}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
            <ReferenceLine y={safeLimit} label={{ value: `Safe Limit (${safeLimit}°C)`, fill: "#ef4444", fontSize: 10, position: "top" }} stroke="#ef4444" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="actual" name="Actual Temp (°C)" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="predicted" name="AI Predicted Temp (°C)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 6, fill: "#f59e0b" }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
