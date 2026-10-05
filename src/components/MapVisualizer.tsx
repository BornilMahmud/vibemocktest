import React from 'react';
import { 
  Flame, 
  DoorClosed, 
  LogOut, 
  Compass, 
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import type { FloorplanData, GraphNode, HazardState, RouteResult } from '../types/graph';
import { translations, type Language } from '../i18n/translations';
import { playClickSound, playHazardAlertSound } from '../lib/audio';

interface MapVisualizerProps {
  floorplan: FloorplanData;
  startNodeId: string;
  onSelectStartNode: (id: string) => void;
  hazards: HazardState;
  onToggleNodeHazard: (nodeId: string) => void;
  onToggleEdgeHazard: (edgeId: string) => void;
  onToggleExitClosed: (exitId: string) => void;
  routeResult: RouteResult;
  simulationStepIndex: number;
  isSimulating: boolean;
  language: Language;
}

export const MapVisualizer: React.FC<MapVisualizerProps> = ({
  floorplan,
  startNodeId,
  onSelectStartNode,
  hazards,
  onToggleNodeHazard,
  onToggleEdgeHazard,
  onToggleExitClosed,
  routeResult,
  simulationStepIndex,
  language,
}) => {
  const t = translations[language];
  const [zoom, setZoom] = React.useState(1);

  // Calculate dynamic bounding box of all nodes with generous padding
  const { minX, minY, width, height } = React.useMemo(() => {
    if (floorplan.nodes.length === 0) {
      return { minX: 0, minY: 0, width: 800, height: 500 };
    }
    const xs = floorplan.nodes.map(n => n.x);
    const ys = floorplan.nodes.map(n => n.y);
    const min_x = Math.min(...xs) - 80;
    const max_x = Math.max(...xs) + 100;
    const min_y = Math.min(...ys) - 70;
    const max_y = Math.max(...ys) + 70;
    return {
      minX: min_x,
      minY: min_y,
      width: Math.max(700, max_x - min_x),
      height: Math.max(450, max_y - min_y),
    };
  }, [floorplan.nodes]);

  const nodeMap = React.useMemo(() => {
    const map = new Map<string, GraphNode>();
    floorplan.nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [floorplan.nodes]);

  // Set of edges that belong to the active optimal route
  const activeRouteEdges = React.useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < routeResult.path.length - 1; i++) {
      const u = routeResult.path[i];
      const v = routeResult.path[i + 1];
      set.add(`${u}-${v}`);
      set.add(`${v}-${u}`);
    }
    return set;
  }, [routeResult.path]);

  // Active runner position during step-by-step simulation
  const runnerNodeId = routeResult.path[simulationStepIndex] || startNodeId;
  const runnerNode = nodeMap.get(runnerNodeId);

  return (
    <div className="flex-1 flex flex-col bg-slate-950/80 border border-sky-500/20 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Visualizer Top Bar Controls */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200 tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            {floorplan.title[language] || floorplan.title.en}
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            ({floorplan.nodes.length} {language === 'bn' ? 'নোড' : 'nodes'}, {floorplan.edges.length} {language === 'bn' ? 'করিডোর' : 'corridors'})
          </span>
        </div>

        {/* Quick Instructions badge & Zoom */}
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-block text-[11px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
            {t.clickRoomToStart}
          </span>
          <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5">
            <button
              onClick={() => setZoom(z => Math.max(0.7, z - 0.1))}
              className="p-1 hover:text-sky-400 text-slate-400 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[10px] font-mono text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
              className="p-1 hover:text-sky-400 text-slate-400 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 hover:text-sky-400 text-slate-400 transition-colors ml-0.5 border-l border-slate-800"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area with Tactical Grid Background */}
      <div className="flex-1 w-full h-[480px] lg:h-[580px] overflow-auto flex items-center justify-center p-2 tactical-grid-bg relative select-none">
        <svg
          viewBox={`${minX} ${minY} ${width} ${height}`}
          className="w-full h-full max-h-[580px] transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          <defs>
            {/* Glow Filter for Active Evacuation Path */}
            <filter id="routeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Fire Hazard Glow */}
            <filter id="hazardGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feColorMatrix type="matrix" values="1 0 0 0 0.9  0 0.2 0 0 0.2  0 0 0 0 0.3  0 0 0 1 0" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. EDGES / CORRIDORS LAYER */}
          <g id="corridor-edges">
            {floorplan.edges.map((edge) => {
              const src = nodeMap.get(edge.source);
              const tgt = nodeMap.get(edge.target);
              if (!src || !tgt) return null;

              const isEdgeBlocked = hazards.blockedEdges.has(edge.id);
              const isSrcBlocked = hazards.blockedNodes.has(edge.source);
              const isTgtBlocked = hazards.blockedNodes.has(edge.target);
              const isEffectivelyBlocked = isEdgeBlocked || isSrcBlocked || isTgtBlocked;

              const isPartOfRoute =
                activeRouteEdges.has(`${edge.source}-${edge.target}`) &&
                routeResult.status === 'OPTIMAL_ROUTE_FOUND';

              const midX = (src.x + tgt.x) / 2;
              const midY = (src.y + tgt.y) / 2;

              return (
                <g key={edge.id} className="cursor-pointer group" onClick={() => onToggleEdgeHazard(edge.id)}>
                  {/* Base Corridor Path */}
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={
                      isEffectivelyBlocked
                        ? '#e11d48'
                        : isPartOfRoute
                        ? '#0284c7'
                        : '#334155'
                    }
                    strokeWidth={isPartOfRoute ? 6 : 4}
                    strokeDasharray={isEffectivelyBlocked ? '6 4' : undefined}
                    opacity={isEffectivelyBlocked ? 0.6 : 0.8}
                    className="transition-all duration-300"
                  />

                  {/* Pulsing Highlight for Active Optimal Route */}
                  {isPartOfRoute && (
                    <line
                      x1={src.x}
                      y1={src.y}
                      x2={tgt.x}
                      y2={tgt.y}
                      stroke="#38bdf8"
                      strokeWidth={4}
                      className="route-pulse-line"
                      filter="url(#routeGlow)"
                    />
                  )}

                  {/* Invisible broad hitbox for easy clicking */}
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke="transparent"
                    strokeWidth={20}
                  />

                  {/* Corridor Cost Badge Pill */}
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x={-18}
                      y={-11}
                      width={36}
                      height={22}
                      rx={6}
                      fill={
                        isEffectivelyBlocked
                          ? '#4c0519'
                          : isPartOfRoute
                          ? '#0369a1'
                          : '#0f172a'
                      }
                      stroke={
                        isEffectivelyBlocked
                          ? '#f43f5e'
                          : isPartOfRoute
                          ? '#38bdf8'
                          : '#334155'
                      }
                      strokeWidth={1.5}
                      className="transition-colors group-hover:stroke-sky-400"
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fill={isEffectivelyBlocked ? '#fda4af' : isPartOfRoute ? '#f0f9ff' : '#94a3b8'}
                      fontSize={11}
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {edge.cost}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* 2. NODES LAYER (Rooms, Junctions, Exits) */}
          <g id="building-nodes">
            {floorplan.nodes.map((node) => {
              const isStart = node.id === startNodeId;
              const isBlocked = hazards.blockedNodes.has(node.id);
              const isClosedExit = node.type === 'exit' && hazards.closedExits.has(node.id);
              const isPartOfPath = routeResult.path.includes(node.id) && routeResult.status === 'OPTIMAL_ROUTE_FOUND';
              const isDestination = routeResult.destinationExitId === node.id && routeResult.status === 'OPTIMAL_ROUTE_FOUND';

              // Node radius by type
              const r = node.type === 'exit' ? 24 : node.type === 'room' ? 22 : 18;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                  onClick={() => {
                    playClickSound();
                    if (node.type === 'exit') {
                      onToggleExitClosed(node.id);
                    } else {
                      onSelectStartNode(node.id);
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    playHazardAlertSound();
                    onToggleNodeHazard(node.id);
                  }}
                >
                  {/* Radar ping animation for designated starting location */}
                  {isStart && !isBlocked && (
                    <circle
                      r={24}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      className="radar-ping-ring"
                    />
                  )}

                  {/* Hazard pulse animation for fire/blocked node */}
                  {isBlocked && (
                    <circle
                      r={r + 8}
                      fill="rgba(244, 63, 94, 0.25)"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      className="hazard-pulse-ring"
                    />
                  )}

                  {/* Destination exit victory glow */}
                  {isDestination && (
                    <circle
                      r={r + 10}
                      fill="rgba(16, 185, 129, 0.2)"
                      stroke="#10b981"
                      strokeWidth={2}
                      className="radar-ping-ring"
                    />
                  )}

                  {/* Base Circle */}
                  <circle
                    r={r}
                    fill={
                      isBlocked
                        ? '#881337'
                        : isClosedExit
                        ? '#78350f'
                        : isStart
                        ? '#0284c7'
                        : isDestination
                        ? '#047857'
                        : isPartOfPath
                        ? '#0e7490'
                        : node.type === 'exit'
                        ? '#064e3b'
                        : node.type === 'room'
                        ? '#1e293b'
                        : '#0f172a'
                    }
                    stroke={
                      isBlocked
                        ? '#f43f5e'
                        : isClosedExit
                        ? '#f59e0b'
                        : isStart
                        ? '#38bdf8'
                        : isDestination
                        ? '#34d399'
                        : isPartOfPath
                        ? '#22d3ee'
                        : node.type === 'exit'
                        ? '#10b981'
                        : '#475569'
                    }
                    strokeWidth={isStart || isDestination || isPartOfPath || isBlocked ? 3.5 : 2}
                    filter={isBlocked ? 'url(#hazardGlow)' : isPartOfPath ? 'url(#routeGlow)' : undefined}
                    className="transition-all duration-300 group-hover:scale-105"
                  />

                  {/* Icon/Symbol inside Node */}
                  {isBlocked ? (
                    <g transform="translate(-8, -8)">
                      <Flame className="w-4 h-4 text-white" />
                    </g>
                  ) : isClosedExit ? (
                    <g transform="translate(-8, -8)">
                      <DoorClosed className="w-4 h-4 text-amber-300" />
                    </g>
                  ) : node.type === 'exit' ? (
                    <g transform="translate(-9, -9)">
                      <LogOut className="w-4.5 h-4.5 text-emerald-300" />
                    </g>
                  ) : isStart ? (
                    <g transform="translate(-8, -8)">
                      <Compass className="w-4 h-4 text-white" />
                    </g>
                  ) : (
                    <text
                      textAnchor="middle"
                      y={4}
                      fill={isPartOfPath ? '#ecfeff' : '#94a3b8'}
                      fontSize={11}
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {node.id}
                    </text>
                  )}

                  {/* Compact Backed Node Label to Prevent Overlapping */}
                  <rect
                    x={-18}
                    y={r + 4}
                    width={36}
                    height={15}
                    rx={4}
                    fill="#020617"
                    fillOpacity={0.88}
                    stroke={isBlocked ? '#f43f5e' : isStart ? '#38bdf8' : isDestination ? '#34d399' : '#334155'}
                    strokeWidth={0.75}
                    className="pointer-events-none"
                  />
                  <text
                    x={0}
                    y={r + 15}
                    textAnchor="middle"
                    fill={isBlocked ? '#f43f5e' : isStart ? '#38bdf8' : isDestination ? '#34d399' : '#cbd5e1'}
                    fontSize={10}
                    fontWeight="bold"
                    fontFamily="monospace"
                    className="pointer-events-none"
                  >
                    {node.id}
                  </text>
                </g>
              );
            })}
          </g>

          {/* 3. SIMULATION RUNNER AVATAR */}
          {runnerNode && routeResult.status === 'OPTIMAL_ROUTE_FOUND' && (
            <g
              transform={`translate(${runnerNode.x}, ${runnerNode.y})`}
              className="transition-all duration-500 ease-in-out pointer-events-none"
            >
              <circle
                r={26}
                fill="none"
                stroke="#10b981"
                strokeWidth={3}
                strokeDasharray="4 2"
                className="animate-spin"
              />
              <circle
                r={9}
                fill="#34d399"
                stroke="#ffffff"
                strokeWidth={2}
                className="shadow-lg shadow-emerald-400"
              />
            </g>
          )}
        </svg>

        {/* Floating Quick Action Hint */}
        <div className="absolute bottom-3 left-4 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 backdrop-blur-md flex items-center gap-2 pointer-events-none shadow-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>{t.shiftClickToHazard}</span>
        </div>
      </div>
    </div>
  );
};
