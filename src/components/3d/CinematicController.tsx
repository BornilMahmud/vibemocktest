import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { CameraViewMode, SimulationPhase } from '../../types/simulation';

interface CinematicControllerProps {
  cameraMode: CameraViewMode;
  simulationPhase: SimulationPhase;
  agentPosition: [number, number, number];
  exitPosition: [number, number, number] | null;
  overviewPosition: [number, number, number];
}

export const CinematicController: React.FC<CinematicControllerProps> = ({
  cameraMode,
  simulationPhase,
  agentPosition,
  exitPosition,
  overviewPosition,
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  // Target vectors for smooth interpolation
  const targetCamPos = useRef(new THREE.Vector3(...overviewPosition));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    // Determine target positions based on simulation phase and camera mode
    if (cameraMode === 'FOLLOW' && (simulationPhase === 'RUNNING' || simulationPhase === 'REROUTING')) {
      // Follow Camera: Behind and slightly above the moving agent
      targetCamPos.current.set(
        agentPosition[0] + 6,
        agentPosition[1] + 7.5,
        agentPosition[2] + 7.5
      );
      targetLookAt.current.set(agentPosition[0], agentPosition[1] + 0.8, agentPosition[2]);

      const lerpFactor = Math.min(1, delta * 3.5);
      camera.position.lerp(targetCamPos.current, lerpFactor);

      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt.current, lerpFactor);
        controlsRef.current.update();
      }
    } else if (cameraMode === 'EXIT' || simulationPhase === 'SUCCESS') {
      // Destination / Victory Camera: Reveal the safe exit
      const ex = exitPosition || [0, 0, 0];
      targetCamPos.current.set(ex[0] + 5, ex[1] + 4, ex[2] + 6);
      targetLookAt.current.set(ex[0], ex[1] + 1.2, ex[2]);

      const lerpFactor = Math.min(1, delta * 2.5);
      camera.position.lerp(targetCamPos.current, lerpFactor);

      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt.current, lerpFactor);
        controlsRef.current.update();
      }
    } else if (cameraMode === 'OVERVIEW' || simulationPhase === 'IDLE' || simulationPhase === 'PREPARING') {
      // Overview Isometric Camera
      targetCamPos.current.set(...overviewPosition);
      targetLookAt.current.set(0, 0, 0);

      const lerpFactor = Math.min(1, delta * 2.8);
      camera.position.lerp(targetCamPos.current, lerpFactor);

      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt.current, lerpFactor);
        controlsRef.current.update();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      minDistance={6}
      maxDistance={50}
      maxPolarAngle={Math.PI / 2.15} // Prevent camera going under the floor
      enabled={cameraMode === 'ORBIT' || simulationPhase === 'IDLE'}
    />
  );
};
