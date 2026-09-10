import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Telemetry } from "../../types";

interface GpuVsTempChartProps {
  history: Telemetry[];
}

export const GpuVsTempChart: React.FC<GpuVsTempChartProps> = ({ history }) => {
  const chartData = history.map((d) => ({
    time: d.timestamp ? d.timestamp.split(" ")[1] : "",
    gpu: d.gpu_usage,
    serverTemp: d.server_temperature,
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-1">GPU Utilization vs Temperature</h3>
      <p className="text-xs text-slate-400 mb-4">Correlation between compute intensity and rack thermal response</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis yAxisId="left" stroke="#818cf8" fontSize={11} unit="%" tickLine={false} domain={[0, 100]} />
            <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" fontSize={11} unit="°C" tickLine={false} domain={[30, 100]} />
            <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "0.75rem", fontSize: "12px" }} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
            <Line yAxisId="left" type="monotone" dataKey="gpu" name="GPU Usage (%)" stroke="#818cf8" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="serverTemp" name="Server Temp (°C)" stroke="#f43f5e" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
