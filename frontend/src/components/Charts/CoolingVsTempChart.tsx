import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Telemetry } from "../../types";

interface CoolingVsTempChartProps {
  history: Telemetry[];
}

export const CoolingVsTempChart: React.FC<CoolingVsTempChartProps> = ({ history }) => {
  const chartData = history.map((d) => ({
    time: d.timestamp ? d.timestamp.split(" ")[1] : "",
    cooling: d.cooling_level,
    temp: d.server_temperature,
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-1">Cooling Level vs Temperature</h3>
      <p className="text-xs text-slate-400 mb-4">Thermal equilibrium modulation under dynamic cooling levels</p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis yAxisId="left" stroke="#10b981" fontSize={11} unit="%" tickLine={false} domain={[0, 100]} />
            <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" fontSize={11} unit="°C" tickLine={false} domain={[30, 100]} />
            <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "0.75rem", fontSize: "12px" }} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
            <Line yAxisId="left" type="monotone" dataKey="cooling" name="Cooling Level (%)" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="temp" name="Server Temp (°C)" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
