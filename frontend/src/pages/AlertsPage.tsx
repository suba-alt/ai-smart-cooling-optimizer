import React, { useState } from "react";
import { Bell, AlertCircle, Filter } from "lucide-react";
import { Alert } from "../types";

interface AlertsPageProps {
  alerts: Alert[];
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ alerts }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");

  const filtered = alerts.filter((a) => {
    if (filterSeverity === "ALL") return true;
    return a.severity === filterSeverity;
  });

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
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="h-6 w-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white">System & Thermal Alerts Log</h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time notifications triggered when thermal thresholds, water stress levels, or dielectric degradation events occur.
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <Filter className="h-3.5 w-3.5 text-slate-400 ml-2" />
          {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterSeverity === sev
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Bell className="h-10 w-10 mx-auto text-slate-600 mb-3" />
          <p className="text-sm font-semibold text-slate-300">No alerts matching filter criteria</p>
          <p className="text-xs text-slate-500 mt-1">Telemetry operating within normal limits.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-4 shadow-lg hover:border-slate-700 transition-all"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white capitalize">
                      {alert.alert_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {alert.server_id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                </div>
              </div>

              <span className={`text-xs font-bold px-3 py-1 rounded-full border shrink-0 ${getSeverityBadge(alert.severity)}`}>
                {alert.severity}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
