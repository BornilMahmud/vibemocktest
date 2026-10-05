import React from 'react';
import { Header } from './components/Header';
import { ControlCenter } from './components/ControlCenter';
import { MapVisualizer } from './components/MapVisualizer';
import { BuildingScene, useCoordinateMapping } from './components/3d/BuildingScene';
import { SimulationOverlay } from './components/SimulationOverlay';
import { RouteIntel } from './components/RouteIntel';
import { Legend } from './components/Legend';
import { ImportModal } from './components/ImportModal';
import { InitialLoader } from './components/InitialLoader';
import { CinematicProductReel } from './components/CinematicProductReel';
import type { FloorplanData, HazardState, GraphNode } from './types/graph';
import type { SimulationPhase, CameraViewMode } from './types/simulation';
import { CONTEST_BENCHMARK_PRESET } from './lib/presets';
import { computeOptimalRoute } from './lib/dijkstra';
import { findBestEffortPath } from './lib/traversal';
import type { Language } from './i18n/translations';
import { 
  playHazardAlertSound, 
  playRouteFoundSound, 
  startSiren, 
  stopSiren, 
  playSuccessFanfare, 
  playFailureAlarm, 
  getSoundEnabled, 
  setSoundEnabled 
} from './lib/audio';

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
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [isProductReelOpen, setIsProductReelOpen] = React.useState(false);

  // -------------------------------------------------------------
  // CINEMATIC SIMULATION STATE MACHINE
  // -------------------------------------------------------------
  const [isCinematicMode, setIsCinematicMode] = React.useState(false);
  const [simulationPhase, setSimulationPhase] = React.useState<SimulationPhase>('IDLE');
  const [cameraMode, setCameraMode] = React.useState<CameraViewMode>('FOLLOW');
  const [simulationSpeed, setSimulationSpeed] = React.useState<number>(1);
  const [traversedCount, setTraversedCount] = React.useState<number>(0);
  const [rerouteNotice, setRerouteNotice] = React.useState<string | null>(null);

  // Active Simulation Path (Supports optimal route or best-effort safe trapped traversal)
  const [activeSimulationPath, setActiveSimulationPath] = React.useState<string[]>([]);
  const [isTrappedRun, setIsTrappedRun] = React.useState<boolean>(false);
  const [lastPositionId, setLastPositionId] = React.useState<string>('R1');
  const trappedTimersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTrappedTimers = React.useCallback(() => {
    trappedTimersRef.current.forEach(t => clearTimeout(t));
    trappedTimersRef.current = [];
  }, []);

  // Agent Waypoint Motion State
  const [currentWaypointIdx, setCurrentWaypointIdx] = React.useState<number>(0);
  const [segmentProgress, setSegmentProgress] = React.useState<number>(0); // 0.0 to 1.0

  // -------------------------------------------------------------
  // REACIVE OPTIMAL ROUTE ENGINE
  // -------------------------------------------------------------
  const routeResult = React.useMemo(() => {
    return computeOptimalRoute(floorplan, startNodeId, hazards);
  }, [floorplan, startNodeId, hazards]);

  // Track status transitions to trigger audio effects
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
  }, [routeResult.status]);

  // Coordinate mapping for 3D world
  const { to3D } = useCoordinateMapping(floorplan);
  const nodeMap = React.useMemo(() => {
    const map = new Map<string, GraphNode>();
    floorplan.nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [floorplan.nodes]);

  // Calculate current agent 3D world position and rotation
  const { agentPosition, agentRotationY, isAgentWalking } = React.useMemo(() => {
    const currentPath = isCinematicMode && activeSimulationPath.length > 0 
      ? activeSimulationPath 
      : (routeResult.status === 'OPTIMAL_ROUTE_FOUND' ? routeResult.path : []);

    if (currentPath.length === 0) {
      const startN = nodeMap.get(startNodeId);
      const pos = startN ? to3D(startN) : [0, 0, 0];
      return { agentPosition: [pos[0], 0.1, pos[2]] as [number, number, number], agentRotationY: 0, isAgentWalking: false };
    }

    const idx = Math.min(currentWaypointIdx, currentPath.length - 1);
    const currNode = nodeMap.get(currentPath[idx]);

    if (!currNode) {
      return { agentPosition: [0, 0.1, 0] as [number, number, number], agentRotationY: 0, isAgentWalking: false };
    }

    // If at final waypoint or not walking between segments
    if (idx >= currentPath.length - 1) {
      const p = to3D(currNode);
      return {
        agentPosition: [p[0], 0.1, p[2]] as [number, number, number],
        agentRotationY: 0,
        isAgentWalking: false,
      };
    }

    // Interpolate between currentPath[idx] and currentPath[idx + 1]
    const nextNode = nodeMap.get(currentPath[idx + 1]);
    if (!nextNode) {
      const p = to3D(currNode);
      return { agentPosition: [p[0], 0.1, p[2]] as [number, number, number], agentRotationY: 0, isAgentWalking: false };
    }

    const pA = to3D(currNode);
    const pB = to3D(nextNode);

    const x = pA[0] + (pB[0] - pA[0]) * segmentProgress;
    const z = pA[2] + (pB[2] - pA[2]) * segmentProgress;
    const rotY = Math.atan2(pB[0] - pA[0], pB[2] - pA[2]);

    const isWalking = simulationPhase === 'RUNNING';

    return {
      agentPosition: [x, 0.1, z] as [number, number, number],
      agentRotationY: rotY,
      isAgentWalking: isWalking,
    };
  }, [isCinematicMode, activeSimulationPath, routeResult, currentWaypointIdx, segmentProgress, simulationPhase, nodeMap, startNodeId, to3D]);

  // -------------------------------------------------------------
  // SIMULATION PLAYBACK & MOVEMENT LOOP
  // -------------------------------------------------------------
  React.useEffect(() => {
    if (simulationPhase !== 'RUNNING') return;

    const intervalTime = 30; // 30ms step
    const timer = setInterval(() => {
      setSegmentProgress((prev) => {
        const stepIncrement = (0.018 * simulationSpeed);
        const next = prev + stepIncrement;

        if (next >= 1.0) {
          // Reached next waypoint!
          setCurrentWaypointIdx((currIdx) => {
            const currentPath = activeSimulationPath.length > 0 ? activeSimulationPath : routeResult.path;
            const pathLen = currentPath.length;
            const nextIdx = currIdx + 1;
            setTraversedCount(c => c + 1);

            if (nextIdx >= pathLen - 1) {
              const finalNode = currentPath[pathLen - 1] || startNodeId;
              setLastPositionId(finalNode);

              if (isTrappedRun) {
                // Character reached final safe point where no safe continuation exists!
                // Section 7 STUCK MOMENT:
                // 0.0s: reaches final safe point
                // 0.3s: character stops
                // 0.45s: route begins fading
                // 0.75s: siren starts
                // 0.80s: red emergency lights pulse
                // 1.40s: failure modal
                setSimulationPhase('TRAPPED');
                setCameraMode('TRAPPED');

                clearTrappedTimers();

                // 750ms: Siren starts
                const sirenTimer = setTimeout(() => {
                  startSiren();
                }, 750);

                // 1450ms: Camera pulls back slightly, Failure overlay appears
                const failTimer = setTimeout(() => {
                  setSimulationPhase('FAILED');
                  setCameraMode('FAILED');
                  playFailureAlarm();
                }, 1450);

                // Stop siren after 4.5 seconds so it doesn't drone on forever
                const stopSirenTimer = setTimeout(() => {
                  stopSiren();
                }, 4500);

                trappedTimersRef.current.push(sirenTimer, failTimer, stopSirenTimer);

                return pathLen - 1;
              } else {
                // Reached Exit Gate! Trigger Victory
                setSimulationPhase('SUCCESS');
                setCameraMode('EXIT');
                stopSiren();
                playSuccessFanfare();
                return pathLen - 1;
              }
            }
            return nextIdx;
          });
          return 0; // Reset progress for the next corridor
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [simulationPhase, simulationSpeed, activeSimulationPath, routeResult.path, isTrappedRun, startNodeId, clearTrappedTimers]);

  // -------------------------------------------------------------
  // DYNAMIC REROUTING DURING SIMULATION
  // -------------------------------------------------------------
  const handleDynamicHazardTrigger = React.useCallback((type: 'node' | 'edge' | 'exit', id: string) => {
    // If not currently running in simulation, normal hazard toggle
    if (simulationPhase !== 'RUNNING') return;

    // Check if the hazard affects the current remaining route
    const currentPath = activeSimulationPath.length > 0 ? activeSimulationPath : routeResult.path;
    const currentNodeId = currentPath[currentWaypointIdx] || startNodeId;

    // Flash rerouting banner
    setSimulationPhase('REROUTING');
    setRerouteNotice(
      language === 'bn'
        ? '⚠️ রুট বিঘ্নিত হয়েছে! বিকল্প নিরাপদ পথ সন্ধান করা হচ্ছে...'
        : '⚠️ ROUTE INTERRUPTED! Recalculating alternative escape vector...'
    );

    setTimeout(() => {
      // Re-evaluate from current node
      const updatedHazards: HazardState = {
        blockedNodes: new Set(hazards.blockedNodes),
        blockedEdges: new Set(hazards.blockedEdges),
        closedExits: new Set(hazards.closedExits),
      };

      if (type === 'node') {
        if (updatedHazards.blockedNodes.has(id)) updatedHazards.blockedNodes.delete(id);
        else updatedHazards.blockedNodes.add(id);
      } else if (type === 'edge') {
        if (updatedHazards.blockedEdges.has(id)) updatedHazards.blockedEdges.delete(id);
        else updatedHazards.blockedEdges.add(id);
      } else if (type === 'exit') {
        if (updatedHazards.closedExits.has(id)) updatedHazards.closedExits.delete(id);
        else updatedHazards.closedExits.add(id);
      }

      const rerouted = computeOptimalRoute(floorplan, currentNodeId, updatedHazards);

      if (rerouted.status === 'OPTIMAL_ROUTE_FOUND') {
        setRerouteNotice(
          language === 'bn'
            ? '✓ নতুন নিরাপদ রুট নির্ণীত! উদ্ধারকারী পুনর্নির্দেশিত হচ্ছে।'
            : '✓ NEW SAFE ROUTE SECURED! Agent redirecting.'
        );
        setActiveSimulationPath([currentNodeId, ...rerouted.path.slice(1)]);
        setIsTrappedRun(false);
        setCurrentWaypointIdx(0);
        setSegmentProgress(0);
        setSimulationPhase('RUNNING');
        setCameraMode('FOLLOW');
        setTimeout(() => setRerouteNotice(null), 3000);
      } else {
        // Dynamic failure: no alternative route exists
        const fallbackBestEffort = findBestEffortPath(floorplan, currentNodeId, updatedHazards);
        if (fallbackBestEffort.length > 1) {
          setRerouteNotice(
            language === 'bn'
              ? '⚠️ কোনো উন্মুক্ত নির্গমনপথ নেই — নিরাপদ সীমা পর্যন্ত অনুসন্ধান চালানো হচ্ছে...'
              : '⚠️ NO OPEN EXIT REACHABLE — Re-routing to furthest safe area...'
          );
          setActiveSimulationPath(fallbackBestEffort);
          setIsTrappedRun(true);
          setCurrentWaypointIdx(0);
          setSegmentProgress(0);
          setSimulationPhase('RUNNING');
          setCameraMode('FOLLOW');
          setTimeout(() => setRerouteNotice(null), 3000);
        } else {
          // Trapped immediately right here!
          setLastPositionId(currentNodeId);
          setRerouteNotice(null);
          setSimulationPhase('TRAPPED');
          setCameraMode('TRAPPED');
          clearTrappedTimers();
          const sirenTimer = setTimeout(() => startSiren(), 750);
          const failTimer = setTimeout(() => {
            setSimulationPhase('FAILED');
            setCameraMode('FAILED');
            playFailureAlarm();
          }, 1450);
          const stopTimer = setTimeout(() => stopSiren(), 4500);
          trappedTimersRef.current.push(sirenTimer, failTimer, stopTimer);
        }
      }
    }, 600);
  }, [simulationPhase, activeSimulationPath, routeResult.path, currentWaypointIdx, startNodeId, language, hazards, floorplan, clearTrappedTimers]);

  // -------------------------------------------------------------
  // SIMULATION ACTIONS (START, PAUSE, RESTART, EXIT)
  // -------------------------------------------------------------
  const handleStartSimulation = React.useCallback(() => {
    clearTrappedTimers();
    stopSiren(); // RULE: NEVER play siren when simulation starts normally!

    if (routeResult.status === 'OPTIMAL_ROUTE_FOUND') {
      setActiveSimulationPath(routeResult.path);
      setIsTrappedRun(false);
      setLastPositionId(routeResult.path[routeResult.path.length - 1] || startNodeId);
      setIsCinematicMode(true);
      setSimulationPhase('RUNNING');
      setCameraMode('FOLLOW');
      setCurrentWaypointIdx(0);
      setSegmentProgress(0);
      setTraversedCount(0);
      setRerouteNotice(null);
    } else {
      // TRAPPED / NO ROUTE AVAILABLE CASE
      const bestEffort = findBestEffortPath(floorplan, startNodeId, hazards);
      setActiveSimulationPath(bestEffort);
      setIsTrappedRun(true);
      setLastPositionId(bestEffort[bestEffort.length - 1] || startNodeId);
      setIsCinematicMode(true);
      setSimulationPhase('RUNNING');
      setCameraMode('FOLLOW');
      setCurrentWaypointIdx(0);
      setSegmentProgress(0);
      setTraversedCount(0);
      setRerouteNotice(
        language === 'bn'
          ? 'উন্মুক্ত কোনো নির্গমনপথ নেই — নিরাপদ সীমা পর্যন্ত অনুসন্ধান চালানো হচ্ছে...'
          : 'NO OPEN EXIT FOUND — Conducting best-effort evacuation attempt...'
      );
      setTimeout(() => setRerouteNotice(null), 3500);

      // If best effort path has no forward traversal (already at dead end or start node blocked),
      // transition smoothly to trapped after a brief realization beat
      if (bestEffort.length <= 1) {
        const immediateTrapped = setTimeout(() => {
          setSimulationPhase('TRAPPED');
          setCameraMode('TRAPPED');
          const sirenTimer = setTimeout(() => startSiren(), 750);
          const failTimer = setTimeout(() => {
            setSimulationPhase('FAILED');
            setCameraMode('FAILED');
            playFailureAlarm();
          }, 1450);
          const stopTimer = setTimeout(() => stopSiren(), 4500);
          trappedTimersRef.current.push(sirenTimer, failTimer, stopTimer);
        }, 600);
        trappedTimersRef.current.push(immediateTrapped);
      }
    }
  }, [routeResult, floorplan, startNodeId, hazards, language, clearTrappedTimers]);

  const handlePauseResumeSimulation = React.useCallback(() => {
    if (simulationPhase === 'RUNNING') {
      setSimulationPhase('PAUSED');
      stopSiren();
    } else if (simulationPhase === 'PAUSED') {
      setSimulationPhase('RUNNING');
      // No siren on resume
    }
  }, [simulationPhase]);

  const handleRestartSimulation = React.useCallback(() => {
    clearTrappedTimers();
    stopSiren(); // NEVER play siren when restarting!
    setCurrentWaypointIdx(0);
    setSegmentProgress(0);
    setTraversedCount(0);
    setSimulationPhase('RUNNING');
    setCameraMode('FOLLOW');
    setRerouteNotice(null);

    // If it was already a trapped single-node run, replay trapped
    if (isTrappedRun && activeSimulationPath.length <= 1) {
      const immediateTrapped = setTimeout(() => {
        setSimulationPhase('TRAPPED');
        setCameraMode('TRAPPED');
        const sirenTimer = setTimeout(() => startSiren(), 750);
        const failTimer = setTimeout(() => {
          setSimulationPhase('FAILED');
          setCameraMode('FAILED');
          playFailureAlarm();
        }, 1450);
        const stopTimer = setTimeout(() => stopSiren(), 4500);
        trappedTimersRef.current.push(sirenTimer, failTimer, stopTimer);
      }, 600);
      trappedTimersRef.current.push(immediateTrapped);
    }
  }, [clearTrappedTimers, isTrappedRun, activeSimulationPath]);

  const handleExitSimulation = React.useCallback(() => {
    clearTrappedTimers();
    setIsCinematicMode(false);
    setSimulationPhase('IDLE');
    setCameraMode('OVERVIEW');
    stopSiren();
    setCurrentWaypointIdx(0);
    setSegmentProgress(0);
    setRerouteNotice(null);
    setIsTrappedRun(false);
  }, [clearTrappedTimers]);

  // -------------------------------------------------------------
  // HAZARD MANAGEMENT HANDLERS
  // -------------------------------------------------------------
  const handleToggleNodeHazard = React.useCallback((nodeId: string) => {
    if (isCinematicMode) {
      handleDynamicHazardTrigger('node', nodeId);
    }
    setHazards((prev) => {
      const next = new Set(prev.blockedNodes);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return { ...prev, blockedNodes: next };
    });
  }, [isCinematicMode, handleDynamicHazardTrigger]);

  const handleToggleEdgeHazard = React.useCallback((edgeId: string) => {
    if (isCinematicMode) {
      handleDynamicHazardTrigger('edge', edgeId);
    }
    setHazards((prev) => {
      const next = new Set(prev.blockedEdges);
      if (next.has(edgeId)) next.delete(edgeId);
      else next.add(edgeId);
      return { ...prev, blockedEdges: next };
    });
  }, [isCinematicMode, handleDynamicHazardTrigger]);

  const handleToggleExitClosed = React.useCallback((exitId: string) => {
    if (isCinematicMode) {
      handleDynamicHazardTrigger('exit', exitId);
    }
    setHazards((prev) => {
      const next = new Set(prev.closedExits);
      if (next.has(exitId)) next.delete(exitId);
      else next.add(exitId);
      return { ...prev, closedExits: next };
    });
  }, [isCinematicMode, handleDynamicHazardTrigger]);

  const handleClearHazards = React.useCallback(() => {
    setHazards({
      blockedNodes: new Set<string>(),
      blockedEdges: new Set<string>(),
      closedExits: new Set<string>(),
    });
    setRerouteNotice(null);
  }, []);

  const handleResetAll = React.useCallback(() => {
    handleExitSimulation();
    setFloorplan(CONTEST_BENCHMARK_PRESET);
    setStartNodeId('R1');
    handleClearHazards();
  }, [handleExitSimulation, handleClearHazards]);

  const handleSelectPreset = React.useCallback((preset: FloorplanData) => {
    handleExitSimulation();
    setFloorplan(preset);
    const firstRoom = preset.nodes.find((n) => n.type === 'room') || preset.nodes[0];
    if (firstRoom) setStartNodeId(firstRoom.id);
    handleClearHazards();
  }, [handleExitSimulation, handleClearHazards]);

  const handleLoadImportedFloorplan = React.useCallback((newFloorplan: FloorplanData) => {
    handleExitSimulation();
    setFloorplan(newFloorplan);
    const firstRoom = newFloorplan.nodes.find((n) => n.type === 'room') || newFloorplan.nodes[0];
    if (firstRoom) setStartNodeId(firstRoom.id);
    handleClearHazards();
  }, [handleExitSimulation, handleClearHazards]);

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
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-escape-scenario-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [floorplan, startNodeId, hazards, routeResult]);

  // One-click Contest Verification Scenarios (1 to 5)
  const handleApplyScenario = React.useCallback((scenarioIndex: number) => {
    handleExitSimulation();
    setFloorplan(CONTEST_BENCHMARK_PRESET);
    switch (scenarioIndex) {
      case 1:
        // Baseline: R1 -> C1 -> C2 -> E1 (cost 7)
        setStartNodeId('R1');
        setHazards({ blockedNodes: new Set(), blockedEdges: new Set(), closedExits: new Set() });
        break;
      case 2:
        // Block C2: R1 -> C1 -> C3 -> C4 -> E2 (cost 11)
        setStartNodeId('R1');
        setHazards({ blockedNodes: new Set(['C2']), blockedEdges: new Set(), closedExits: new Set() });
        break;
      case 3:
        // Close E1 and E2: No route available
        setStartNodeId('R1');
        setHazards({ blockedNodes: new Set(), blockedEdges: new Set(), closedExits: new Set(['E1', 'E2']) });
        break;
      case 4:
        // Start R2: R2 -> C3 -> C4 -> E2 (cost 7)
        setStartNodeId('R2');
        setHazards({ blockedNodes: new Set(), blockedEdges: new Set(), closedExits: new Set() });
        break;
      case 5:
        // Start R1, block R1: Starting location blocked
        setStartNodeId('R1');
        setHazards({ blockedNodes: new Set(['R1']), blockedEdges: new Set(), closedExits: new Set() });
        break;
    }
  }, [handleExitSimulation]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* 1. TOP HEADER (Visible in Command Center mode) */}
      {!isCinematicMode && (
        <Header
          language={language}
          onLanguageChange={setLanguage}
          onReset={handleResetAll}
          routeStatus={routeResult.status}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          onOpenReel={() => setIsProductReelOpen(true)}
        />
      )}

      {/* 2. MAIN OPERATIONS AREA */}
      <main className={`flex-1 w-full max-w-[1920px] mx-auto p-3 sm:p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch transition-all duration-500 ${
        isCinematicMode ? 'p-0 sm:p-0 lg:p-0 max-w-full' : ''
      }`}>
        {/* Left: Command Controls & Hazards Manager (Slides away in Cinematic Mode) */}
        {!isCinematicMode && (
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
        )}

        {/* Center: 3D Architectural Evacuation Environment */}
        <div className={`flex-1 relative rounded-2xl overflow-hidden border border-sky-500/20 shadow-2xl bg-[#060911] transition-all duration-500 ${
          isCinematicMode ? 'w-full h-screen rounded-none border-none' : 'h-[500px] lg:h-[620px]'
        }`}>
          {viewMode === '3d' ? (
            <BuildingScene
              floorplan={floorplan}
              startNodeId={startNodeId}
              onSelectStartNode={setStartNodeId}
              hazards={hazards}
              onToggleNodeHazard={handleToggleNodeHazard}
              onToggleEdgeHazard={handleToggleEdgeHazard}
              onToggleExitClosed={handleToggleExitClosed}
              routeResult={routeResult}
              simulationPhase={simulationPhase}
              cameraMode={cameraMode}
              agentPosition={agentPosition}
              agentRotationY={agentRotationY}
              isAgentWalking={isAgentWalking}
              language={language}
              activeSimulationPath={activeSimulationPath}
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
              simulationStepIndex={currentWaypointIdx}
              isSimulating={simulationPhase === 'RUNNING'}
              language={language}
            />
          )}

          {/* Cinematic Simulation Floating HUD & Modals */}
          {isCinematicMode && (
            <SimulationOverlay
              phase={simulationPhase}
              cameraMode={cameraMode}
              onChangeCameraMode={setCameraMode}
              onPauseResume={handlePauseResumeSimulation}
              onRestart={handleRestartSimulation}
              onExitSimulation={handleExitSimulation}
              isAudioOn={getSoundEnabled()}
              onToggleAudio={() => setSoundEnabled(!getSoundEnabled())}
              routeResult={routeResult}
              traversedCount={traversedCount}
              rerouteNotice={rerouteNotice}
              language={language}
              lastPositionId={lastPositionId}
              lastPositionName={nodeMap.get(lastPositionId)?.name?.[language] || lastPositionId}
              isTrappedRun={isTrappedRun}
            />
          )}
        </div>

        {/* Right: Route Intelligence & Launch Deck (2D High-Clarity Panel) */}
        {!isCinematicMode && (
          <RouteIntel
            routeResult={routeResult}
            simulationStepIndex={currentWaypointIdx}
            isSimulating={simulationPhase === 'RUNNING'}
            onToggleSimulate={handleStartSimulation}
            onStepSimulate={() => {
              setCurrentWaypointIdx(idx => Math.min(routeResult.path.length - 1, idx + 1));
            }}
            onResetSimulate={handleRestartSimulation}
            simulationSpeed={simulationSpeed}
            onChangeSpeed={setSimulationSpeed}
            language={language}
            simulationPhase={simulationPhase}
            activeHazardsCount={hazards.blockedNodes.size + hazards.blockedEdges.size + hazards.closedExits.size}
          />
        )}
      </main>

      {/* 3. BOTTOM LEGEND (Hidden in Cinematic Mode) */}
      {!isCinematicMode && <Legend language={language} />}

      {/* 4. IMPORT & VALIDATION MODAL */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onLoadFloorplan={handleLoadImportedFloorplan}
        language={language}
      />

      {/* 5. INITIAL CINEMATIC BOOTLOADER */}
      {isInitialLoading && (
        <InitialLoader
          onComplete={() => setIsInitialLoading(false)}
          language={language}
        />
      )}

      {/* 6. CINEMATIC PRODUCT REEL (90-SEC COMPETITION PRESENTATION) */}
      <CinematicProductReel
        isOpen={isProductReelOpen}
        onClose={() => setIsProductReelOpen(false)}
        onSetFloorplan={setFloorplan}
        onSetStartNode={setStartNodeId}
        onSetHazards={setHazards}
        onSetLanguage={setLanguage}
        onSetSimulationPhase={setSimulationPhase}
        onSetCameraMode={setCameraMode}
        onStartSimulation={handleStartSimulation}
        onExitSimulation={handleExitSimulation}
        currentLanguage={language}
      />
    </div>
  );
}

export default App;
