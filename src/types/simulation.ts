export type SimulationPhase =
  | 'IDLE'          // Standard Command Center mode
  | 'PREPARING'     // Siren on, emergency lights on, camera descending
  | 'RUNNING'       // Agent is navigating along waypoints
  | 'PAUSED'        // Agent temporarily paused
  | 'REROUTING'     // Route interrupted by dynamic hazard, calculating new vector
  | 'SUCCESS'       // Agent safely reached open exit
  | 'FAILED';       // No safe exit reachable or start/current location blocked

export type CameraViewMode = 'OVERVIEW' | 'FOLLOW' | 'ORBIT' | 'EXIT';

export interface AgentMotionState {
  currentWaypointIndex: number;
  progressAlongSegment: number; // 0.0 to 1.0 between current node and next node
  worldPosition: [number, number, number];
  rotationY: number;
  isWalking: boolean;
  traversedCorridorsCount: number;
}
