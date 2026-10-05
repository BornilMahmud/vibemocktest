import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomSpace, JunctionHub, ExitPortal, WalkableCorridor } from './ArchitecturalBuilding';
import { EvacueeCharacter } from './EvacueeCharacter';
import { CinematicController } from './CinematicController';
import type { FloorplanData, HazardState, RouteResult } from '../../types/graph';
import type { CameraViewMode, SimulationPhase } from '../../types/simulation';
import type { Language } from '../../i18n/translations';
import { useCoordinateMapping } from '../../lib/coordinates';

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
  activeSimulationPath?: string[];
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

// -------------------------------------------------------------
// Emergency Strobe Light (Flashes rapidly only at failure/trapped)
// -------------------------------------------------------------
const EmergencyStrobeLight: React.FC<{ active: boolean }> = ({ active }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const lightRef2 = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!active) {
      if (lightRef.current) lightRef.current.intensity = 0;
      if (lightRef2.current) lightRef2.current.intensity = 0;
      return;
    }
    // High-visibility emergency pulse at ~5Hz (120-200ms intervals)
    const t = clock.getElapsedTime() * 18;
    const pulse = Math.sin(t) > 0.15 ? 1 : 0;
    if (lightRef.current) {
      lightRef.current.intensity = pulse * 3.8;
    }
    if (lightRef2.current) {
      lightRef2.current.intensity = pulse * 2.2;
    }
  });

  if (!active) return null;

  return (
    <group>
      <pointLight ref={lightRef} position={[0, 9, 0]} color="#ef4444" distance={38} />
      <pointLight ref={lightRef2} position={[0, 3.5, 0]} color="#dc2626" distance={22} />
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
  activeSimulationPath,
}) => {
  const { to3D } = useCoordinateMapping(floorplan);

  const nodePositions = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    floorplan.nodes.forEach(n => map.set(n.id, to3D(n)));
    return map;
  }, [floorplan.nodes, to3D]);

  const pathToRender = useMemo(() => {
    return activeSimulationPath || (routeResult.status === 'OPTIMAL_ROUTE_FOUND' ? routeResult.path : []);
  }, [activeSimulationPath, routeResult.status, routeResult.path]);

  // Optimal route 3D waypoint coordinates
  const routePoints = useMemo(() => {
    return pathToRender
      .map(id => nodePositions.get(id))
      .filter((p): p is [number, number, number] => p !== undefined);
  }, [pathToRender, nodePositions]);

  // Destination Exit coordinates for camera focus
  const exitPosition = useMemo(() => {
    if (routeResult.destinationExitId) {
      return nodePositions.get(routeResult.destinationExitId) || null;
    }
    return null;
  }, [routeResult.destinationExitId, nodePositions]);

  const isFailureMode = simulationPhase === 'TRAPPED' || simulationPhase === 'FAILED';
  const isSuccessMode = simulationPhase === 'SUCCESS';
  const isModalActive = simulationPhase === 'SUCCESS' || simulationPhase === 'FAILED';
  const showLabels = !isModalActive;

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        camera={{ position: [20, 24, 20], fov: 40 }}
        className="w-full h-full"
      >
        {/* Background Cyber Fog (Clean and atmospheric) */}
        <fog
          attach="fog"
          args={[
            isFailureMode ? '#120507' : isSuccessMode ? '#04130d' : '#080d1a',
            28,
            85,
          ]}
        />

        {/* Dynamic Architectural Lighting (Normal start is clean, calm & bright) */}
        <ambientLight
          intensity={isFailureMode ? 0.2 : isSuccessMode ? 0.5 : 0.45}
          color={isFailureMode ? '#450a0a' : isSuccessMode ? '#064e3b' : '#0f172a'}
        />
        <directionalLight
          position={[18, 28, 12]}
          intensity={isFailureMode ? 0.7 : 1.3}
          color={isFailureMode ? '#fecdd3' : isSuccessMode ? '#a7f3d0' : '#e0f2fe'}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight
          position={[-15, 14, -12]}
          intensity={0.35}
          color={isFailureMode ? '#f43f5e' : '#0284c7'}
        />

        {/* Rapid Red Emergency Warning Strobe Lights (Only at failure condition) */}
        <EmergencyStrobeLight active={isFailureMode} />

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
              showLabels={showLabels}
            />
          );
        })}

        {/* 2. LUMINOUS ROUTE TUBE (Extinguishes immediately on Trapped / Failure) */}
        {!isFailureMode && routePoints.length >= 2 && (
          <LuminousRoute points={routePoints} />
        )}

        {/* 3. PROCEDURAL HUMAN EVACUATION CHARACTER */}
        {(routeResult.status === 'OPTIMAL_ROUTE_FOUND' || simulationPhase !== 'IDLE') && (
          <EvacueeCharacter
            position={agentPosition}
            rotationY={agentRotationY}
            isWalking={isAgentWalking}
            isEmergency={isFailureMode}
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
                showLabels={showLabels}
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
                showLabels={showLabels}
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
                showLabels={showLabels}
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
