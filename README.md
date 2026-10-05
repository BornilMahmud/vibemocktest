# SMART ESCAPE (স্মার্ট এস্কেপ)
### Real-Time Evacuation Route Simulator & Operations Deck

A mission-critical, frontend-only emergency evacuation pathfinder and tactical building simulator built for the AI DevFest Vibe-Coding Contest. In an emergency scenario (fire, debris, structural collapse), building occupants require immediate, deterministic, and hazard-resilient route computation to the nearest safe, open exit.

> **Note**: This application is strictly **100% FRONTEND-ONLY**. It runs entirely within the client's browser with an offline-first architecture. It does not use any server, serverless function, or participant-controlled external database.

---

## 🌟 Key Features

### Mandatory Features (P0 / P1)
- **100% Offline-First & Client-Side Execution**: All graph modeling, Dijkstra pathfinding, hazard exclusion, and simulation run locally in the browser with zero external network reliance.
- **Generalized Dynamic Dijkstra Pathfinder**:
  - Dynamically constructs the undirected graph from floorplan data.
  - Independent route computation unaffected by graphical coordinates.
  - Excludes blocked nodes and their incident corridors completely.
  - Excludes individually blocked corridor connections.
  - Excludes sealed/closed emergency exits.
  - Multi-exit pathfinding automatically picks the reachable open exit with minimum cumulative transit cost.
  - **Strict Deterministic Tie-Breaking**:
    1. Equal total path cost between exits $\rightarrow$ lexicographically smallest exit ID (`'E1'` before `'E2'`).
    2. Equal path cost to the same exit $\rightarrow$ lexicographically smallest node-ID sequence.
- **Official Contest Benchmark Scenarios Verified**:
  - **Scenario 1 (Baseline)**: Start `R1` $\rightarrow$ `R1 -> C1 -> C2 -> E1` (Cost: 7)
  - **Scenario 2 (Hazard Re-route)**: Block `C2` $\rightarrow$ `R1 -> C1 -> C3 -> C4 -> E2` (Cost: 11)
  - **Scenario 3 (All Exits Sealed)**: Close `E1` and `E2` $\rightarrow$ `NO SAFE ROUTE AVAILABLE`
  - **Scenario 4 (Alternate Origin)**: Start `R2` $\rightarrow$ `R2 -> C3 -> C4 -> E2` (Cost: 7)
  - **Scenario 5 (Trapped Origin)**: Select `R1` then block `R1` $\rightarrow$ `STARTING LOCATION BLOCKED`
- **Dynamic Interactive Hazard Controls**:
  - Select origin from dropdown or click directly on map nodes.
  - Toggle node hazards (fire/blockade) on the tactical map or control deck.
  - Toggle corridor blockades.
  - Toggle sealed/open exit doors.
  - One-click reset to benchmark baseline.
- **Comprehensive Bilingual Support (English & বাংলা)**:
  - Global, accessible language toggle in header.
  - 100% of headings, buttons, badges, errors, metrics, empty states, and system notifications translated without untranslated leakages.
- **Resilient JSON Dataset Validation**:
  - Drag-and-drop or paste custom floorplan JSON datasets.
  - Comprehensive schema validation: checks node unique IDs, valid types (`room`, `corridor`, `exit`), positive edge weights ($> 0$), coordinate numbers, and graph connectivity.
  - Granular, human-readable diagnostics with bilingual error and warning reporting.
  - Export current scenario (topology + active hazard state) with a single click.

### Bonus Polish Features
- **Tactical Interactive SVG Map**:
  - Responsive coordinate bounding box and auto-centering.
  - Glowing animated pulsing path along the calculated optimal route.
  - Radar beacon animation on starting origin.
  - Fire/hazard warning animations on blocked nodes and dashed red lines for blocked corridors.
  - Zoom controls (In, Out, Reset) and intuitive hover inspection.
- **Evacuation Step-Through Simulation Runner**:
  - Play, pause, step forward, and reset an animated evacuation agent moving along the optimal route node-by-node.
  - Configurable simulation speeds: `1x`, `2x`, and `4x`.
- **Offline Web Audio API Sound Effects**:
  - Synthetic tactical chimes on route found.
  - Alert buzzer on hazard detection.
  - Testable emergency evacuation wailing siren (100% offline, zero external audio assets).
- **Multiple Realistic Presets**:
  - Contest Benchmark Complex (Dual exit baseline)
  - Metropolitan Hospital (ICU Wing & Triage)
  - Cyber Defense Datacenter & Bunker

---

## 🛠️ Tech Stack
- **Framework**: React 19 + TypeScript (strict typing with `verbatimModuleSyntax`)
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
- **GitHub Repository**: [https://github.com/BornilMahmud/vibemocktest](https://github.com/BornilMahmud/vibemocktest)
- **Deployment Platform**: Vercel / Cloudflare Pages / GitHub Pages (Static HTTPS Frontend)

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
