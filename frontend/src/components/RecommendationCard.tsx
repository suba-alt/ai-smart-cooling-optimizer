import React from "react";
import { Sparkles, ArrowUpRight, CheckCircle2, AlertOctagon } from "lucide-react";
import { Recommendation, CoolingLevelOpt } from "../types";

interface RecommendationCardProps {
  recommendation: Recommendation;
  coolingLevelOpt: CoolingLevelOpt;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  coolingLevelOpt,
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Sparkles className="h-32 w-32 text-cyan-400" />
      </div>

      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">AI Optimization Recommendation</h3>
            <p className="text-xs text-slate-400">Dynamic Multi-Objective Inference Engine</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-800 text-cyan-300 border border-slate-700">
          Risk: {recommendation.thermal_risk}
        </span>
      </div>

      {/* Target Decision Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
        <div>
          <span className="text-xs text-slate-400 font-medium">Recommended Cooling Mode</span>
          <div className="text-lg font-bold text-white mt-0.5 flex items-center gap-2">
            <span className="text-cyan-400">{recommendation.recommended_mode}</span>
          </div>
        </div>
        <div>
          <span className="text-xs text-slate-400 font-medium">Recommended Cooling Level</span>
          <div className="text-lg font-bold text-white mt-0.5 flex items-center gap-2">
            <span>{coolingLevelOpt.current_cooling_level}%</span>
            <span className="text-slate-500">→</span>
            <span className="text-emerald-400">{coolingLevelOpt.recommended_cooling_level}%</span>
            <span className="text-xs text-slate-400 font-normal">
              (Est Temp: {coolingLevelOpt.predicted_temp_at_recommended}°C)
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Recommendation Sentences */}
      <div className="space-y-2 mt-4">
        {recommendation.bullet_points.map((pt, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
            <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>{pt}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
