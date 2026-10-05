import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Flame, 
  DoorClosed, 
  LogOut, 
  Compass, 
  Maximize2, 
  Eye, 
  Sparkles
} from 'lucide-react';
import type { FloorplanData, GraphNode, HazardState, RouteResult } from '../types/graph';
import type { Language } from '../i18n/translations';
import { playClickSound, playHazardAlertSound } from '../lib/audio';

interface ThreeMapProps {
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

// -------------------------------------------------------------
// Coordinate Scaler (Maps 2D floorplan x, y -> 3D X, Z coordinates)
// -------------------------------------------------------------
function useFloorplanCoordinates(floorplan: FloorplanData) {
  return useMemo(() => {
    if (floorplan.nodes.length === 0) {
      return {
        to3D: () => [0, 0, 0] as [number, number, number],
        center: [0, 0, 0] as [number, number, number],
        scale: 0.05,
      };
    }
    const xs = floorplan.nodes.map(n => n.x);
    const ys = floorplan.nodes.map(n => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    const span = Math.max(maxX - minX, maxY - minY, 400);
    const scale = 24 / span; // Fit within ~24 units wide

    const to3D = (node: GraphNode): [number, number, number] => {
      const x3 = (node.x - midX) * scale;
      const z3 = (node.y - midY) * scale;
      return [x3, 0, z3];
    };

    return {
      to3D,
      center: [0, 0, 0] as [number, number, number],
      scale,
    };
  }, [floorplan]);
}

// -------------------------------------------------------------
// 3D Single Node Platform Component
// -------------------------------------------------------------
interface NodePlatformProps {
  node: GraphNode;
  position: [number, number, number];
  isStart: boolean;
  isBlocked: boolean;
  isClosedExit: boolean;
  isPartOfRoute: boolean;
  isDestination: boolean;
  language: Language;
  onSelect: () => void;
  onContextMenu: () => void;
}

const NodePlatform: React.FC<NodePlatformProps> = ({
  node,
  position,
  isStart,
  isBlocked,
  isClosedExit,
  isPartOfRoute,
  isDestination,
  language,
  onSelect,
  onContextMenu,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const beaconRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = React.useState(false);

  // Subtle pulsing animation for hazards and beacons
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (isBlocked && meshRef.current) {
      const s = 1 + Math.sin(t * 5) * 0.06;
      meshRef.current.scale.set(s, 1, s);
    }
    if (isStart && beaconRef.current) {
      beaconRef.current.rotation.y = t * 1.5;
    }
  });

  const isRoom = node.type === 'room';
  const isExit = node.type === 'exit';

  // Base platform dimensions
  const radius = isRoom ? 1.4 : isExit ? 1.5 : 1.1;
  const height = isRoom ? 0.45 : isExit ? 0.6 : 0.35;

  // Material Colors
  const mainColor = isBlocked
    ? '#e11d48'
    : isClosedExit
    ? '#d97706'
    : isDestination
    ? '#10b981'
    : isStart
    ? '#0284c7'
    : isPartOfRoute
    ? '#0891b2'
    : isExit
    ? '#059669'
    : isRoom
    ? '#1e293b'
    : '#0f172a';

  const emissiveColor = isBlocked
    ? '#f43f5e'
    : isClosedExit
    ? '#b45309'
    : isDestination
    ? '#34d399'
    : isStart
    ? '#38bdf8'
    : isPartOfRoute
    ? '#22d3ee'
    : isExit
    ? '#10b981'
    : '#0f172a';

  const emissiveIntensity = isBlocked ? 0.8 : isStart ? 0.9 : isDestination ? 0.9 : isPartOfRoute ? 0.6 : 0.15;

  return (
    <group position={position}>
      {/* 3D Platform Mesh */}
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onContextMenu={(e) => {
          e.stopPropagation();
          onContextMenu();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        {isRoom ? (
          <boxGeometry args={[radius * 2, height, radius * 2]} />
        ) : isExit ? (
          <cylinderGeometry args={[radius, radius * 1.1, height, 24]} />
        ) : (
          <cylinderGeometry args={[radius, radius, height, 16]} />
        )}
        <meshStandardMaterial
          color={mainColor}
          emissive={emissiveColor}
          emissiveIntensity={hovered ? emissiveIntensity + 0.4 : emissiveIntensity}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Exit Vertical Light Beam */}
      {isExit && !isClosedExit && (
        <mesh position={[0, 3, 0]}>
          <cylinderGeometry args={[0.3, 0.8, 6, 16]} />
          <meshBasicMaterial
            color="#34d399"
            transparent
            opacity={0.18}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Selected Start Luminous Radar Ring */}
      {isStart && !isBlocked && (
        <mesh ref={beaconRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius + 0.3, radius + 0.6, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.75} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Blocked Hazard Pulsing Ring */}
      {isBlocked && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius + 0.2, radius + 0.7, 32]} />
          <meshBasicMaterial color="#f43f5e" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* HTML Floating Tactical Label Tag */}
      <Html
        position={[0, height + 0.6, 0]}
        center
        distanceFactor={22}
        className="pointer-events-none select-none transition-all duration-200"
      >
        <div
          className={`flex items-center gap-1.5 px-2 py-0.8 rounded-md text-[11px] font-mono font-bold shadow-xl border backdrop-blur-md whitespace-nowrap ${
            isBlocked
              ? 'bg-rose-950/90 text-rose-300 border-rose-500 shadow-rose-900/50'
              : isClosedExit
              ? 'bg-amber-950/90 text-amber-300 border-amber-500'
              : isDestination
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400 shadow-emerald-900/50'
              : isStart
              ? 'bg-sky-950/90 text-sky-300 border-sky-400 shadow-sky-900/50'
              : isPartOfRoute
              ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400'
              : 'bg-slate-900/90 text-slate-300 border-slate-700/80'
          }`}
        >
          {isBlocked ? (
            <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
          ) : isClosedExit ? (
            <DoorClosed className="w-3 h-3 text-amber-400" />
          ) : isExit ? (
            <LogOut className="w-3 h-3 text-emerald-400" />
          ) : isStart ? (
            <Compass className="w-3 h-3 text-sky-400" />
          ) : null}
          <span>{node.id}</span>
          <span className="text-[9px] opacity-75 font-sans hidden sm:inline">
            {node.name[language] || node.name.en}
          </span>
        </div>
      </Html>
    </group>
  );
};

// -------------------------------------------------------------
// 3D Corridor Segment Component
// -------------------------------------------------------------
interface CorridorSegmentProps {
  startPos: [number, number, number];
  endPos: [number, number, number];
  cost: number;
  isBlocked: boolean;
  isPartOfRoute: boolean;
  onClick: () => void;
}

const CorridorSegment: React.FC<CorridorSegmentProps> = ({
  startPos,
  endPos,
  cost,
  isBlocked,
  isPartOfRoute,
  onClick,
}) => {
  const vStart = useMemo(() => new THREE.Vector3(...startPos), [startPos]);
  const vEnd = useMemo(() => new THREE.Vector3(...endPos), [endPos]);

  const length = useMemo(() => vStart.distanceTo(vEnd), [vStart, vEnd]);
  const midPoint = useMemo(() => vStart.clone().add(vEnd).multiplyScalar(0.5), [vStart, vEnd]);

  // Orientation quaternion to align cylinder between start and end
  const orientation = useMemo(() => {
    const dir = vEnd.clone().sub(vStart).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    return new THREE.Quaternion().setFromUnitVectors(up, dir);
  }, [vStart, vEnd]);

  const radius = isPartOfRoute ? 0.22 : 0.12;

  const color = isBlocked
    ? '#e11d48'
    : isPartOfRoute
    ? '#0284c7'
    : '#334155';

  const emissive = isBlocked
    ? '#f43f5e'
    : isPartOfRoute
    ? '#38bdf8'
    : '#0f172a';

  const emissiveIntensity = isBlocked ? 0.7 : isPartOfRoute ? 0.8 : 0.1;

  return (
    <group>
      {/* 3D Corridor Tube */}
      <mesh
        position={midPoint}
        quaternion={orientation}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[radius, radius, length, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.4}
          metalness={0.6}
          transparent={isBlocked}
          opacity={isBlocked ? 0.35 : 1.0}
        />
      </mesh>

      {/* Floating Transit Cost Badge */}
      <Html position={[midPoint.x, midPoint.y + 0.35, midPoint.z]} center distanceFactor={22}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-all border ${
            isBlocked
              ? 'bg-rose-950/80 text-rose-300 border-rose-600'
              : isPartOfRoute
              ? 'bg-sky-950/80 text-sky-200 border-sky-400 shadow-md'
              : 'bg-slate-950/80 text-slate-400 border-slate-700 hover:border-sky-400'
          }`}
          title={`Corridor cost: ${cost}`}
        >
          {cost}
        </div>
      </Html>
    </group>
  );
};

// -------------------------------------------------------------
// 3D Optimal Route Energy Pulse Line Component
// -------------------------------------------------------------
interface RouteLineProps {
  pathPoints: [number, number, number][];
}

const RouteEnergyPulse: React.FC<RouteLineProps> = ({ pathPoints }) => {
  const pulseRef = useRef<THREE.Mesh>(null);

  // Build 3D CatmullRom curve
  const curve = useMemo(() => {
    if (pathPoints.length < 2) return null;
    const vectors = pathPoints.map(p => new THREE.Vector3(p[0], 0.3, p[2]));
    return new THREE.CatmullRomCurve3(vectors);
  }, [pathPoints]);

  // Move pulsating energy packet along the route
  useFrame(({ clock }) => {
    if (!pulseRef.current || !curve) return;
    const t = (clock.getElapsedTime() * 0.4) % 1;
    const point = curve.getPointAt(t);
    pulseRef.current.position.copy(point);
  });

  if (!curve) return null;

  return (
    <group>
      {/* Luminous Tube */}
      <mesh position={[0, 0.05, 0]}>
        <tubeGeometry args={[curve, 64, 0.18, 12, false]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#22d3ee"
          emissiveIntensity={1.2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Moving Energy Photon Orb */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color="#a7f3d0" />
        <pointLight color="#34d399" intensity={2} distance={3} />
      </mesh>
    </group>
  );
};

// -------------------------------------------------------------
// 3D Evacuation Runner Avatar Component
// -------------------------------------------------------------
interface RunnerAvatarProps {
  position: [number, number, number];
}

const RunnerAvatar: React.FC<RunnerAvatarProps> = ({ position }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = 0.6 + Math.sin(t * 8) * 0.1;
    }
  });

  return (
    <group position={[position[0], 0, position[2]]}>
      <group ref={meshRef}>
        <mesh>
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshStandardMaterial
            color="#34d399"
            emissive="#10b981"
            emissiveIntensity={1.0}
            roughness={0.2}
          />
        </mesh>
        <pointLight color="#34d399" intensity={1.5} distance={2.5} />
      </group>
    </group>
  );
};

// -------------------------------------------------------------
// MAIN THREE.JS 3D OPERATIONS VISUALIZER
// -------------------------------------------------------------
export const ThreeMapVisualizer: React.FC<ThreeMapProps> = ({
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
  const controlsRef = useRef<any>(null);

  const { to3D } = useFloorplanCoordinates(floorplan);

  const nodePositions = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    floorplan.nodes.forEach(n => map.set(n.id, to3D(n)));
    return map;
  }, [floorplan.nodes, to3D]);

  // Route path 3D waypoints
  const route3DPoints = useMemo(() => {
    if (routeResult.status !== 'OPTIMAL_ROUTE_FOUND') return [];
    return routeResult.path
      .map(id => nodePositions.get(id))
      .filter((p): p is [number, number, number] => p !== undefined);
  }, [routeResult.status, routeResult.path, nodePositions]);

  // Runner active 3D position during simulation
  const runnerNodeId = routeResult.path[simulationStepIndex] || startNodeId;
  const runnerPos = nodePositions.get(runnerNodeId) || [0, 0, 0];

  // Camera reset handler
  const handleResetCamera = () => {
    playClickSound();
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 border border-sky-500/20 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* 3D Viewport Navigation Bar */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 text-xs z-10">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200 tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'bn' ? 'ত্রিমাত্রিক জরুরি কমান্ড ডেক' : '3D Tactical Operations Deck'}</span>
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            ({floorplan.title[language] || floorplan.title.en})
          </span>
        </div>

        {/* Viewport Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetCamera}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-sky-300 border border-slate-800 text-xs transition-colors"
            title="Reset 3D Camera"
          >
            <Maximize2 className="w-3 h-3 text-cyan-400" />
            <span className="hidden md:inline">{language === 'bn' ? 'ক্যামেরা রিসেট' : 'Reset Camera'}</span>
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Area */}
      <div className="flex-1 w-full h-[480px] lg:h-[580px] relative bg-[#060911]">
        <Canvas
          shadows
          camera={{ position: [18, 22, 18], fov: 42 }}
          className="w-full h-full"
        >
          {/* Subtle Cyber Fog for atmospheric depth */}
          <fog attach="fog" args={['#060911', 25, 75]} />

          {/* Lighting Rig */}
          <ambientLight intensity={0.4} color="#0f172a" />
          <directionalLight
            position={[15, 25, 10]}
            intensity={1.2}
            color="#e0f2fe"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-15, 15, -10]} intensity={0.4} color="#0284c7" />

          {/* Tactical Ground Cyber Grid */}
          <gridHelper args={[40, 40, '#0284c7', '#1e293b']} position={[0, -0.05, 0]} />

          {/* 1. CORRIDOR SEGMENTS (EDGES) */}
          {floorplan.edges.map((edge) => {
            const p1 = nodePositions.get(edge.source);
            const p2 = nodePositions.get(edge.target);
            if (!p1 || !p2) return null;

            const isEdgeBlocked = hazards.blockedEdges.has(edge.id);
            const isSrcBlocked = hazards.blockedNodes.has(edge.source);
            const isTgtBlocked = hazards.blockedNodes.has(edge.target);
            const isEffectivelyBlocked = isEdgeBlocked || isSrcBlocked || isTgtBlocked;

            const isPartOfRoute =
              routeResult.status === 'OPTIMAL_ROUTE_FOUND' &&
              routeResult.path.some((nodeId, idx) => {
                if (idx === routeResult.path.length - 1) return false;
                const nextId = routeResult.path[idx + 1];
                return (
                  (nodeId === edge.source && nextId === edge.target) ||
                  (nodeId === edge.target && nextId === edge.source)
                );
              });

            return (
              <CorridorSegment
                key={edge.id}
                startPos={p1}
                endPos={p2}
                cost={edge.cost}
                isBlocked={isEffectivelyBlocked}
                isPartOfRoute={isPartOfRoute}
                onClick={() => {
                  playHazardAlertSound();
                  onToggleEdgeHazard(edge.id);
                }}
              />
            );
          })}

          {/* 2. OPTIMAL ROUTE ENERGY PULSE */}
          {routeResult.status === 'OPTIMAL_ROUTE_FOUND' && route3DPoints.length >= 2 && (
            <RouteEnergyPulse pathPoints={route3DPoints} />
          )}

          {/* 3. SIMULATION RUNNER AVATAR */}
          {routeResult.status === 'OPTIMAL_ROUTE_FOUND' && (
            <RunnerAvatar position={runnerPos} />
          )}

          {/* 4. NODE PLATFORMS (ROOMS, JUNCTIONS, EXITS) */}
          {floorplan.nodes.map((node) => {
            const pos = nodePositions.get(node.id) || [0, 0, 0];
            const isStart = node.id === startNodeId;
            const isBlocked = hazards.blockedNodes.has(node.id);
            const isClosedExit = node.type === 'exit' && hazards.closedExits.has(node.id);
            const isPartOfRoute =
              routeResult.status === 'OPTIMAL_ROUTE_FOUND' &&
              routeResult.path.includes(node.id);
            const isDestination =
              routeResult.status === 'OPTIMAL_ROUTE_FOUND' &&
              routeResult.destinationExitId === node.id;

            return (
              <NodePlatform
                key={node.id}
                node={node}
                position={pos}
                isStart={isStart}
                isBlocked={isBlocked}
                isClosedExit={isClosedExit}
                isPartOfRoute={isPartOfRoute}
                isDestination={isDestination}
                language={language}
                onSelect={() => {
                  playClickSound();
                  if (node.type === 'exit') {
                    onToggleExitClosed(node.id);
                  } else {
                    onSelectStartNode(node.id);
                  }
                }}
                onContextMenu={() => {
                  playHazardAlertSound();
                  onToggleNodeHazard(node.id);
                }}
              />
            );
          })}

          {/* Orbit Controls with architectural constraints */}
          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.06}
            minDistance={8}
            maxDistance={45}
            maxPolarAngle={Math.PI / 2.15} // Prevent going beneath floor
          />
        </Canvas>

        {/* 3D Viewport Floating Overlay Controls */}
        <div className="absolute bottom-3 left-4 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-300 backdrop-blur-md flex items-center gap-2 pointer-events-none shadow-lg">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'bn' ? 'ঘোরাতে ড্র্যাগ করুন • জুম করতে স্ক্রোল করুন' : 'Drag to Orbit • Scroll to Zoom'}</span>
        </div>
      </div>
    </div>
  );
};
