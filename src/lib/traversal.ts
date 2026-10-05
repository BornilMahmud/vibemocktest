import type { FloorplanData, HazardState } from '../types/graph';

/**
 * Computes a deterministic best-effort safe traversal path when no escape exit is reachable.
 * 
 * Rules:
 * 1. Strictly respects all hazards:
 *    - Never enters a blocked node.
 *    - Never traverses a blocked edge.
 *    - Never enters a closed exit.
 * 2. Deterministic BFS prioritizing the furthest reachable node in the accessible graph component.
 * 3. Ties broken by lowest path cost, then lexicographical node sequence.
 * 4. Returns an array of node IDs representing the safe path traversed before becoming trapped.
 */
export function findBestEffortPath(
  floorplan: FloorplanData,
  startNodeId: string,
  hazards: HazardState
): string[] {
  // If the starting node itself is blocked, agent is immediately trapped
  if (hazards.blockedNodes.has(startNodeId)) {
    return [startNodeId];
  }

  // Build adjacency list for accessible graph
  const adj = new Map<string, Array<{ to: string; cost: number; edgeId: string }>>();
  floorplan.nodes.forEach((n) => {
    if (!hazards.blockedNodes.has(n.id) && !hazards.closedExits.has(n.id)) {
      adj.set(n.id, []);
    }
  });

  floorplan.edges.forEach((e) => {
    if (hazards.blockedEdges.has(e.id)) return;
    if (hazards.blockedNodes.has(e.source) || hazards.blockedNodes.has(e.target)) return;
    if (hazards.closedExits.has(e.source) || hazards.closedExits.has(e.target)) return;

    adj.get(e.source)?.push({ to: e.target, cost: e.cost, edgeId: e.id });
    adj.get(e.target)?.push({ to: e.source, cost: e.cost, edgeId: e.id });
  });

  // Sort neighbors deterministically by edge cost, then lexicographical node ID
  adj.forEach((neighbors) => {
    neighbors.sort((a, b) => {
      if (a.cost !== b.cost) return a.cost - b.cost;
      return a.to.localeCompare(b.to);
    });
  });

  // BFS to find the furthest reachable node
  const queue: string[] = [startNodeId];
  const parent = new Map<string, string | null>();
  const hops = new Map<string, number>();
  const totalCost = new Map<string, number>();

  parent.set(startNodeId, null);
  hops.set(startNodeId, 0);
  totalCost.set(startNodeId, 0);

  let furthestNode = startNodeId;
  let maxHops = 0;
  let maxCost = 0;

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const currHops = hops.get(curr) || 0;
    const currCost = totalCost.get(curr) || 0;

    // Check if this is the furthest reachable node
    if (
      currHops > maxHops ||
      (currHops === maxHops && currCost > maxCost) ||
      (currHops === maxHops && currCost === maxCost && curr.localeCompare(furthestNode) < 0)
    ) {
      furthestNode = curr;
      maxHops = currHops;
      maxCost = currCost;
    }

    const neighbors = adj.get(curr) || [];
    for (const edge of neighbors) {
      if (!parent.has(edge.to)) {
        parent.set(edge.to, curr);
        hops.set(edge.to, currHops + 1);
        totalCost.set(edge.to, currCost + edge.cost);
        queue.push(edge.to);
      }
    }
  }

  // Reconstruct path from startNodeId to furthestNode
  const path: string[] = [];
  let curr: string | null = furthestNode;
  while (curr !== null) {
    path.push(curr);
    curr = parent.get(curr) ?? null;
  }
  path.reverse();

  return path.length > 0 ? path : [startNodeId];
}
