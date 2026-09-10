import React, { useState } from "react";
import { Sliders, CheckCircle, RefreshCw, AlertCircle } from "lucide-react";
import { CoolingDecision, CoolingLevelOpt } from "../types";

interface SimulatedControlPanelProps {
  currentMode: string;
  recommendedModeId: string;
  recommendedModeName: string;
  currentLevel: number;
  recommendedLevel: number;
  onApplyControl: (action: "accept" | "switch_mode", payload: { mode?: string; cooling_level?: number }) => Promise<void>;
}

export const SimulatedControlPanel: React.FC<SimulatedControlPanelProps> = ({
  currentMode,
  recommendedModeId,
  recommendedModeName,
  currentLevel,
  recommendedLevel,
  onApplyControl,
}) => {
  const [isApplying, setIsApplying] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAccept = async () => {
    setIsApplying(true);
    setFeedback(null);
    try {
      await onApplyControl("accept", {
        mode: recommendedModeId,
        cooling_level: recommendedLevel,
      });
      setFeedback(`Simulation updated: Mode switched to ${recommendedModeName} at ${recommendedLevel}%.`);
    } catch (e) {
      setFeedback("Failed to update simulation state.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleSwitchMode = async () => {
    setIsApplying(true);
    setFeedback(null);
    try {
      await onApplyControl("switch_mode", {
        mode: recommendedModeId,
      });
      setFeedback(`Simulation updated: Mode switched to ${recommendedModeName}.`);
    } catch (e) {
      setFeedback("Failed to update simulation state.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-indigo-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Simulated Control Panel</h3>
        </div>
        <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
          Simulation Only
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        Interactive buttons update the software telemetry simulation state. Does not interact with physical hardware.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 mb-4">
        <div>
          <span className="text-[11px] text-slate-400">Current Simulation State</span>
          <div className="text-sm font-bold text-white mt-1">
            Mode: <span className="text-cyan-400 capitalize">{currentMode.replace(/_/g, " ")}</span>
          </div>
          <div className="text-xs text-slate-300 mt-0.5">
            Cooling Level: <span className="font-semibold text-slate-200">{currentLevel}%</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-400">Recommended Target</span>
          <div className="text-sm font-bold text-white mt-1">
            Mode: <span className="text-emerald-400">{recommendedModeName}</span>
          </div>
          <div className="text-xs text-slate-300 mt-0.5">
            Cooling Level: <span className="font-semibold text-emerald-400">{recommendedLevel}%</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleAccept}
          disabled={isApplying}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-cyan-900/40"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Accept Recommendation</span>
        </button>

        <button
          onClick={handleSwitchMode}
          disabled={isApplying}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Simulate Mode Switch</span>
        </button>
      </div>

      {feedback && (
        <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
};
