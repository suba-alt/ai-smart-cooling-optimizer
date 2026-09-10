import React from "react";
import { Check, X, ShieldAlert, Layers } from "lucide-react";
import { CoolingDecision } from "../types";

interface CoolingModesPanelProps {
  decision: CoolingDecision;
}

export const CoolingModesPanel: React.FC<CoolingModesPanelProps> = ({ decision }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Layers className="h-5 w-5 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Cooling Modes Evaluation</h3>
        </div>
        <span className="text-xs text-slate-400">Lowest Score Wins (Resource & Safety Constrained)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {decision.modes.map((mode) => {
          const isSelected = mode.id === decision.recommended_mode_id;
          return (
            <div
              key={mode.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                !mode.is_valid
                  ? "bg-slate-950/40 border-rose-900/40 opacity-70"
                  : isSelected
                  ? "bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500 shadow-lg shadow-cyan-950/50"
                  : "bg-slate-950/60 border-slate-800"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <h4 className="text-xs font-bold text-white">{mode.display_name}</h4>
                  {mode.is_valid ? (
                    isSelected ? (
                      <span className="text-[10px] uppercase font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        Valid
                      </span>
                    )
                  ) : (
                    <span className="text-[10px] uppercase font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <X className="h-3 w-3" /> Invalid
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  {mode.suitability_description}
                </p>

                {!mode.is_valid && mode.invalidation_reason && (
                  <div className="p-2 rounded bg-rose-950/40 border border-rose-800/40 text-[10px] text-rose-300 mb-3 flex items-start gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-rose-400 mt-0.5" />
                    <span>{mode.invalidation_reason}</span>
                  </div>
                )}
              </div>

              {/* Score & Factors */}
              <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Effectiveness Factor:</span>
                  <span className="font-semibold text-slate-200">{(mode.thermal_effectiveness * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Water Factor:</span>
                  <span className="font-semibold text-slate-200">{mode.water_consumption_factor}x</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Energy Factor:</span>
                  <span className="font-semibold text-slate-200">{mode.energy_consumption_factor}x</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-slate-800/60">
                  <span className="text-slate-300">Composite Score:</span>
                  <span className={isSelected ? "text-cyan-400 font-extrabold" : "text-slate-200"}>
                    {mode.score.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
