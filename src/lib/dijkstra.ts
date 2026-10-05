import type { FloorplanData, GraphNode, HazardState, RouteResult, RouteStep } from '../types/graph';

/**
 * Compare two node paths lexicographically by their sequence of node IDs.
 * Returns negative if pathA < pathB, positive if pathA > pathB, 0 if equal.
 */
export function comparePaths(pathA: string[], pathB: string[]): number {
  const minLen = Math.min(pathA.length, pathB.length);
  for (let i = 0; i < minLen; i++) {
    const cmp = pathA[i].localeCompare(pathB[i]);
    if (cmp !== 0) return cmp;
  }
  return pathA.length - pathB.length;
}

interface AdjacencyEdge {
  neighborId: string;
  cost: number;
  edgeId: string;
}

/**
 * Computes the optimal evacuation route according to contest rules:
 * - Graph is undirected with positive edge weights.
 * - Blocked nodes cannot be entered or traversed.
 * - Blocked node incident edges are dropped.
 * - Blocked edges remove only that connection.
 * - Closed exits cannot be destinations.
 * - Select reachable open exit with minimum total cost.
 * - Tie-break 1: Equal exit cost => lexicographically smallest exit ID.
 * - Tie-break 2: Equal path cost to same node => lexicographically smallest node-ID sequence.
 */
