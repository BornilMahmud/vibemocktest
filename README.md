# SMART ESCAPE (স্মার্ট এস্কেপ)
### Real-Time Evacuation Route Simulator & Operations Deck

A mission-critical, frontend-only emergency evacuation pathfinder and tactical building simulator built for the AI DevFest Vibe-Coding Contest. In an emergency scenario (fire, debris, structural collapse), building occupants require immediate, deterministic, and hazard-resilient route computation to the nearest safe, open exit.

> **Note**: This application is strictly **100% FRONTEND-ONLY**. It runs entirely within the client's browser with an offline-first architecture. It does not use any server, serverless function, or participant-controlled external database.

---

## 🌟 Key Features

### Architecture Overview
```
Input JSON
   ↓
Schema Validation & Sanitization
   ↓
Normalized Undirected Graph
   ↓
Hazard State (Blocked Nodes, Corridors, Closed Exits)
   ↓
Shortest Path Engine (Dijkstra + Priority Queue + Strict Tie-Break)
   ↓
Simulation State Machine
   ├── 2D Command Center (Route Intelligence & Explainability Engine)
   └── 3D Architectural World (Low-Poly Scene, Evacuee Avatar, Dynamic Lighting)
```

### 🌟 7 Pillars of Technical Excellence
1. **Algorithm Impossible to Doubt**: Fully generalized Dijkstra with priority queue ($O((V+E) \log V)$) operating on dynamic graph topologies (2–60 nodes, 1–150 edges) with zero pre-baked or hard-coded assumptions.
2. **Exact Contest Tie-Breaking**:
   - Lowest total path cost wins.
   - Equal cost between exits $\rightarrow$ lexicographically smallest exit ID (`'E1'` before `'E2'`).
   - Equal cost to same exit $\rightarrow$ lexicographically smallest node-ID sequence.
3. **Trapped / Failure Simulation Experience (Cinematic Best-Effort Traversal)**:
   - **Two Distinct Outcomes**:
     - *Success*: Agent smoothly navigates along the calculated route $\rightarrow$ exit glows brightly $\rightarrow$ calm atmosphere $\rightarrow$ NO SIREN $\rightarrow$ victory fanfare.
     - *Failure*: When no open exit is reachable, the simulation button remains enabled ("Simulate Escape Attempt"). The agent deterministically traverses accessible corridors up to the furthest safe reachable node (dead end). Upon arrival, character stops $\rightarrow$ route guidance fades $\rightarrow$ siren starts $\rightarrow$ rapid red emergency lights pulse (~180ms) $\rightarrow$ camera pushes in $\rightarrow$ cinematic "EVACUATION FAILED" overlay with Last Position and Exits Available: 0.
   - **Strict Siren Rule**: The simulation begins calmly and professionally. The siren is NEVER triggered at start or during normal evacuation; it sounds ONLY when a trapped/failure condition is reached.
   - **Dynamic In-Flight Rerouting**: If a newly injected hazard blocks the active path, the system immediately recalculates. If an alternative route exists, the agent redirects smoothly; if no escape exists, the agent continues safely to the furthest accessible point before entering the trapped sequence.
4. **Route Intelligence & Explainability Engine ("Why This Route?")**:
   - Step-by-step corridor cost breakdown (`R1 → C1: +2`, `C1 → C3: +4`, `C3 → C4: +3`, `C4 → E2: +2`, Total: `11`).
   - Evaluation matrix of all candidate exits (`E1: Sealed / Blocked`, `E2: Optimal (Cost 11)`).
   - Clear decision rationale explaining why an alternative exit was chosen.
5. **Live Operational System State Machine**:
   - Formal states: `IDLE` $\rightarrow$ `PREPARING` $\rightarrow$ `RUNNING` $\rightarrow$ `REROUTING` $\rightarrow$ `TRAPPED` $\rightarrow$ `SUCCESS` / `FAILED`.
6. **Real-Time In-Flight Rerouting**:
   - Dynamic hazard injection during evacuation transit immediately halts the agent safely, triggers an emergency reroute calculation, updates the luminous path, and seamlessly redirects the agent.
