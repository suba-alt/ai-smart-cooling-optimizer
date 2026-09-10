import React, { useState, useEffect } from "react";
import { DashboardData } from "./types";
import { apiService } from "./services/api";
import { Navbar } from "./components/Navbar";
import { Sidebar, NavItem } from "./components/Sidebar";
import { DashboardPage } from "./pages/DashboardPage";
import { PredictionsPage } from "./pages/PredictionsPage";
import { CoolingOptimizationPage } from "./pages/CoolingOptimizationPage";
import { WorkloadOptimizationPage } from "./pages/WorkloadOptimizationPage";
import { CoolingProfilesPage } from "./pages/CoolingProfilesPage";
import { ResourceEfficiencyPage } from "./pages/ResourceEfficiencyPage";
import { EnergyEfficiencyPage } from "./pages/EnergyEfficiencyPage";
import { AlertsPage } from "./pages/AlertsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AlertTriangle, RefreshCw } from "lucide-react";

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavItem>("dashboard");
  const [currentServer, setCurrentServer] = useState<string>("server_01");
  const [scenario, setScenario] = useState<string>("normal");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (sc: string = scenario, srv: string = currentServer) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getDashboard(sc, srv);
      setDashboardData(data);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to connect to AI Cooling Optimizer backend service. Please check backend status.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(scenario, currentServer);
  }, [currentServer]);

  const handleRunSimulation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await apiService.runSimulation(scenario, currentServer);
      setDashboardData(updated);
    } catch (err) {
      setError("Error executing AI Simulation pipeline.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScenarioChange = async (newScenario: string) => {
    setScenario(newScenario);
    setIsLoading(true);
    try {
      const updated = await apiService.runSimulation(newScenario, currentServer);
      setDashboardData(updated);
    } catch (err) {
      setError("Failed to run scenario switch.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyControl = async (action: "accept" | "switch_mode", payload: { mode?: string; cooling_level?: number }) => {
    await apiService.applyControl(action, { ...payload, server_id: currentServer });
    await loadData(scenario, currentServer);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      <Navbar
        currentServer={currentServer}
        onServerChange={(s) => setCurrentServer(s)}
        scenario={scenario}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          alertCount={dashboardData?.alerts?.length || 0}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => loadData(scenario, currentServer)}
                className="px-3 py-1 rounded bg-rose-900/60 hover:bg-rose-850 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" /> Retry
              </button>
            </div>
          )}

          {isLoading && !dashboardData ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
              <p className="text-sm font-medium">Initializing AI Smart Cooling Optimizer Telemetry...</p>
            </div>
          ) : dashboardData ? (
            <>
              {currentTab === "dashboard" && (
                <DashboardPage
                  data={dashboardData}
                  onScenarioChange={handleScenarioChange}
                  onRunSimulation={handleRunSimulation}
                  onApplyControl={handleApplyControl}
                  isLoading={isLoading}
                />
              )}

              {currentTab === "predictions" && (
                <PredictionsPage data={dashboardData} />
              )}

              {currentTab === "cooling-optimization" && (
                <CoolingOptimizationPage data={dashboardData} />
              )}

              {currentTab === "workload-optimization" && (
                <WorkloadOptimizationPage data={dashboardData} />
              )}

              {currentTab === "cooling-profiles" && (
                <CoolingProfilesPage data={dashboardData} />
              )}

              {currentTab === "resource-efficiency" && (
                <ResourceEfficiencyPage data={dashboardData} />
              )}

              {currentTab === "energy-efficiency" && (
                <EnergyEfficiencyPage data={dashboardData} />
              )}

              {currentTab === "alerts" && (
                <AlertsPage alerts={dashboardData.alerts} />
              )}

              {currentTab === "settings" && (
                <SettingsPage onSettingsUpdated={() => loadData(scenario, currentServer)} />
              )}
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
};
export default App;
