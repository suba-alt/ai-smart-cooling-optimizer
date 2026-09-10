# AI Smart Cooling Optimizer
### AI-Based Water-Efficient Cooling Optimization for AI & Data-Center Infrastructure
**Smart India Hackathon (SIH) Software Prototype**

> **Scientific / Prototype Disclaimer:**
> *This is a 100% software-only prototype using simulated telemetry.* All water savings, energy savings, water stress indices, and equipment health indicators are simulated research estimates. The system provides software optimization recommendations and does not exercise direct physical control over industrial cooling hardware or real servers.

---

## 1. Project Overview & Mission

Modern artificial intelligence workloads, deep learning accelerators (GPUs/TPUs), and high-performance computing clusters generate immense heat flux. Traditional data-center thermal management frequently depends on water-intensive evaporative cooling towers or power-hungry mechanical chillers.

The mission of the **AI Smart Cooling Optimizer** is not simply to "replace water with dielectric liquid," but rather to provide an intelligent software decision engine that:
1. **Predicts** future 30-minute server temperatures, compute workloads, and cooling demand before heat accumulation occurs.
2. **Evaluates** real-time regional water availability to compute a normalized **Prototype Water Stress Score**.
3. **Applies** a strict thermal safety constraint across four distinct cooling profiles (**Direct Air**, **Water/Evaporative**, **Dielectric-Liquid Immersion**, and **Intelligent Hybrid**), guaranteeing that unsafe cooling strategies are automatically disqualified.
4. **Optimizes** the cooling strategy using a weighted multi-objective cost function, penalizing freshwater consumption under high water stress.
5. **Calculates** the minimum safe cooling percentage through predictive model iteration.
6. **Monitors** simulated dielectric-liquid fluid dynamics for heat exchanger degradation and maintenance warnings.
7. **Recommends** software workload rebalancing across server racks when thermal asymmetry is detected.
8. **Estimates** potential water and energy savings against legacy baseline operations.

---

## 2. End-to-End System Architecture

The prototype executes an end-to-end dataflow pipeline from telemetry generation to interactive dashboard display:

```
[Simulated Sensor Telemetry (7 Scenarios)]
                    │
                    ▼
       [Data Processing & Validation]
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
[AI Prediction Engine]   [Water Stress Engine]
 (RandomForest 30m)       (Prototype Score 0-100)
        └───────────┬───────────┘
                    │
                    ▼
     [Cooling Decision Engine]
  ├─ 1. Thermal Safety Constraint Filter (Excludes Unsafe Modes)
  ├─ 2. Weighted Resource Cost Scoring
  └─ 3. Iterative Minimum Cooling Level Search
                    │
                    ▼
     [Auxiliary Optimization Engines]
  ├─ Dielectric Health Monitoring (Fluid Dynamics & Degradation)
  ├─ Workload Optimization Engine (Cluster Rebalancing)
  └─ Resource & Energy Savings Engine (L/day & kWh/day Estimates)
                    │
                    ▼
    [AI Recommendation Synthesis]
  (Dynamic, human-readable rationale based on live data)
                    │
                    ▼
 [React + TypeScript + Tailwind + Recharts Dashboard]
```

---

## 3. Technology Stack

- **Frontend:** React 18, Vite 6, TypeScript 5, Tailwind CSS, Recharts, Axios, Lucide React
- **Backend:** Python 3.14 / 3.11+, Flask, Flask-CORS, python-dotenv, mysql-connector-python
- **Database:** MySQL (schema deliverable in `database/schema.sql`; auto-fallback to local SQLite for zero-friction turnkey evaluation)
- **AI / Data Science:** scikit-learn (`RandomForestRegressor`), NumPy, Pandas, Joblib
- **Testing & Tooling:** Python `unittest`, Postman Collection (`postman/`)

---

## 4. Four Cooling Profiles Evaluated

| Cooling Mode | Thermal Effectiveness | Water Consumption Factor | Energy Factor | Safe Envelope | Optimal Operating Condition |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Direct Air Cooling** | 0.65 (65%) | 0.00x (0 L/h) | 1.25x | 15°C – 75°C | Low-to-moderate compute loads and cool ambient environments. Marked **INVALID** under high heat loads. |
| **Water / Evaporative Cooling** | 0.85 (85%) | 1.00x (Baseline) | 0.80x | 15°C – 88°C | High heat rejection capability. Strongly penalized when water stress is elevated. |
| **Dielectric-Liquid Immersion** | 0.95 (95%) | 0.05x (-95%) | 0.55x (-45%) | 10°C – 95°C | Extreme heat flux dissipation with negligible freshwater reliance and superior energy efficiency. |
| **Intelligent Hybrid Cooling** | 0.88 (88%) | 0.25x (-75%) | 0.70x (-30%) | 15°C – 90°C | Dynamic balance between closed-loop liquid transfer and variable airflow assist. |

