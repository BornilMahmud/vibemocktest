import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface EvacueeCharacterProps {
  position: [number, number, number];
  rotationY: number;
  isWalking: boolean;
  isEmergency: boolean;
}

export const EvacueeCharacter: React.FC<EvacueeCharacterProps> = ({
  position,
  rotationY,
  isWalking,
  isEmergency,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const torsoRef = useRef<THREE.Group>(null);

  // Procedural Walking Animation Loop
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 11; // walk cadence

    if (isWalking) {
      // Legs stride in opposite phases
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(t) * 0.65;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = -Math.sin(t) * 0.65;
      }

      // Arms swing in counter-balance
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -Math.sin(t) * 0.55;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = Math.sin(t) * 0.55;
      }

      // Torso & head vertical bounce
      if (torsoRef.current) {
        torsoRef.current.position.y = 0.55 + Math.abs(Math.sin(t)) * 0.06;
      }
    } else {
      // Idle gentle breathing
      const idleT = clock.getElapsedTime() * 2;
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
      if (torsoRef.current) {
        torsoRef.current.position.y = 0.55 + Math.sin(idleT) * 0.015;
      }
    }
  });

  return (
    <group ref={rootRef} position={position} rotation={[0, rotationY, 0]}>
      {/* Torso & Upper Body Group */}
      <group ref={torsoRef} position={[0, 0.55, 0]}>
        {/* Head */}
        <mesh position={[0, 0.65, 0]} castShadow>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Safety Helmet */}
        <mesh position={[0, 0.72, 0.02]} castShadow>
          <sphereGeometry args={[0.21, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
          <meshStandardMaterial
            color={isEmergency ? '#fbbf24' : '#38bdf8'}
            emissive={isEmergency ? '#f59e0b' : '#0284c7'}
            emissiveIntensity={0.6}
            roughness={0.2}
          />
        </mesh>

        {/* Headlamp Spotlight */}
        <mesh position={[0, 0.75, 0.2]}>
          <boxGeometry args={[0.08, 0.05, 0.05]} />
          <meshBasicMaterial color="#ffffff" />
          <spotLight
            position={[0, 0, 0]}
            target-position={[0, -0.5, 3]}
            color="#ffffff"
            intensity={1.2}
            angle={0.6}
            penumbra={0.5}
            distance={4}
          />
        </mesh>

        {/* Torso */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.28, 0.42, 0.2]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>

        {/* Reflective Safety Vest Stripes */}
        <mesh position={[0, 0.27, 0.005]}>
          <boxGeometry args={[0.29, 0.24, 0.205]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#059669"
            emissiveIntensity={0.5}
            roughness={0.2}
          />
        </mesh>

        {/* Left Arm */}
        <group position={[-0.2, 0.38, 0]}>
          <mesh ref={leftArmRef} position={[0, -0.16, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.04, 0.32, 8]} />
            <meshStandardMaterial color="#475569" roughness={0.4} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group position={[0.2, 0.38, 0]}>
          <mesh ref={rightArmRef} position={[0, -0.16, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.04, 0.32, 8]} />
            <meshStandardMaterial color="#475569" roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* Left Leg */}
      <group position={[-0.09, 0.45, 0]}>
        <mesh ref={leftLegRef} position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.045, 0.44, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group position={[0.09, 0.45, 0]}>
        <mesh ref={rightLegRef} position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.045, 0.44, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
      </group>

      {/* Ground Navigation Visibility Halo */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.65, 24]} />
        <meshBasicMaterial
          color={isEmergency ? '#38bdf8' : '#34d399'}
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
