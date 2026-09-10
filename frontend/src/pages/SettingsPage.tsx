import React, { useState, useEffect } from "react";
import { Sliders, Save, CheckCircle2, RefreshCw } from "lucide-react";
import { Settings } from "../types";
import { apiService } from "../services/api";

interface SettingsPageProps {
  onSettingsUpdated: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onSettingsUpdated }) => {
  const [settings, setSettings] = useState<Settings>({
    safe_temp_limit: 80.0,
    water_cost_weight: 0.45,
    energy_cost_weight: 0.35,
    cooling_effectiveness_weight: 0.20,
    water_stress_penalty_weight: 1.5,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    apiService.getSettings().then(setSettings).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiService.updateSettings(settings);
      setSavedSuccess(true);
      onSettingsUpdated();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert("Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sliders className="h-6 w-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">System Settings & Decision Weights</h2>
        </div>
        <p className="text-xs text-slate-400">
          Configure safe thermal operating limits and multi-objective optimization weights. Changes immediately update the live AI decision engine.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Safe Temperature Limit */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-white">Safe Temperature Limit (°C)</label>
            <span className="text-sm font-bold text-cyan-400">{settings.safe_temp_limit}°C</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Thermal threshold above which cooling strategies are deemed invalid or emergency escalation is mandated.
          </p>
          <input
            type="range"
            min="65"
            max="90"
            step="1"
            value={settings.safe_temp_limit}
            onChange={(e) => setSettings({ ...settings, safe_temp_limit: parseFloat(e.target.value) })}
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1">
            <span>65°C (Conservative)</span>
            <span>80°C (Default)</span>
            <span>90°C (Aggressive High-Density)</span>
          </div>
        </div>

        {/* Weights Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Multi-Objective Cost Weights</h3>
          <p className="text-xs text-slate-400">
            Adjust the trade-off priority between water preservation, power efficiency, and cooling effectiveness.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Water Cost Weight */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Water Cost Weight</span>
                <span className="text-sky-400">{settings.water_cost_weight}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.water_cost_weight}
                onChange={(e) => setSettings({ ...settings, water_cost_weight: parseFloat(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer mt-2"
              />
            </div>

            {/* Energy Cost Weight */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Energy Cost Weight</span>
                <span className="text-emerald-400">{settings.energy_cost_weight}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.energy_cost_weight}
                onChange={(e) => setSettings({ ...settings, energy_cost_weight: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer mt-2"
              />
            </div>

            {/* Cooling Effectiveness Weight */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Cooling Effectiveness Weight</span>
                <span className="text-indigo-400">{settings.cooling_effectiveness_weight}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.cooling_effectiveness_weight}
                onChange={(e) => setSettings({ ...settings, cooling_effectiveness_weight: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer mt-2"
              />
            </div>

            {/* Water Stress Penalty Multiplier */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Water Stress Penalty Multiplier</span>
                <span className="text-amber-400">{settings.water_stress_penalty_weight}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={settings.water_stress_penalty_weight}
                onChange={(e) => setSettings({ ...settings, water_stress_penalty_weight: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer mt-2"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-900/40 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Saving..." : "Save & Re-evaluate Optimizer"}</span>
          </button>

          {savedSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="h-4 w-4" /> Settings updated! Optimizer re-evaluated live.
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