---

## 5. Live Simulation Scenarios

The simulator implements 7 named operational scenarios accessible via dashboard controls:
1. **Normal Workload:** Nominal compute utilization (GPU 50-65%), normal ambient temperature (24°C), balanced water reserves.
2. **Low Workload:** Off-peak server activity (GPU 15-25%), allowing cooling levels to throttle down and conserve parasitic energy.
3. **High Workload:** Sustained AI training load (GPU 88-94%), requiring aggressive thermal mitigation.
4. **High Workload + High Water Stress (Section 21 One-Click Demo):** Reference condition: GPU 92%, CPU 87%, Server load 90%, Power 470W, Temp 84°C, Water Stress 85/100. Disqualifies Air Cooling, penalizes Evaporative Cooling, selects Dielectric Immersion, and recommends workload shifting.
5. **Thermal Spike:** Extreme burst compute (>95% load, >90°C). Triggers CRITICAL risk alerts and maximum cooling levels.
6. **Dielectric Degradation:** Simulates dielectric efficiency degradation (dropping from 0.96 to 0.72) and liquid temperature rise. Triggers maintenance inspection alert.
7. **Recovery Condition:** Post-event stabilization and cooling relaxation.

---

## 6. Machine Learning Engine & Validation

The system employs three lightweight `RandomForestRegressor` models trained on synthetic operational telemetry:
- **Temperature Predictor:** Forecasts server temperature 30 minutes in advance ($R^2 = 0.9929$, $	ext{MAE} = 0.983^\circ	ext{C}$).
- **Workload Predictor:** Forecasts future cluster load ($R^2 = 0.9271$, $	ext{MAE} = 4.09\%$).
- **Cooling Demand Predictor:** Estimates target cooling percentage ($R^2 = 0.9818$, $	ext{MAE} = 2.60\%$).

All accuracy metrics are computed for real on a 20% test split during training and exported to `backend/ml/trained_models/model_metrics.json` (never fabricated).

---

## 7. Installation & Quick Start

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ & npm
- (Optional) MySQL Server 8.0+ (If MySQL is not installed, the application automatically uses local SQLite without any setup required).

### Backend Setup
```bash
cd backend

# Create virtual environment (optional)
python -m venv venv
venv\Scripts\activate   # On Windows
# source venv/bin/activate  # On Linux/macOS

# Install dependencies
pip install -r requirements.txt

# (Optional) Retrain ML models if desired
python ml/train_model.py

# Run the Flask backend server
python app.py
```
*Backend runs on `http://localhost:5000`.*

### Frontend Setup
```bash
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev

# Or build production bundle
npm run build
npm run preview
```
*Frontend runs on `http://localhost:3000` (or `http://localhost:5173`).*

---

## 8. Database Architecture

Database name: `ai_cooling_optimizer`

Delivered schema: `database/schema.sql`
- `server_metrics`: Multi-sensor telemetry (temperatures, power, loads, water availability, dielectric liquid status).
- `predictions`: Model forecast targets, 30-min horizon, confidence bounds.
- `recommendations`: Dynamic AI decision logs, chosen mode, cooling percentage, rationale.
- `cooling_profiles`: Seeded cooling mode specifications and physical operating factors.
- `water_savings`: Baseline vs optimized water consumption tracking and saving percentages.
- `energy_savings`: Baseline vs optimized cooling power tracking and saving percentages.
- `alerts`: System, thermal, water stress, and dielectric degradation warning logs.

---

## 9. Automated Testing

Run the full automated test suite covering all 10 required test cases + auxiliary scenario verifications:

```bash
cd ai-smart-cooling-optimizer
python tests/test_all.py
```

Test Coverage:
1. Low workload scenario thermal relaxation
2. High workload scenario thermal escalation
3. High workload + high water stress mode selection
4. Thermal spike critical threshold handling
5. Dielectric degradation warning and alert triggers
6. Recovery condition stabilization
7. Invalid / empty telemetry fault tolerance
8. API error codes (400 Bad Request, 404 Not Found)
9. Safety constraint enforcement (unsafe mode is never selected)
10. Resource saving calculation correctness
11. Dynamic recommendation change verification
12. Multi-server workload rebalancing trigger verification

---

## 10. Postman Collection & API Documentation

A complete Postman collection is provided in `postman/ai_cooling_optimizer.postman_collection.json`.
Full endpoint specifications with sample requests and responses are documented in `postman/API_DOCUMENTATION.md`.

