import axios from "axios";
import { DashboardData, Settings, Telemetry, Prediction, Alert } from "../types";

const client = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const apiService = {
  async getDashboard(scenario?: string, serverId: string = "server_01"): Promise<DashboardData> {
    const res = await client.get("/dashboard", {
      params: { scenario, server_id: serverId },
    });
    return res.data.data;
  },

  async runSimulation(scenario: string, serverId: string = "server_01"): Promise<DashboardData> {
    const res = await client.post("/simulate", {
      scenario,
      server_id: serverId,
    });
    return res.data.data;
  },

  async applyControl(action: "accept" | "switch_mode", payload: { server_id?: string; mode?: string; cooling_level?: number }) {
    const res = await client.post("/control/recommendation", {
      action,
      ...payload,
    });
    return res.data;
  },

  async getTelemetry(serverId: string = "server_01"): Promise<{ latest: Telemetry; history: Telemetry[] }> {
    const res = await client.get("/telemetry", { params: { server_id: serverId } });
    return res.data.data;
  },

  async getAlerts(): Promise<Alert[]> {
    const res = await client.get("/alerts");
    return res.data.data;
  },

  async getCoolingProfiles() {
    const res = await client.get("/cooling-profiles");
    return res.data.data;
  },

  async getWaterSaving() {
    const res = await client.get("/water-saving");
    return res.data.data;
  },

  async getEnergySaving() {
    const res = await client.get("/energy-saving");
    return res.data.data;
  },

  async getSettings(): Promise<Settings> {
    const res = await client.get("/settings");
    return res.data.data;
  },

  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    const res = await client.post("/settings", settings);
    return res.data.data;
  },

  async getMLMetrics() {
    const res = await client.get("/ml-metrics");
    return res.data.data;
  },
};