7. **High-Performance 3D Scene Architecture**:
   - Decoupled continuous 60fps Three.js animation loops (`useFrame` with refs) from React state rerenders.
   - Lightweight procedural geometry, reusable materials, minimal particle overhead, and responsive isometric camera choreography.

### Official Contest Benchmark Scenarios Verified:
- **Scenario 1 (Baseline)**: Start `R1` $\rightarrow$ `R1 -> C1 -> C2 -> E1` (Cost: 7)
- **Scenario 2 (Hazard Re-route)**: Block `C2` $\rightarrow$ `R1 -> C1 -> C3 -> C4 -> E2` (Cost: 11)
- **Scenario 3 (All Exits Sealed)**: Close `E1` and `E2` $\rightarrow$ `NO SAFE ROUTE AVAILABLE`
- **Scenario 4 (Alternate Origin)**: Start `R2` $\rightarrow$ `R2 -> C3 -> C4 -> E2` (Cost: 7)
- **Scenario 5 (Trapped Origin)**: Select `R1` then block `R1` $\rightarrow$ `STARTING LOCATION BLOCKED`
- **Tie-Break Edge 1**: Equal exit cost $\rightarrow$ picks `E1` over `E2`.
- **Tie-Break Edge 2**: Equal path cost to same exit $\rightarrow$ picks `START -> A -> EXIT` over `START -> B -> EXIT`.

### Building Data Inspector & JSON Diagnostic Engine:
- **Data Inspector**: Displays building name, total nodes, room/junction/exit breakdowns, corridors count, active hazards count, baseline initial state, and `● GRAPH HEALTH: VALID` badge.
- **Robust Error Diagnostics**: If an invalid file is uploaded (e.g. edge referencing unknown node `C8`), presents a high-contrast `DATASET INVALID` rejection report in English and বাংলা with exact problem identification and `[ TRY ANOTHER FILE ]` button.

---

## 🛠️ Tech Stack
- **Framework**: React 19 + TypeScript (strict typing with `verbatimModuleSyntax`)
- **3D Graphics**: Three.js, React Three Fiber (`@react-three/fiber`), `@react-three/drei`
- **Build Tool**: Vite 8 (instant HMR and sub-second production bundling)
- **Styling**: Tailwind CSS v4 + Custom Cyberpunk/Tactical Glassmorphism Theme
- **Icons**: Lucide React
- **Audio Engine**: Native Browser Web Audio API (Offline Synthesizer)
- **Quality Gates**: Oxlint + TypeScript type-checking + Automated Contest Scenario Test Runner

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/smart-escape.git
cd smart-escape

# Install dependencies
npm install

# Start development server
npm run dev
```
Open `http://localhost:5173/` in your browser.

### Run Verification Test Suite
To run the automated verification suite validating all 5 contest problem scenarios and tie-breaking algorithms:
```bash
npm run test
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🌐 Live Demo & Repository
- **Live URL**: [https://vibemocktest.vercel.app](https://vibemocktest.vercel.app)
- **GitHub Repository**: [https://github.com/BornilMahmud/vibemocktest](https://github.com/BornilMahmud/vibemocktest)
- **Deployment Platform**: Vercel (Continuous Deployment from `main` branch)

---

## 🤖 AI Tools Used
- **Antigravity IDE & Coding Assistant** (DeepMind Agentic Engine)
- **Gemini 3.8 Flash** model for planning, architectural breakdown, and code generation.

## 💡 Most Useful Prompt
> "Build the core generalized Dijkstra routing algorithm strictly according to contest constraints: corridors are undirected with positive weights; blocked nodes and their incident edges are unusable; blocked corridors remove only that edge; closed exits are removed; select the reachable open exit with minimum cost; break exit cost ties by lexicographically smallest exit ID, and path ties by lexicographically smallest node sequence. Verify all 5 sample scenarios without hard-coding outputs."

---

## ⚠️ Known Issues
- None. All 5 contest scenarios, edge cases, tie-breakers, bilingual modes, and responsive layouts pass all functional and visual quality gates.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
