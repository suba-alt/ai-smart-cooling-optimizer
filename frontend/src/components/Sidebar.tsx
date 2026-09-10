import React from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Cpu,
  Server,
  Layers,
  Droplets,
  Zap,
  Bell,
  Sliders,
  ShieldAlert
} from "lucide-react";

export type NavItem =
  | "dashboard"
  | "predictions"
  | "cooling-optimization"
  | "workload-optimization"
  | "cooling-profiles"
  | "resource-efficiency"
  | "energy-efficiency"
  | "alerts"
  | "settings";

interface SidebarProps {
  currentTab: NavItem;
  onTabChange: (tab: NavItem) => void;
  alertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, alertCount }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "predictions", label: "Predictions", icon: TrendingUp },
    { id: "cooling-optimization", label: "Cooling Optimization", icon: Cpu },
    { id: "workload-optimization", label: "Workload Optimization", icon: Server },
    { id: "cooling-profiles", label: "Cooling Profiles", icon: Layers },
    { id: "resource-efficiency", label: "Resource Efficiency", icon: Droplets },
    { id: "energy-efficiency", label: "Energy Efficiency", icon: Zap },
    { id: "alerts", label: "Alerts", icon: Bell, badge: alertCount },
    { id: "settings", label: "Settings", icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between shrink-0 h-[calc(100vh-65px)] sticky top-[65px]">
      <div className="p-4 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Navigation</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as NavItem)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-900/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Model & System Info Box */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 m-3 rounded-xl border">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
          <ShieldAlert className="h-3.5 w-3.5 text-cyan-400" />
          <span>Scientific Disclaimer</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Software prototype with simulated telemetry. Water stress & savings are dynamically computed research estimates.
        </p>
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
          <span>Model: RandomForest</span>
          <span className="text-cyan-400 font-medium">30m Horizon</span>
        </div>
      </div>
    </aside>
  );
};
