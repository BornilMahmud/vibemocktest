export type NodeType = 'room' | 'corridor' | 'exit';

export interface GraphNode {
  id: string;
  name: {
    en: string;
    bn: string;
  };
  type: NodeType;
  x: number;
  y: number;
  capacity?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  cost: number;
  label?: string;
}

export interface FloorplanData {
  id: string;
  title: {
    en: string;
    bn: string;
  };
  description?: {
    en: string;
    bn: string;
  };
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface HazardState {
  blockedNodes: Set<string>;
  blockedEdges: Set<string>;
  closedExits: Set<string>;
}

export type RouteStatus = 
  | 'OPTIMAL_ROUTE_FOUND'
  | 'START_LOCATION_BLOCKED'
  | 'NO_ROUTE_AVAILABLE'
  | 'INVALID_DATASET';

export interface RouteStep {
  fromNode: GraphNode;
  toNode: GraphNode;
  edgeCost: number;
  cumulativeCost: number;
  edgeId: string;
}

export interface ExitCandidateEvaluation {
  exitId: string;
  exitName: { en: string; bn: string };
  cost: number | null; // null if unreachable
  status: 'OPTIMAL' | 'REACHABLE_HIGHER_COST' | 'SEALED' | 'UNREACHABLE';
  path?: string[];
  reasonEn: string;
  reasonBn: string;
}

export interface RouteResult {
  status: RouteStatus;
  path: string[];             // Sequence of node IDs: ['R1', 'C1', 'C2', 'E1']
  totalCost: number;
  destinationExitId?: string;
  destinationExit?: GraphNode;
  steps: RouteStep[];
  visitedNodesCount: number;
  unreachableExits: string[];
  computationTimeMs: number;
  exitEvaluations: ExitCandidateEvaluation[];
  explanation: {
    en: string;
    bn: string;
  };
}

export interface ValidationError {
  field?: string;
  messageEn: string;
  messageBn: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}
