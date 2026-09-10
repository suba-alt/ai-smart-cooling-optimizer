import React from "react";
import { Bell, AlertTriangle, AlertCircle, Info, ShieldAlert } from "lucide-react";
import { Alert } from "../types";

interface AlertsPanelProps {
  alerts: Alert[];
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "HIGH":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "MEDIUM":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">System & Thermal Alerts</h3>
        </div>
        <span className="text-xs text-slate-400">{alerts.length} Active Notice{alerts.length === 1 ? "" : "s"}</span>
      </div>

      {alerts.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
          No critical warnings active. All simulated metrics are within configured thresholds.
        </div>
      ) : (
        <div className="space-y-2.5">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white capitalize">
                      {alert.alert_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">({alert.server_id})</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getSeverityBadge(alert.severity)}`}>
                {alert.severity}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
