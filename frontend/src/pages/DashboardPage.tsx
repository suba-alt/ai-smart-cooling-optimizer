import React from "react";
import { DashboardData } from "../types";
import { ScenarioSelector } from "../components/ScenarioSelector";
import { KPICards } from "../components/KPICards";
import { RecommendationCard } from "../components/RecommendationCard";
import { CoolingModesPanel } from "../components/CoolingModesPanel";
import { SimulatedControlPanel } from "../components/SimulatedControlPanel";
import { DielectricHealthCard } from "../components/DielectricHealthCard";
import { AlertsPanel } from "../components/AlertsPanel";
import { TempTimeChart } from "../components/Charts/TempTimeChart";
import { ActualVsPredictedChart } from "../components/Charts/ActualVsPredictedChart";
import { GpuVsTempChart } from "../components/Charts/GpuVsTempChart";
import { CoolingVsTempChart } from "../components/Charts/CoolingVsTempChart";
import { WaterSavingsChart } from "../components/Charts/WaterSavingsChart";
import { EnergySavingsChart } from "../components/Charts/EnergySavingsChart";

interface DashboardPageProps {
  data: DashboardData;
  onScenarioChange: (scenario: string) => void;
  onRunSimulation: () => void;
  onApplyControl: (action: "accept" | "switch_mode", payload: { mode?: string; cooling_level?: number }) => Promise<void>;
  isLoading: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  data,
  onScenarioChange,
  onRunSimulation,
  onApplyControl,
  isLoading,
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* 1. Scenario Selector & 1-Click Demo */}
      <ScenarioSelector
        currentScenario={data.scenario}
        onScenarioChange={onScenarioChange}
        onRunSimulation={onRunSimulation}
        isLoading={isLoading}
      />

      {/* 2. Top KPI Cards */}
      <KPICards
        telemetry={data.telemetry}
        prediction={data.prediction}
        waterStress={data.water_stress}
        thermalRisk={data.thermal_risk}
      />

      {/* 3. AI Recommendation & Control Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecommendationCard
            recommendation={data.recommendation}
            coolingLevelOpt={data.cooling_level_optimization}
          />
        </div>
        <div>
          <SimulatedControlPanel
            currentMode={data.simulation_state.current_cooling_mode}
            recommendedModeId={data.cooling_decision.recommended_mode_id}
            recommendedModeName={data.cooling_decision.recommended_mode_name}
            currentLevel={data.simulation_state.current_cooling_level}
            recommendedLevel={data.cooling_level_optimization.recommended_cooling_level}
            onApplyControl={onApplyControl}
          />
        </div>
      </div>

      {/* 4. Cooling Modes Evaluation Panel */}
      <CoolingModesPanel decision={data.cooling_decision} />

      {/* 5. Health & Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DielectricHealthCard health={data.dielectric_health} />
        <AlertsPanel alerts={data.alerts} />
      </div>

      {/* 6. Real-Time Telemetry & Projection Charts (6 Required Charts) */}
      <div className="pt-2">
        <h3 className="text-base font-bold text-white mb-1">Live Telemetry & Optimization Analytics</h3>
        <p className="text-xs text-slate-400 mb-4">Real-time charts plotting simulated multi-sensor telemetry and ML predictions</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TempTimeChart data={data.history} />
          <ActualVsPredictedChart
            history={data.history}
            prediction={data.prediction}
            safeLimit={data.thermal_risk.safe_temperature_limit}
          />
          <GpuVsTempChart history={data.history} />
          <CoolingVsTempChart history={data.history} />
          <WaterSavingsChart savings={data.savings} />
          <EnergySavingsChart savings={data.savings} />
        </div>
      </div>
    </div>
  );
};
