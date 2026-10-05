export type SimulationPhase =
  | 'IDLE'          // Standard Command Center mode
  | 'PREPARING'     // Preparing simulation
  | 'RUNNING'       // Agent is navigating along waypoints
  | 'PAUSED'        // Agent temporarily paused
  | 'REROUTING'     // Route interrupted by dynamic hazard, calculating new vector
  | 'TRAPPED'       // Agent reached dead end, realizing no safe escape exists
  | 'SUCCESS'       // Agent safely reached open exit
  | 'FAILED';       // Trapped sequence finished, showing failure analysis

export type CameraViewMode = 'OVERVIEW' | 'FOLLOW' | 'ORBIT' | 'EXIT' | 'TRAPPED' | 'FAILED';

export interface AgentMotionState {
  currentWaypointIndex: number;
  progressAlongSegment: number; // 0.0 to 1.0 between current node and next node
  worldPosition: [number, number, number];
  rotationY: number;
  isWalking: boolean;
  traversedCorridorsCount: number;
}
