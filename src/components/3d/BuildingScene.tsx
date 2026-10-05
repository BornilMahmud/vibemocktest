import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomSpace, JunctionHub, ExitPortal, WalkableCorridor } from './ArchitecturalBuilding';
import { EvacueeCharacter } from './EvacueeCharacter';
import { CinematicController } from './CinematicController';
import type { FloorplanData, GraphNode, HazardState, RouteResult } from '../../types/graph';
import type { CameraViewMode, SimulationPhase } from '../../types/simulation';
import type { Language } from '../../i18n/translations';

interface BuildingSceneProps {
  floorplan: FloorplanData;
  startNodeId: string;
  onSelectStartNode: (id: string) => void;
  hazards: HazardState;
  onToggleNodeHazard: (nodeId: string) => void;
  onToggleEdgeHazard: (edgeId: string) => void;
  onToggleExitClosed: (exitId: string) => void;
  routeResult: RouteResult;
  simulationPhase: SimulationPhase;
  cameraMode: CameraViewMode;
  agentPosition: [number, number, number];
  agentRotationY: number;
  isAgentWalking: boolean;
  language: Language;
}

// Map 2D floorplan node coordinates to 3D world space
export function useCoordinateMapping(floorplan: FloorplanData) {
  return useMemo(() => {
    if (floorplan.nodes.length === 0) {
      return {
        to3D: () => [0, 0, 0] as [number, number, number],
        center: [0, 0, 0] as [number, number, number],
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
    const scale = 26 / span; // Fit comfortably in camera frustum

    const to3D = (node: GraphNode): [number, number, number] => {
      const x3 = (node.x - midX) * scale;
      const z3 = (node.y - midY) * scale;
      return [x3, 0, z3];
    };

    return {
      to3D,
      center: [0, 0, 0] as [number, number, number],
    };
  }, [floorplan]);
}

// -------------------------------------------------------------
// Luminous 3D Optimal Route Curve & Energy Photon Pulse
// -------------------------------------------------------------
const LuminousRoute: React.FC<{ points: [number, number, number][] }> = ({ points }) => {
  const photonRef = useRef<THREE.Mesh>(null);

  const curve = useMemo(() => {
    if (points.length < 2) return null;
    const vectors = points.map(p => new THREE.Vector3(p[0], 0.35, p[2]));
    return new THREE.CatmullRomCurve3(vectors);
  }, [points]);

  useFrame(({ clock }) => {
    if (!photonRef.current || !curve) return;
    const t = (clock.getElapsedTime() * 0.45) % 1;
    const pt = curve.getPointAt(t);
    photonRef.current.position.copy(pt);
  });

  if (!curve) return null;

  return (
    <group>
      {/* 3D Elevated Glowing Tube */}
      <mesh>
        <tubeGeometry args={[curve, 64, 0.22, 12, false]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={1.3}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* Moving Energy Photon Orb */}
      <mesh ref={photonRef}>
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshBasicMaterial color="#a7f3d0" />
        <pointLight color="#34d399" intensity={2.5} distance={4} />
      </mesh>
    </group>
  );
};

export const BuildingScene: React.FC<BuildingSceneProps> = ({
  floorplan,
  startNodeId,
  onSelectStartNode,
  hazards,
  onToggleNodeHazard,
  onToggleEdgeHazard,
  onToggleExitClosed,
  routeResult,
  simulationPhase,
  cameraMode,
  agentPosition,
  agentRotationY,
  isAgentWalking,
  language,
}) => {
  const { to3D } = useCoordinateMapping(floorplan);

  const nodePositions = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    floorplan.nodes.forEach(n => map.set(n.id, to3D(n)));
    return map;
  }, [floorplan.nodes, to3D]);

  // Optimal route 3D waypoint coordinates
  const routePoints = useMemo(() => {
    if (routeResult.status !== 'OPTIMAL_ROUTE_FOUND') return [];
    return routeResult.path
      .map(id => nodePositions.get(id))
      .filter((p): p is [number, number, number] => p !== undefined);
  }, [routeResult.status, routeResult.path, nodePositions]);

  // Destination Exit coordinates for camera focus
  const exitPosition = useMemo(() => {
    if (routeResult.destinationExitId) {
      return nodePositions.get(routeResult.destinationExitId) || null;
    }
    return null;
  }, [routeResult.destinationExitId, nodePositions]);

  const isEmergency = simulationPhase !== 'IDLE';

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        camera={{ position: [20, 24, 20], fov: 40 }}
        className="w-full h-full"
      >
        {/* Background Cyber Fog */}
        <fog attach="fog" args={[isEmergency ? '#0a0508' : '#080d1a', 28, 85]} />

        {/* Dynamic Architectural Lighting */}
        <ambientLight intensity={isEmergency ? 0.25 : 0.4} color={isEmergency ? '#450a0a' : '#0f172a'} />
        <directionalLight
          position={[18, 28, 12]}
          intensity={isEmergency ? 0.8 : 1.3}
          color={isEmergency ? '#fecdd3' : '#e0f2fe'}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight
          position={[-15, 14, -12]}
          intensity={0.35}
          color={isEmergency ? '#f43f5e' : '#0284c7'}
        />

        {/* Emergency Ambient Ceiling Accents when Simulation is Active */}
        {isEmergency && (
          <pointLight position={[0, 10, 0]} color="#f43f5e" intensity={1.2} distance={30} />
        )}

        {/* Ground Floor Slab & Cyber Architectural Grid */}
        <mesh position={[0, -0.15, 0]} receiveShadow>
          <cylinderGeometry args={[28, 29, 0.3, 32]} />
          <meshStandardMaterial color="#0b1120" roughness={0.7} metalness={0.3} />
        </mesh>
        <gridHelper args={[48, 48, '#0369a1', '#1e293b']} position={[0, 0.01, 0]} />

        {/* 1. WALKABLE CORRIDOR SEGMENTS */}
        {floorplan.edges.map((edge) => {
          const p1 = nodePositions.get(edge.source);
          const p2 = nodePositions.get(edge.target);
          if (!p1 || !p2) return null;

          const isEdgeBlocked = hazards.blockedEdges.has(edge.id);
          const isSrcBlocked = hazards.blockedNodes.has(edge.source);
          const isTgtBlocked = hazards.blockedNodes.has(edge.target);
          const isBlocked = isEdgeBlocked || isSrcBlocked || isTgtBlocked;

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
            <WalkableCorridor
              key={edge.id}
              edge={edge}
              startPos={p1}
              endPos={p2}
              isBlocked={isBlocked}
              isPartOfRoute={isPartOfRoute}
              onToggle={() => onToggleEdgeHazard(edge.id)}
            />
          );
        })}

        {/* 2. LUMINOUS OPTIMAL ROUTE TUBE */}
        {routeResult.status === 'OPTIMAL_ROUTE_FOUND' && routePoints.length >= 2 && (
          <LuminousRoute points={routePoints} />
        )}

        {/* 3. PROCEDURAL HUMAN EVACUATION CHARACTER */}
        {routeResult.status === 'OPTIMAL_ROUTE_FOUND' && (
          <EvacueeCharacter
            position={agentPosition}
            rotationY={agentRotationY}
            isWalking={isAgentWalking}
            isEmergency={isEmergency}
          />
        )}

        {/* 4. ARCHITECTURAL NODES (ROOMS, JUNCTIONS, EXITS) */}
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

          if (node.type === 'room') {
            return (
              <RoomSpace
                key={node.id}
                node={node}
                position={pos}
                isStart={isStart}
                isBlocked={isBlocked}
                isPartOfRoute={isPartOfRoute}
                language={language}
                onSelect={() => onSelectStartNode(node.id)}
                onContextMenu={() => onToggleNodeHazard(node.id)}
              />
            );
          } else if (node.type === 'exit') {
            return (
              <ExitPortal
                key={node.id}
                node={node}
                position={pos}
                isClosed={isClosedExit}
                isDestination={isDestination}
                language={language}
                onToggle={() => onToggleExitClosed(node.id)}
              />
            );
          } else {
            return (
              <JunctionHub
                key={node.id}
                node={node}
                position={pos}
                isStart={isStart}
                isBlocked={isBlocked}
                isPartOfRoute={isPartOfRoute}
                language={language}
                onSelect={() => onSelectStartNode(node.id)}
                onContextMenu={() => onToggleNodeHazard(node.id)}
              />
            );
          }
        })}

        {/* Cinematic Camera Controller */}
        <CinematicController
          cameraMode={cameraMode}
          simulationPhase={simulationPhase}
          agentPosition={agentPosition}
          exitPosition={exitPosition}
          overviewPosition={[18, 22, 18]}
        />
      </Canvas>
    </div>
  );
};
