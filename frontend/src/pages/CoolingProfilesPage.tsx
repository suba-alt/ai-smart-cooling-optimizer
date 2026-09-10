import React, { useEffect, useState } from "react";
import { Layers, ShieldCheck, CheckCircle2, Droplets, Zap, Thermometer } from "lucide-react";
import { DashboardData } from "../types";
import { apiService } from "../services/api";
import { DielectricHealthCard } from "../components/DielectricHealthCard";

interface CoolingProfilesPageProps {
  data: DashboardData;
}

export const CoolingProfilesPage: React.FC<CoolingProfilesPageProps> = ({ data }) => {
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    apiService.getCoolingProfiles().then(setProfiles).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Layers className="h-6 w-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Cooling Architectures & Profiles</h2>
        </div>
        <p className="text-xs text-slate-400">
          Simulated cooling mode parameters: thermal effectiveness, water consumption factor, energy factor, and safe operating envelope.
        </p>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles.map((p) => {
          const isCurrentRec = p.name === data.cooling_decision.recommended_mode_id;
          return (
            <div
              key={p.name}
              className={`p-5 rounded-2xl border transition-all ${
                isCurrentRec
                  ? "bg-cyan-950/30 border-cyan-500 shadow-lg shadow-cyan-950/40"
                  : "bg-slate-900 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white">{p.display_name}</h3>
                {isCurrentRec && (
                  <span className="text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                    Active Recommendation
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">{p.suitability_description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Thermometer className="h-3 w-3 text-cyan-400" /> Thermal Effectiveness
                  </span>
                  <p className="text-sm font-bold text-slate-200 mt-0.5">{(p.thermal_effectiveness * 100).toFixed(0)}%</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-sky-400" /> Water Factor
                  </span>
                  <p className="text-sm font-bold text-slate-200 mt-0.5">{p.water_consumption_factor}x</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-emerald-400" /> Energy Factor
                  </span>
                  <p className="text-sm font-bold text-slate-200 mt-0.5">{p.energy_consumption_factor}x</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Operating Envelope</span>
                  <p className="text-sm font-bold text-slate-200 mt-0.5">{p.min_operating_temp}° - {p.max_operating_temp}°C</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Immersion Profile Telemetry Deep-Dive */}
      <DielectricHealthCard health={data.dielectric_health} />
    </div>
  );
};
