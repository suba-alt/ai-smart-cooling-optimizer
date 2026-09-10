import React from "react";
import { Activity, Server, ShieldCheck, Sparkles } from "lucide-react";

interface NavbarProps {
  currentServer: string;
  onServerChange: (serverId: string) => void;
  scenario: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentServer, onServerChange, scenario }) => {
  return (
    <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white">AI Smart Cooling Optimizer</h1>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              SIH Prototype
            </span>
          </div>
          <p className="text-xs text-slate-400">AI-Based Water-Efficient Cooling for Data-Center Infrastructure</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Simulation Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-medium">Simulated Telemetry Stream</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-400 capitalize font-medium">{scenario.replace(/_/g, " ")}</span>
        </div>

        {/* Server Node Selector */}
        <div className="flex items-center gap-2 bg-slate-800/90 rounded-lg p-1 border border-slate-700">
          <Server className="h-4 w-4 text-slate-400 ml-2" />
          <select
            value={currentServer}
            onChange={(e) => onServerChange(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-200 pr-3 py-1 outline-none cursor-pointer"
          >
            <option value="server_01" className="bg-slate-900 text-slate-200">Server 01 (Primary GPU Rack)</option>
            <option value="server_02" className="bg-slate-900 text-slate-200">Server 02 (Secondary Rack)</option>
            <option value="server_03" className="bg-slate-900 text-slate-200">Server 03 (Standby Node)</option>
          </select>
        </div>
      </div>
    </header>
  );
};
