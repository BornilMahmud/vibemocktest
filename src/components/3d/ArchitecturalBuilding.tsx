import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Flame, DoorClosed, LogOut, Compass } from 'lucide-react';
import type { GraphNode, GraphEdge } from '../../types/graph';
import type { Language } from '../../i18n/translations';

// -------------------------------------------------------------
// Architectural Room Space (Floor slab + low walls + doorway)
// -------------------------------------------------------------
interface RoomSpaceProps {
  node: GraphNode;
  position: [number, number, number];
  isStart: boolean;
  isBlocked: boolean;
  isPartOfRoute: boolean;
  language: Language;
  onSelect: () => void;
  onContextMenu: () => void;
}

export const RoomSpace: React.FC<RoomSpaceProps> = ({
  node,
  position,
  isStart,
  isBlocked,
  isPartOfRoute,
  language,
  onSelect,
  onContextMenu,
}) => {
  const [hovered, setHovered] = React.useState(false);
  const size = 3.2;
  const wallH = 0.7;
  const wallT = 0.15;

  return (
    <group position={position}>
      {/* Floor Slab */}
      <mesh
        position={[0, 0.1, 0]}
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
        receiveShadow
      >
        <boxGeometry args={[size, 0.2, size]} />
        <meshStandardMaterial
          color={
            isBlocked
              ? '#881337'
              : isStart
              ? '#0284c7'
              : isPartOfRoute
              ? '#0e7490'
              : hovered
              ? '#334155'
              : '#1e293b'
          }
          emissive={
            isBlocked
              ? '#f43f5e'
              : isStart
              ? '#38bdf8'
              : isPartOfRoute
              ? '#22d3ee'
              : '#0f172a'
          }
          emissiveIntensity={isBlocked ? 0.7 : isStart ? 0.8 : isPartOfRoute ? 0.4 : 0.05}
          roughness={0.4}
          metalness={0.5}
        />
      </mesh>

      {/* Architectural Low Perimeter Walls with Doorway Gap */}
      {/* Back Wall */}
      <mesh position={[0, wallH / 2 + 0.2, -size / 2 + wallT / 2]} castShadow receiveShadow>
        <boxGeometry args={[size, wallH, wallT]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-size / 2 + wallT / 2, wallH / 2 + 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallT, wallH, size]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
      {/* Right Wall */}
      <mesh position={[size / 2 - wallT / 2, wallH / 2 + 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallT, wallH, size]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>

      {/* Interior Minimal Desk / Console Block */}
      <mesh position={[0, 0.35, -0.6]} castShadow>
        <boxGeometry args={[1.2, 0.3, 0.6]} />
        <meshStandardMaterial color="#475569" roughness={0.5} />
      </mesh>

      {/* Ceiling Downlight */}
      <pointLight
        position={[0, 2.2, 0]}
        color={isBlocked ? '#f43f5e' : isStart ? '#38bdf8' : '#e0f2fe'}
        intensity={isBlocked ? 1.4 : isStart ? 1.2 : 0.5}
        distance={4.5}
      />

      {/* Selected Origin Beacon */}
      {isStart && !isBlocked && (
        <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.6, 1.85, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Hazard Warning Beacon */}
      {isBlocked && (
        <group position={[0, 0.4, 0]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.2, 0.25, 0.8, 8]} />
            <meshStandardMaterial color="#e11d48" emissive="#f43f5e" emissiveIntensity={1} />
          </mesh>
          <pointLight color="#f43f5e" intensity={2} distance={5} />
        </group>
      )}

      {/* Floating 3D Room Name Tag */}
      <Html position={[0, wallH + 0.8, 0]} center distanceFactor={24} className="pointer-events-none select-none">
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold shadow-2xl border backdrop-blur-md whitespace-nowrap transition-all ${
            isBlocked
              ? 'bg-rose-950/90 text-rose-300 border-rose-500 shadow-rose-900/50'
              : isStart
              ? 'bg-sky-950/90 text-sky-200 border-sky-400 shadow-sky-900/50'
              : isPartOfRoute
              ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400'
              : 'bg-slate-900/90 text-slate-200 border-slate-700/80'
          }`}
        >
          {isBlocked ? (
            <Flame className="w-3 h-3 text-rose-400" />
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
// Architectural Junction Hub
// -------------------------------------------------------------
interface JunctionHubProps {
  node: GraphNode;
  position: [number, number, number];
  isStart: boolean;
  isBlocked: boolean;
  isPartOfRoute: boolean;
  language: Language;
  onSelect: () => void;
  onContextMenu: () => void;
}

export const JunctionHub: React.FC<JunctionHubProps> = ({
  node,
  position,
  isStart,
  isBlocked,
  isPartOfRoute,
  language,
  onSelect,
  onContextMenu,
}) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <group position={position}>
      {/* Octagonal Junction Hub Platform */}
      <mesh
        position={[0, 0.1, 0]}
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
        receiveShadow
      >
        <cylinderGeometry args={[1.5, 1.6, 0.2, 8]} />
        <meshStandardMaterial
          color={
            isBlocked
              ? '#881337'
              : isStart
              ? '#0284c7'
              : isPartOfRoute
              ? '#0891b2'
              : hovered
              ? '#334155'
              : '#0f172a'
          }
          emissive={
            isBlocked
              ? '#f43f5e'
              : isStart
              ? '#38bdf8'
              : isPartOfRoute
              ? '#22d3ee'
              : '#0284c7'
          }
          emissiveIntensity={isBlocked ? 0.7 : isStart ? 0.8 : isPartOfRoute ? 0.4 : 0.1}
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {/* Junction Directional Center Ring */}
      <mesh position={[0, 0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.7, 16]} />
        <meshBasicMaterial
          color={isBlocked ? '#f43f5e' : isPartOfRoute ? '#38bdf8' : '#64748b'}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating 3D Junction Tag */}
      <Html position={[0, 1.1, 0]} center distanceFactor={24} className="pointer-events-none select-none">
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border backdrop-blur-md ${
            isBlocked
              ? 'bg-rose-950/90 text-rose-300 border-rose-500'
              : isStart
              ? 'bg-sky-950/90 text-sky-200 border-sky-400'
              : isPartOfRoute
              ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400'
              : 'bg-slate-950/80 text-slate-300 border-slate-800'
          }`}
        >
          <span>{node.id}</span>
          <span className="text-[8px] opacity-75 font-sans hidden sm:inline">
            {node.name[language] || node.name.en}
          </span>
        </div>
      </Html>
    </group>
  );
};

