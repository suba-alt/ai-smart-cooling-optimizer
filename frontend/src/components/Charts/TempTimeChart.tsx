import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Telemetry } from "../../types";

interface TempTimeChartProps {
  data: Telemetry[];
}

export const TempTimeChart: React.FC<TempTimeChartProps> = ({ data }) => {
  const chartData = data.map((d) => ({
    time: d.timestamp ? d.timestamp.split(" ")[1] : "",
    serverTemp: d.server_temperature,
    gpuTemp: d.gpu_temperature,
    ambientTemp: d.ambient_temperature,
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-1">Temperature vs Time</h3>
      <p className="text-xs text-slate-400 mb-4">Historical progression of rack, GPU, and room ambient temperatures</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} domain={[20, 100]} unit="°C" tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "0.75rem", fontSize: "12px" }}
              itemStyle={{ color: "#e2e8f0" }}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
            <Line type="monotone" dataKey="serverTemp" name="Server Temp (°C)" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="gpuTemp" name="GPU Temp (°C)" stroke="#f43f5e" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="ambientTemp" name="Ambient Temp (°C)" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
