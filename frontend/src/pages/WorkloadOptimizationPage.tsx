import React from "react";
import { Server, ArrowRight, CheckCircle2, ShieldAlert, Cpu } from "lucide-react";
import { DashboardData } from "../types";

interface WorkloadOptimizationPageProps {
  data: DashboardData;
}

export const WorkloadOptimizationPage: React.FC<WorkloadOptimizationPageProps> = ({ data }) => {
  const wl = data.workload_optimization;
  const servers = data.all_servers || {};

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Server className="h-6 w-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Multi-Server Workload Optimization</h2>
        </div>
        <p className="text-xs text-slate-400">
          Monitors thermal loads across rack nodes and generates dynamic software compute-rebalancing recommendations.
        </p>
      </div>

      {/* Multi-Server Telemetry Compare Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(servers).map(([sId, sData]) => {
          const isSource = wl.source_server === sId && wl.migration_recommended;
          const isTarget = wl.target_server === sId && wl.migration_recommended;

          return (
            <div
              key={sId}
              className={`p-5 rounded-2xl border transition-all ${
                isSource
                  ? "bg-rose-950/20 border-rose-500/50 shadow-lg shadow-rose-950/50"
                  : isTarget
                  ? "bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-950/50"
                  : "bg-slate-900 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white capitalize">{sId.replace("_", " ")}</h3>
                {isSource && (
                  <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full">
                    Overloaded
                  </span>
                )}
                {isTarget && (
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    Spare Capacity
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Server Temp:</span>
                  <span className={`font-bold ${sData.server_temperature > 80 ? "text-rose-400" : "text-slate-200"}`}>
                    {sData.server_temperature}°C
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GPU Utilization:</span>
                  <span className="font-semibold text-slate-200">{sData.gpu_usage}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Server Load:</span>
                  <span className="font-semibold text-slate-200">{sData.server_load}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Power Consumption:</span>
                  <span className="font-semibold text-slate-200">{sData.power_consumption}W</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Migration Recommendation Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Workload Rebalancing Recommendation</h3>
          <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
            {wl.simulation_label}
          </span>
        </div>

        {wl.migration_recommended ? (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3 text-sm font-bold text-white">
              <span className="text-rose-400 uppercase">{wl.source_server}</span>
              <ArrowRight className="h-4 w-4 text-cyan-400" />
              <span className="text-emerald-400 uppercase">{wl.target_server}</span>
              <span className="text-xs text-slate-400 font-normal ml-auto">
                Shift Compute: <strong className="text-cyan-400">~{wl.recommended_shift_percent}%</strong>
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{wl.reason}</p>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Projected Thermal Relief on Source:</span>
              <span className="font-bold text-emerald-400">~{wl.estimated_temperature_relief_celsius}°C</span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
            {wl.reason}
          </div>
        )}
      </div>
    </div>
  );
};