// -------------------------------------------------------------
// Architectural Emergency Exit Portal
// -------------------------------------------------------------
interface ExitPortalProps {
  node: GraphNode;
  position: [number, number, number];
  isClosed: boolean;
  isDestination: boolean;
  language: Language;
  onToggle: () => void;
}

export const ExitPortal: React.FC<ExitPortalProps> = ({
  node,
  position,
  isClosed,
  isDestination,
  language,
  onToggle,
}) => {
  const beamRef = useRef<THREE.Mesh>(null);

  // Soft subtle light beam pulsing
  useFrame(({ clock }) => {
    if (beamRef.current && !isClosed) {
      const t = clock.getElapsedTime() * 2;
      beamRef.current.scale.x = 1 + Math.sin(t) * 0.05;
      beamRef.current.scale.z = 1 + Math.sin(t) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* Exit Platform Base */}
      <mesh position={[0, 0.1, 0]} onClick={onToggle} receiveShadow>
        <boxGeometry args={[2.8, 0.2, 2.8]} />
        <meshStandardMaterial
          color={isClosed ? '#78350f' : isDestination ? '#047857' : '#065f46'}
          emissive={isClosed ? '#b45309' : '#10b981'}
          emissiveIntensity={isClosed ? 0.3 : isDestination ? 0.9 : 0.6}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Emergency Archway Door Frame */}
      {/* Left Pillar */}
      <mesh position={[-1.1, 1.1, 0]} castShadow>
        <boxGeometry args={[0.25, 2.2, 0.3]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} />
      </mesh>
      {/* Right Pillar */}
      <mesh position={[1.1, 1.1, 0]} castShadow>
        <boxGeometry args={[0.25, 2.2, 0.3]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} />
      </mesh>
      {/* Top Header Beam with Illuminated EXIT Sign */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <boxGeometry args={[2.45, 0.45, 0.35]} />
        <meshStandardMaterial
          color={isClosed ? '#991b1b' : '#059669'}
          emissive={isClosed ? '#dc2626' : '#34d399'}
          emissiveIntensity={isClosed ? 0.5 : 1.2}
        />
      </mesh>

      {/* Sealed Crossbar if Exit is Closed */}
      {isClosed && (
        <mesh position={[0, 1.1, 0.05]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[2.4, 0.15, 0.1]} />
          <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.8} />
        </mesh>
      )}

      {/* Upward Volumetric Light Beam for Open Exits */}
      {!isClosed && (
        <mesh ref={beamRef} position={[0, 4.5, 0]}>
          <cylinderGeometry args={[0.6, 1.2, 9, 16]} />
          <meshBasicMaterial
            color="#34d399"
            transparent
            opacity={isDestination ? 0.22 : 0.12}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Green Emergency Beacon Light */}
      <pointLight
        position={[0, 2.4, 0.5]}
        color={isClosed ? '#f59e0b' : '#34d399'}
        intensity={isClosed ? 0.5 : isDestination ? 2.5 : 1.5}
        distance={6}
      />

      {/* Floating 3D Exit Tag */}
      <Html position={[0, 2.8, 0]} center distanceFactor={24} className="pointer-events-none select-none">
        <div
          onClick={onToggle}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold shadow-2xl border backdrop-blur-md cursor-pointer pointer-events-auto transition-all ${
            isClosed
              ? 'bg-amber-950/95 text-amber-300 border-amber-500 shadow-amber-950/50'
              : 'bg-emerald-950/95 text-emerald-200 border-emerald-400 shadow-emerald-950/50 animate-pulse'
          }`}
        >
          {isClosed ? <DoorClosed className="w-3.5 h-3.5" /> : <LogOut className="w-3.5 h-3.5" />}
          <span>{node.id}: {isClosed ? (language === 'bn' ? 'সিলকৃত' : 'SEALED') : (language === 'bn' ? 'নির্গমন' : 'EXIT')}</span>
        </div>
      </Html>
    </group>
  );
};

// -------------------------------------------------------------
// Walkable Corridor Segment
// -------------------------------------------------------------
interface WalkableCorridorProps {
  edge: GraphEdge;
  startPos: [number, number, number];
  endPos: [number, number, number];
  isBlocked: boolean;
  isPartOfRoute: boolean;
  onToggle: () => void;
}

export const WalkableCorridor: React.FC<WalkableCorridorProps> = ({
  edge,
  startPos,
  endPos,
  isBlocked,
  isPartOfRoute,
  onToggle,
}) => {
  const vStart = useMemo(() => new THREE.Vector3(...startPos), [startPos]);
  const vEnd = useMemo(() => new THREE.Vector3(...endPos), [endPos]);
  const length = useMemo(() => vStart.distanceTo(vEnd), [vStart, vEnd]);
  const midPoint = useMemo(() => vStart.clone().add(vEnd).multiplyScalar(0.5), [vStart, vEnd]);

  const orientation = useMemo(() => {
    const dir = vEnd.clone().sub(vStart).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    return new THREE.Quaternion().setFromUnitVectors(up, dir);
  }, [vStart, vEnd]);

  return (
    <group>
      {/* Physical Floor Strip */}
      <mesh
        position={midPoint}
        quaternion={orientation}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        receiveShadow
      >
        <cylinderGeometry args={[0.45, 0.45, length, 12]} />
        <meshStandardMaterial
          color={
            isBlocked
              ? '#881337'
              : isPartOfRoute
              ? '#0284c7'
              : '#1e293b'
          }
          emissive={
            isBlocked
              ? '#f43f5e'
              : isPartOfRoute
              ? '#38bdf8'
              : '#0f172a'
          }
          emissiveIntensity={isBlocked ? 0.6 : isPartOfRoute ? 0.7 : 0.05}
          roughness={0.5}
          metalness={0.4}
          transparent={isBlocked}
          opacity={isBlocked ? 0.4 : 1.0}
        />
      </mesh>

      {/* Floating Corridor Transit Cost Badge */}
      <Html position={[midPoint.x, midPoint.y + 0.5, midPoint.z]} center distanceFactor={24}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-all border shadow-lg ${
            isBlocked
              ? 'bg-rose-950/90 text-rose-300 border-rose-500'
              : isPartOfRoute
              ? 'bg-sky-950/90 text-sky-200 border-sky-400'
              : 'bg-slate-950/90 text-slate-400 border-slate-800 hover:border-sky-500'
          }`}
          title={`Corridor transit cost: ${edge.cost}`}
        >
          {edge.cost}
        </div>
      </Html>
    </group>
  );
};