export function computeOptimalRoute(
  floorplan: FloorplanData,
  startNodeId: string,
  hazards: HazardState
): RouteResult {
  const t0 = performance.now();

  const nodeMap = new Map<string, GraphNode>();
  floorplan.nodes.forEach(n => nodeMap.set(n.id, n));

  const startNode = nodeMap.get(startNodeId);
  if (!startNode) {
    return {
      status: 'INVALID_DATASET',
      path: [],
      totalCost: 0,
      steps: [],
      visitedNodesCount: 0,
      unreachableExits: [],
      computationTimeMs: performance.now() - t0,
    };
  }

  // Check if start location is blocked
  if (hazards.blockedNodes.has(startNodeId)) {
    return {
      status: 'START_LOCATION_BLOCKED',
      path: [],
      totalCost: 0,
      steps: [],
      visitedNodesCount: 0,
      unreachableExits: [],
      computationTimeMs: performance.now() - t0,
    };
  }

  // Identify all open exits
  const openExits: GraphNode[] = floorplan.nodes.filter(
    n => n.type === 'exit' && !hazards.closedExits.has(n.id) && !hazards.blockedNodes.has(n.id)
  );

  if (openExits.length === 0) {
    return {
      status: 'NO_ROUTE_AVAILABLE',
      path: [],
      totalCost: 0,
      steps: [],
      visitedNodesCount: 0,
      unreachableExits: floorplan.nodes.filter(n => n.type === 'exit').map(n => n.id),
      computationTimeMs: performance.now() - t0,
    };
  }

  // If start node is itself an open exit
  if (startNode.type === 'exit' && !hazards.closedExits.has(startNode.id)) {
    return {
      status: 'OPTIMAL_ROUTE_FOUND',
      path: [startNodeId],
      totalCost: 0,
      destinationExitId: startNodeId,
      destinationExit: startNode,
      steps: [],
      visitedNodesCount: 1,
      unreachableExits: [],
      computationTimeMs: performance.now() - t0,
    };
  }

  // Build Adjacency List for valid, non-blocked nodes and edges
  const adj = new Map<string, AdjacencyEdge[]>();
  floorplan.nodes.forEach(n => adj.set(n.id, []));

  floorplan.edges.forEach(edge => {
    // If edge itself is blocked, skip
    if (hazards.blockedEdges.has(edge.id)) return;

    // If either endpoint is blocked, skip
    if (hazards.blockedNodes.has(edge.source) || hazards.blockedNodes.has(edge.target)) return;

    // Both endpoints must exist in floorplan
    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) return;

    // Undirected corridors
    adj.get(edge.source)?.push({ neighborId: edge.target, cost: edge.cost, edgeId: edge.id });
    adj.get(edge.target)?.push({ neighborId: edge.source, cost: edge.cost, edgeId: edge.id });
  });

  // Dijkstra's Algorithm with exact tie-breaking
  const dist = new Map<string, number>();
  const bestPath = new Map<string, string[]>();
  const edgeUsed = new Map<string, string>(); // toNode -> edgeId
  const visited = new Set<string>();

  dist.set(startNodeId, 0);
  bestPath.set(startNodeId, [startNodeId]);

  // Priority queue item: { id, cost, path }
  const pq: { id: string; cost: number; path: string[] }[] = [
    { id: startNodeId, cost: 0, path: [startNodeId] }
  ];

  while (pq.length > 0) {
    // Extract min cost node. If cost is equal, use lexicographically smaller path
    pq.sort((a, b) => {
      if (a.cost !== b.cost) return a.cost - b.cost;
      return comparePaths(a.path, b.path);
    });

    const curr = pq.shift()!;
    if (visited.has(curr.id)) continue;
    visited.add(curr.id);

    // If we popped a state worse than current known best, skip
    const currentBestDist = dist.get(curr.id) ?? Infinity;
    if (curr.cost > currentBestDist) continue;

    const neighbors = adj.get(curr.id) || [];
    for (const edge of neighbors) {
      const neighborId = edge.neighborId;
      if (visited.has(neighborId)) continue;

      const newCost = curr.cost + edge.cost;
      const candidatePath = [...curr.path, neighborId];
      const existingDist = dist.get(neighborId) ?? Infinity;
      const existingPath = bestPath.get(neighborId);

      let shouldUpdate = false;
      if (newCost < existingDist) {
        shouldUpdate = true;
      } else if (newCost === existingDist && existingPath) {
        // Tie-breaker: equal cost => lexicographically smallest node-ID sequence
        if (comparePaths(candidatePath, existingPath) < 0) {
          shouldUpdate = true;
        }
      }

      if (shouldUpdate) {
        dist.set(neighborId, newCost);
        bestPath.set(neighborId, candidatePath);
        edgeUsed.set(neighborId, edge.edgeId);
        pq.push({ id: neighborId, cost: newCost, path: candidatePath });
      }
    }
  }

  // Find reachable open exits
  const reachableExits: { exit: GraphNode; cost: number; path: string[] }[] = [];
  const unreachableExits: string[] = [];

  for (const exit of openExits) {
    const exitCost = dist.get(exit.id);
    const exitPath = bestPath.get(exit.id);
    if (exitCost !== undefined && exitPath) {
      reachableExits.push({ exit, cost: exitCost, path: exitPath });
    } else {
      unreachableExits.push(exit.id);
    }
  }

  if (reachableExits.length === 0) {
    return {
      status: 'NO_ROUTE_AVAILABLE',
      path: [],
      totalCost: 0,
      steps: [],
      visitedNodesCount: visited.size,
      unreachableExits: openExits.map(e => e.id),
      computationTimeMs: performance.now() - t0,
    };
  }

  // Select optimal exit:
  // 1. Minimum total cost
  // 2. Tie-break: lexicographically smallest exit ID
  // 3. Tie-break: lexicographically smallest node-ID sequence (already guaranteed by Dijkstra)
  reachableExits.sort((a, b) => {
    if (a.cost !== b.cost) return a.cost - b.cost;
    const exitCmp = a.exit.id.localeCompare(b.exit.id);
    if (exitCmp !== 0) return exitCmp;
    return comparePaths(a.path, b.path);
  });

  const optimal = reachableExits[0];

  // Reconstruct step-by-step route with costs and edges
  const steps: RouteStep[] = [];
  let cumCost = 0;
  for (let i = 0; i < optimal.path.length - 1; i++) {
    const fromId = optimal.path[i];
    const toId = optimal.path[i + 1];
    const fromNode = nodeMap.get(fromId)!;
    const toNode = nodeMap.get(toId)!;

    // Find the edge connecting them
    const connectingEdge = floorplan.edges.find(
      e =>
        (e.source === fromId && e.target === toId) ||
        (e.source === toId && e.target === fromId)
    );

    const edgeCost = connectingEdge ? connectingEdge.cost : 0;
    cumCost += edgeCost;

    steps.push({
      fromNode,
      toNode,
      edgeCost,
      cumulativeCost: cumCost,
      edgeId: connectingEdge?.id || `${fromId}-${toId}`,
    });
  }

  return {
    status: 'OPTIMAL_ROUTE_FOUND',
    path: optimal.path,
    totalCost: optimal.cost,
    destinationExitId: optimal.exit.id,
    destinationExit: optimal.exit,
    steps,
    visitedNodesCount: visited.size,
    unreachableExits,
    computationTimeMs: performance.now() - t0,
  };
}