All 12 required endpoints are implemented:
- `GET /api/telemetry`
- `POST /api/predict`
- `POST /api/cooling-decision`
- `GET /api/liquid-health`
- `GET /api/dashboard`
- `POST /api/control/recommendation` (Simulation Only)
- `POST /api/simulate`
- `GET /api/alerts`
- `GET /api/water-saving`
- `GET /api/energy-saving`
- `GET /api/cooling-profiles`
- `POST /api/workload-optimize`
- Auxiliary endpoints: `GET/POST /api/settings`, `GET /api/ml-metrics`

---

## 11. Limitations (Scientific Perspective)

- **Simulated Telemetry:** The prototype operates entirely on simulated physics-grounded telemetry. Real-world deployment requires integration with hardware telemetry interfaces (IPMI, Redfish, NVIDIA NVML).
- **Cooling Performance Validation:** Profile factors (heat exchange effectiveness, water factors) are simulation parameters based on typical engineering literature and require empirical validation in a specific mechanical plant.
- **Immersion Design:** Physical dielectric liquid selection requires material compatibility analysis (elastomers, signal integrity at high frequencies) and immersion tank secondary loop engineering.
- **Resource Estimates:** Water and energy savings are modeled against legacy baseline cooling towers; facility-wide PUE depends on external ambient wet-bulb temperatures and chiller infrastructure.
- **Safety Interlocks:** Physical equipment control requires hardware interlocks, manual overrides, and authorized industrial control protocols (BMS/DCIM).

---

## 12. Future Scope (Non-Implemented Architecture Roadmap)

- **Direct Hardware Ingestion:** Ingestion of live GPU metrics via `pynvml` and server chassis telemetry via BMC/Redfish REST APIs.
- **Facility Integration:** Integration with building management systems via BACnet/IP, Modbus TCP, or MQTT.
- **Advanced Forecasting:** Physics-informed neural networks (PINN) or temporal transformer architectures for long-range seasonal weather adaptation.
- **Multi-Facility Geo-Load Shifting:** Routing AI compute jobs across geographic regions to follow low water-stress zones and clean renewable energy availability.
- **Digital Twin:** Full 3D CFD thermal simulation of immersion tanks and rack airflow dynamics.

---

## 13. Project Size & Submission Guidance (Section 30)

| Component | Size | Submission Status |
| :--- | :---: | :--- |
| **Backend Source Code** | ~121 KB | **Included** |
| **Frontend Source Code (`src/`)** | ~101 KB | **Included** |
| **Synthetic Operational Dataset** | 687 KB (0.67 MB) | **Included** (< 20 MB target) |
| **Saved ML Models (`.joblib`)** | ~17.3 MB | **Included** |
| **Database Schema (`schema.sql`)** | ~4 KB | **Included** |
| **Postman Docs & Collection** | ~18 KB | **Included** |
| **Total Committable Size** | **~18.4 MB** | **Comfortably under 500 MB limit (96% headroom)** |
| `node_modules/` | ~210 MB | **EXCLUDED** (recreated via `npm install`) |
| Python `.venv/` | ~150 MB | **EXCLUDED** (recreated via `pip install -r requirements.txt`) |
| `__pycache__` / build caches | - | **EXCLUDED** via `.gitignore` |

---

## 14. Final Acceptance Checklist

- [x] Backend runs successfully on Python 3.14/3.11+
- [x] Frontend runs and builds cleanly via Vite + React + TypeScript
- [x] MySQL schema provided; automatic SQLite fallback enabled for zero-setup execution
- [x] Physics-grounded simulator supports all 7 named scenarios
- [x] Lightweight ML models train with honest, un-fabricated MAE, RMSE, R² metrics
- [x] 30-minute horizon temperature, workload, and cooling demand forecasting
- [x] Prototype Water Stress Score (0–100) dynamically calculated and penalizes water usage
- [x] 4 cooling profiles evaluated every run
- [x] Safety constraint strictly invalidates unsafe cooling modes
- [x] Minimum safe cooling level calculated via predictive model iteration
- [x] Dielectric fluid health monitored (Normal / Warning / Critical)
- [x] Multi-server workload rebalancing recommendations generated
- [x] Dynamic water and energy savings estimated and labeled responsibly
- [x] Simulated Control Panel operates in "Simulation Only" mode
- [x] Recharts render live telemetry and projection trends
- [x] One-Click Demo ("High AI Workload + High Water Stress") fully functional
- [x] 100% test pass rate across 12 automated unit tests
- [x] Full Postman documentation and collection included
- [x] Total project size (18.4 MB) is comfortably under the 500 MB ceiling
