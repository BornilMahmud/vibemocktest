import React from 'react';
import { Header } from './components/Header';
import { ControlCenter } from './components/ControlCenter';
import { MapVisualizer } from './components/MapVisualizer';
import { ThreeMapVisualizer } from './components/ThreeMapVisualizer';
import { RouteIntel } from './components/RouteIntel';
import { Legend } from './components/Legend';
import { ImportModal } from './components/ImportModal';
import type { FloorplanData, HazardState } from './types/graph';
import { CONTEST_BENCHMARK_PRESET } from './lib/presets';
import { computeOptimalRoute } from './lib/dijkstra';
import type { Language } from './i18n/translations';
import { playHazardAlertSound, playRouteFoundSound } from './lib/audio';

export function App() {
  const [language, setLanguage] = React.useState<Language>('en');
  const [viewMode, setViewMode] = React.useState<'3d' | '2d'>('3d');
  const [floorplan, setFloorplan] = React.useState<FloorplanData>(CONTEST_BENCHMARK_PRESET);
  const [startNodeId, setStartNodeId] = React.useState<string>('R1');

  const [hazards, setHazards] = React.useState<HazardState>({
    blockedNodes: new Set<string>(),
    blockedEdges: new Set<string>(),
    closedExits: new Set<string>(),
  });

  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);

  // Evacuation simulation runner state
  const [simulationStepIndex, setSimulationStepIndex] = React.useState<number>(0);
  const [isSimulating, setIsSimulating] = React.useState<boolean>(false);
  const [simulationSpeed, setSimulationSpeed] = React.useState<number>(1);

  // Reactive Optimal Route calculation via generalized Dijkstra
  const routeResult = React.useMemo(() => {
    return computeOptimalRoute(floorplan, startNodeId, hazards);
  }, [floorplan, startNodeId, hazards]);

  // Track previous status to play sound effects on transition
  const prevStatusRef = React.useRef(routeResult.status);
  React.useEffect(() => {
    if (prevStatusRef.current !== routeResult.status) {
      if (routeResult.status === 'OPTIMAL_ROUTE_FOUND') {
        playRouteFoundSound();
      } else if (
        routeResult.status === 'START_LOCATION_BLOCKED' ||
        routeResult.status === 'NO_ROUTE_AVAILABLE'
      ) {
        playHazardAlertSound();
      }
      prevStatusRef.current = routeResult.status;
    }
    // Reset simulation runner index when route recalculates
    setSimulationStepIndex(0);
    setIsSimulating(false);
  }, [routeResult.status, routeResult.path]);

  // Simulation timer loop
  React.useEffect(() => {
    if (!isSimulating) return;
    const intervalMs = 900 / simulationSpeed;
    const timer = setInterval(() => {
      setSimulationStepIndex((prev) => {
        if (prev >= routeResult.path.length - 1) {
          setIsSimulating(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isSimulating, simulationSpeed, routeResult.path.length]);

  // Toggle Node Hazard (blocked/unblocked)
  const handleToggleNodeHazard = React.useCallback((nodeId: string) => {
    setHazards((prev) => {
      const nextNodes = new Set(prev.blockedNodes);
      if (nextNodes.has(nodeId)) {
        nextNodes.delete(nodeId);
      } else {
        nextNodes.add(nodeId);
      }
      return { ...prev, blockedNodes: nextNodes };
    });
  }, []);

  // Toggle Edge Hazard
  const handleToggleEdgeHazard = React.useCallback((edgeId: string) => {
    setHazards((prev) => {
      const nextEdges = new Set(prev.blockedEdges);
      if (nextEdges.has(edgeId)) {
        nextEdges.delete(edgeId);
      } else {
        nextEdges.add(edgeId);
      }
      return { ...prev, blockedEdges: nextEdges };
    });
  }, []);

  // Toggle Exit Closed
  const handleToggleExitClosed = React.useCallback((exitId: string) => {
    setHazards((prev) => {
      const nextExits = new Set(prev.closedExits);
      if (nextExits.has(exitId)) {
        nextExits.delete(exitId);
      } else {
        nextExits.add(exitId);
      }
      return { ...prev, closedExits: nextExits };
    });
  }, []);

  // Clear all active hazards
  const handleClearHazards = React.useCallback(() => {
    setHazards({
      blockedNodes: new Set<string>(),
      blockedEdges: new Set<string>(),
      closedExits: new Set<string>(),
    });
  }, []);

  // Reset entire application to initial benchmark state
  const handleResetAll = React.useCallback(() => {
    setFloorplan(CONTEST_BENCHMARK_PRESET);
    setStartNodeId('R1');
    setHazards({
      blockedNodes: new Set<string>(),
      blockedEdges: new Set<string>(),
      closedExits: new Set<string>(),
    });
    setSimulationStepIndex(0);
    setIsSimulating(false);
  }, []);

  // Select new preset
  const handleSelectPreset = React.useCallback((preset: FloorplanData) => {
    setFloorplan(preset);
    const firstRoom = preset.nodes.find((n) => n.type === 'room') || preset.nodes[0];
    if (firstRoom) setStartNodeId(firstRoom.id);
    handleClearHazards();
  }, [handleClearHazards]);

  // Load imported JSON floorplan
  const handleLoadImportedFloorplan = React.useCallback((newFloorplan: FloorplanData) => {
    setFloorplan(newFloorplan);
    const firstRoom = newFloorplan.nodes.find((n) => n.type === 'room') || newFloorplan.nodes[0];
    if (firstRoom) setStartNodeId(firstRoom.id);
    handleClearHazards();
  }, [handleClearHazards]);

  // Export current scenario as JSON
  const handleExportJson = React.useCallback(() => {
    const exportData = {
      floorplan,
      simulationState: {
        startNodeId,
        blockedNodes: Array.from(hazards.blockedNodes),
        blockedEdges: Array.from(hazards.blockedEdges),
        closedExits: Array.from(hazards.closedExits),
        optimalRoute: routeResult.path,
        totalCost: routeResult.totalCost,
      },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-escape-scenario-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [floorplan, startNodeId, hazards, routeResult]);

  // One-click Contest Verification Scenarios (1 to 5)
  const handleApplyScenario = React.useCallback((scenarioIndex: number) => {
    // Reset to contest benchmark
    setFloorplan(CONTEST_BENCHMARK_PRESET);
    switch (scenarioIndex) {
      case 1:
        // Baseline: R1 Start, all clear -> R1 -> C1 -> C2 -> E1 (cost 7)
        setStartNodeId('R1');
        setHazards({
          blockedNodes: new Set<string>(),
          blockedEdges: new Set<string>(),
          closedExits: new Set<string>(),
        });
        break;
      case 2:
        // Block C2: R1 Start -> R1 -> C1 -> C3 -> C4 -> E2 (cost 11)
        setStartNodeId('R1');
        setHazards({
          blockedNodes: new Set<string>(['C2']),
          blockedEdges: new Set<string>(),
          closedExits: new Set<string>(),
        });
        break;
      case 3:
        // Close E1 and E2 -> No route available
        setStartNodeId('R1');
        setHazards({
          blockedNodes: new Set<string>(),
          blockedEdges: new Set<string>(),
          closedExits: new Set<string>(['E1', 'E2']),
        });
        break;
      case 4:
        // Start R2: R2 Start -> R2 -> C3 -> C4 -> E2 (cost 7)
        setStartNodeId('R2');
        setHazards({
          blockedNodes: new Set<string>(),
          blockedEdges: new Set<string>(),
          closedExits: new Set<string>(),
        });
        break;
      case 5:
        // Select R1 then block R1 -> Starting location blocked
        setStartNodeId('R1');
        setHazards({
          blockedNodes: new Set<string>(['R1']),
          blockedEdges: new Set<string>(),
          closedExits: new Set<string>(),
        });
        break;
      default:
        break;
    }
  }, []);

  // Keyboard navigation shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        handleClearHazards();
      }
      if (e.key === ' ') {
        e.preventDefault();
        setIsSimulating((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClearHazards]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* 1. Header with brand, live indicators, sound toggle, language switch, reset */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        onReset={handleResetAll}
        routeStatus={routeResult.status}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
      />

      {/* 2. Main Operations Center Layout */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto p-3 sm:p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch">
        {/* Left: Command Controls & Hazards Manager */}
        <ControlCenter
          floorplan={floorplan}
          startNodeId={startNodeId}
          onSelectStartNode={setStartNodeId}
          hazards={hazards}
          onToggleNodeHazard={handleToggleNodeHazard}
          onToggleEdgeHazard={handleToggleEdgeHazard}
          onToggleExitClosed={handleToggleExitClosed}
          onClearHazards={handleClearHazards}
          onSelectPreset={handleSelectPreset}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onExportJson={handleExportJson}
          onApplyScenario={handleApplyScenario}
          language={language}
        />

        {/* Center: Tactical Interactive Floorplan Map (3D Tactical Deck or 2D Blueprint) */}
        {viewMode === '3d' ? (
          <ThreeMapVisualizer
            floorplan={floorplan}
            startNodeId={startNodeId}
            onSelectStartNode={setStartNodeId}
            hazards={hazards}
            onToggleNodeHazard={handleToggleNodeHazard}
            onToggleEdgeHazard={handleToggleEdgeHazard}
            onToggleExitClosed={handleToggleExitClosed}
            routeResult={routeResult}
            simulationStepIndex={simulationStepIndex}
            isSimulating={isSimulating}
            language={language}
          />
        ) : (
          <MapVisualizer
            floorplan={floorplan}
            startNodeId={startNodeId}
            onSelectStartNode={setStartNodeId}
            hazards={hazards}
            onToggleNodeHazard={handleToggleNodeHazard}
            onToggleEdgeHazard={handleToggleEdgeHazard}
            onToggleExitClosed={handleToggleExitClosed}
            routeResult={routeResult}
            simulationStepIndex={simulationStepIndex}
            isSimulating={isSimulating}
            language={language}
          />
        )}

        {/* Right: Route Intelligence, Cost Metrics & Evacuation Simulator Deck */}
        <RouteIntel
          routeResult={routeResult}
          simulationStepIndex={simulationStepIndex}
          isSimulating={isSimulating}
          onToggleSimulate={() => setIsSimulating((prev) => !prev)}
          onStepSimulate={() => {
            setSimulationStepIndex((prev) =>
              Math.min(routeResult.path.length - 1, prev + 1)
            );
          }}
          onResetSimulate={() => {
            setSimulationStepIndex(0);
            setIsSimulating(false);
          }}
          simulationSpeed={simulationSpeed}
          onChangeSpeed={setSimulationSpeed}
          language={language}
        />
      </main>

      {/* 3. Bottom Operations Legend & Accessibility Navigation */}
      <Legend language={language} />

      {/* 4. Import & Validation Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onLoadFloorplan={handleLoadImportedFloorplan}
        language={language}
      />
    </div>
  );
}

export default App;
