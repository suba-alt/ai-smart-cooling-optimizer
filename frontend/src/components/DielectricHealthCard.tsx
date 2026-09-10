import React from "react";
import { Activity, ShieldCheck, AlertTriangle, AlertOctagon } from "lucide-react";
import { DielectricHealth } from "../types";

interface DielectricHealthCardProps {
  health: DielectricHealth;
}

export const DielectricHealthCard: React.FC<DielectricHealthCardProps> = ({ health }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CRITICAL":
        return <AlertOctagon className="h-5 w-5 text-rose-400" />;
      case "WARNING":
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      default:
        return <ShieldCheck className="h-5 w-5 text-emerald-400" />;
    }
  };

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case "CRITICAL":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "WARNING":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Activity className="h-5 w-5 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Dielectric-Liquid Health Profile</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBadgeStyle(health.status)}`}>
            {health.status}
          </span>
          {getStatusIcon(health.status)}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-3">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[11px] text-slate-400">Liquid Temp</span>
          <p className="text-base font-bold text-white mt-0.5">{health.dielectric_temperature}°C</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[11px] text-slate-400">Effectiveness</span>
          <p className="text-base font-bold text-cyan-300 mt-0.5">{(health.dielectric_efficiency * 100).toFixed(1)}%</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[11px] text-slate-400">Thermal Delta</span>
          <p className="text-base font-bold text-slate-200 mt-0.5">+{health.thermal_delta}°C</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <span className="text-[11px] text-slate-400">Status</span>
          <p className="text-xs font-semibold text-slate-200 mt-1 truncate">{health.maintenance_status}</p>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 mt-3 leading-relaxed">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span>Conductivity Category:</span>
          <span className="text-slate-200 font-medium">{health.electrical_conductivity_category}</span>
        </div>
        <p className="text-slate-400 mt-2">{health.recommendation}</p>
      </div>

      <p className="text-[10px] text-slate-500 mt-3">
        {health.scientific_note}
      </p>
    </div>
  );
};
