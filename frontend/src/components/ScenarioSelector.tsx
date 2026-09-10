import React from "react";
import { Play, Flame, Droplets, AlertTriangle, RefreshCw, Cpu, Activity } from "lucide-react";

interface ScenarioSelectorProps {
  currentScenario: string;
  onScenarioChange: (scenario: string) => void;
  onRunSimulation: () => void;
  isLoading: boolean;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  currentScenario,
  onScenarioChange,
  onRunSimulation,
  isLoading,
}) => {
  const scenarios = [
    { id: "normal", label: "1. Normal Workload", desc: "Moderate compute load, normal temperatures and balanced water availability." },
    { id: "low_workload", label: "2. Low Workload", desc: "Low compute utilization, opportunities to reduce cooling energy." },
    { id: "high_workload", label: "3. High Workload", desc: "Intense compute load requiring elevated heat dissipation." },
    {
      id: "high_workload_water_stress",
      label: "4. High Load + High Water Stress",
      badge: "One-Click Demo (Sec 21)",
      desc: "Reference condition: GPU 92%, 84°C, high regional water scarcity. Tests water penalty vs dielectric cooling.",
      special: true
    },
    { id: "thermal_spike", label: "5. Thermal Spike", desc: "Extreme thermal burst (>90°C). Tests critical threshold escalation." },
    { id: "dielectric_degradation", label: "6. Dielectric Degradation", desc: "Simulates fluid efficiency drop and heat exchanger maintenance trigger." },
    { id: "recovery", label: "7. Recovery Condition", desc: "Post-stress cooling stabilization and nominal parameter restoration." },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Simulation Scenario Controls</h2>
            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
              SIH Interactive Demo
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Select a simulation scenario to adjust telemetry conditions, then run the AI optimization pipeline.
          </p>
        </div>

        {/* Big Prominent "Run AI Simulation" Button */}
        <button
          onClick={onRunSimulation}
          disabled={isLoading}
          className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          <Play className={`h-4 w-4 fill-white ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Running AI Pipeline..." : "Run AI Simulation"}</span>
        </button>
      </div>

      {/* Scenario Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 mt-4">
        {scenarios.map((s) => {
          const isSelected = currentScenario === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onScenarioChange(s.id)}
              className={`p-3 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? "bg-cyan-950/50 border-cyan-500 text-white ring-1 ring-cyan-500 shadow-md shadow-cyan-950"
                  : "bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-semibold">{s.label}</span>
                {s.badge && (
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded">
                    {s.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{s.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
