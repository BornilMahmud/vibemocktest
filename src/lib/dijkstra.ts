import type { 
  FloorplanData, 
  GraphNode, 
  HazardState, 
  RouteResult, 
  RouteStep,
  ExitCandidateEvaluation 
} from '../types/graph';

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
 * - Generates full explainability metrics for judge inspection.
 */
export function computeOptimalRoute(
  floorplan: FloorplanData,
  startNodeId: string,
  hazards: HazardState
): RouteResult {
  const t0 = performance.now();

  const nodeMap = new Map<string, GraphNode>();
  floorplan.nodes.forEach(n => nodeMap.set(n.id, n));

  const allExitNodes = floorplan.nodes.filter(n => n.type === 'exit');

  const startNode = nodeMap.get(startNodeId);
  if (!startNode) {
    return {
      status: 'INVALID_DATASET',
      path: [],
      totalCost: 0,
      steps: [],
      visitedNodesCount: 0,
      unreachableExits: allExitNodes.map(e => e.id),
      computationTimeMs: performance.now() - t0,
      exitEvaluations: [],
      explanation: {
        en: `Selected start location "${startNodeId}" does not exist in graph topology.`,
        bn: `নির্বাচিত প্রারম্ভিক অবস্থান "${startNodeId}" গ্রাফে বিদ্যমান নেই।`,
      },
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
      unreachableExits: allExitNodes.map(e => e.id),
      computationTimeMs: performance.now() - t0,
      exitEvaluations: allExitNodes.map(e => ({
        exitId: e.id,
        exitName: e.name,
        cost: null,
        status: 'UNREACHABLE',
        reasonEn: `Origin "${startNodeId}" is trapped by hazard`,
        reasonBn: `প্রারম্ভিক অবস্থান "${startNodeId}" বিপদে অবরুদ্ধ`,
      })),
      explanation: {
        en: `Designated starting location "${startNodeId}" is compromised by active fire or debris. Evacuation cannot originate from a hazardous node.`,
        bn: `প্রারম্ভিক অবস্থান "${startNodeId}" আগুন বা ধ্বংসস্তূপে অবরুদ্ধ। কোনো বিপদগ্রস্ত অবস্থান থেকে উদ্ধার পথ শুরু হতে পারে না।`,
      },
    };
  }

  // Identify open exits
  const openExits: GraphNode[] = allExitNodes.filter(
    n => !hazards.closedExits.has(n.id) && !hazards.blockedNodes.has(n.id)
  );

  if (openExits.length === 0) {
    return {
      status: 'NO_ROUTE_AVAILABLE',
      path: [],
      totalCost: 0,
      steps: [],
      visitedNodesCount: 0,
      unreachableExits: allExitNodes.map(n => n.id),
      computationTimeMs: performance.now() - t0,
      exitEvaluations: allExitNodes.map(e => ({
        exitId: e.id,
        exitName: e.name,
        cost: null,
        status: hazards.closedExits.has(e.id) ? 'SEALED' : 'UNREACHABLE',
        reasonEn: hazards.closedExits.has(e.id) ? 'Exit gate sealed' : 'Exit node blocked by hazard',
        reasonBn: hazards.closedExits.has(e.id) ? 'নির্গমন দ্বার সিলকৃত' : 'নির্গমন পথ বিপদে অবরুদ্ধ',
      })),
      explanation: {
        en: 'All emergency exit gates in the facility are sealed or blocked by hazards. No safe egress destination exists.',
        bn: 'ভবনের সকল জরুরি নির্গমন দ্বার সিলকৃত বা বিপদে অবরুদ্ধ। কোনো নিরাপদ গন্তব্য উন্মুক্ত নেই।',
      },
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
      exitEvaluations: allExitNodes.map(e => ({
        exitId: e.id,
        exitName: e.name,
        cost: e.id === startNodeId ? 0 : null,
        status: e.id === startNodeId ? 'OPTIMAL' : 'REACHABLE_HIGHER_COST',
        reasonEn: e.id === startNodeId ? 'Occupant is already at safe exit' : 'Occupant already safe at origin exit',
        reasonBn: e.id === startNodeId ? 'ব্যক্তি ইতিমধ্যেই নিরাপদ নির্গমন দ্বারে আছেন' : 'ইতিমধ্যেই নিরাপদ অবস্থানে আছেন',
      })),
      explanation: {
        en: `Occupant is already situated at open exit ${startNodeId}. Transit cost is 0.`,
        bn: `ব্যক্তি ইতিমধ্যেই উন্মুক্ত নির্গমন দ্বার ${startNodeId}-এ অবস্থান করছেন। স্থানান্তরণ খরচ ০।`,
      },
    };
  }

  // Build Adjacency List for non-blocked nodes and edges
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
  const edgeUsed = new Map<string, string>();
  const visited = new Set<string>();

  dist.set(startNodeId, 0);
  bestPath.set(startNodeId, [startNodeId]);

  const pq: { id: string; cost: number; path: string[] }[] = [
    { id: startNodeId, cost: 0, path: [startNodeId] }
  ];

  while (pq.length > 0) {
    pq.sort((a, b) => {
      if (a.cost !== b.cost) return a.cost - b.cost;
      return comparePaths(a.path, b.path);
    });

    const curr = pq.shift()!;
    if (visited.has(curr.id)) continue;
    visited.add(curr.id);

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
        // Equal path cost to same node -> lexicographically smallest node sequence
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

  // Evaluate candidate exits
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
    const exitEvaluations: ExitCandidateEvaluation[] = allExitNodes.map(e => {
      const isClosed = hazards.closedExits.has(e.id);
      const isBlocked = hazards.blockedNodes.has(e.id);
      return {
        exitId: e.id,
        exitName: e.name,
        cost: null,
        status: isClosed ? 'SEALED' : isBlocked ? 'UNREACHABLE' : 'UNREACHABLE',
        reasonEn: isClosed 
          ? 'Exit sealed' 
          : isBlocked 
          ? 'Exit node blocked by fire/hazard' 
          : 'Path severed by blocked intermediate corridors',
        reasonBn: isClosed 
          ? 'গেট বন্ধ' 
          : isBlocked 
          ? 'নির্গমন নোড বিপদে অবরুদ্ধ' 
          : 'সংযোগকারী করিডোর অবরুদ্ধ থাকায় পথ নেই',
      };
    });

    return {
      status: 'NO_ROUTE_AVAILABLE',
      path: [],
      totalCost: 0,
      steps: [],
      visitedNodesCount: visited.size,
      unreachableExits: openExits.map(e => e.id),
      computationTimeMs: performance.now() - t0,
      exitEvaluations,
      explanation: {
        en: 'All corridors connecting to open exits are severed by active hazards. Safe egress is unreachable.',
        bn: 'উন্মুক্ত নির্গমন পথের সাথে সংযোগকারী সকল করিডোর সক্রিয় প্রতিবন্ধকতায় বিচ্ছিন্ন।',
      },
    };
  }

  // Sort reachable exits deterministically:
  // 1. Lowest total cost
  // 2. Tie-break: lexicographically smallest exit ID
  // 3. Tie-break: lexicographically smallest node path sequence
  reachableExits.sort((a, b) => {
    if (a.cost !== b.cost) return a.cost - b.cost;
    const exitCmp = a.exit.id.localeCompare(b.exit.id);
    if (exitCmp !== 0) return exitCmp;
    return comparePaths(a.path, b.path);
  });

  const optimal = reachableExits[0];

  // Build step-by-step route breakdown
  const steps: RouteStep[] = [];
  let cumCost = 0;
  for (let i = 0; i < optimal.path.length - 1; i++) {
    const fromId = optimal.path[i];
    const toId = optimal.path[i + 1];
    const fromNode = nodeMap.get(fromId)!;
    const toNode = nodeMap.get(toId)!;

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

  // Build exit evaluations matrix for explainability
  const exitEvaluations: ExitCandidateEvaluation[] = allExitNodes.map(e => {
    const isClosed = hazards.closedExits.has(e.id);
    const isBlocked = hazards.blockedNodes.has(e.id);
    const rExit = reachableExits.find(re => re.exit.id === e.id);

    if (e.id === optimal.exit.id) {
      return {
        exitId: e.id,
        exitName: e.name,
        cost: optimal.cost,
        status: 'OPTIMAL',
        path: optimal.path,
        reasonEn: `Lowest transit cost (${optimal.cost} units). Selected as optimal safe exit.`,
        reasonBn: `সর্বনিম্ন স্থানান্তরণ খরচ (${optimal.cost} ইউনিট)। সর্বোত্তম নিরাপদ পথ হিসেবে নির্বাচিত।`,
      };
    } else if (isClosed) {
      return {
        exitId: e.id,
        exitName: e.name,
        cost: null,
        status: 'SEALED',
        reasonEn: 'Exit door is sealed/closed by hazard protocol.',
        reasonBn: 'জরুরি প্রটোকল অনুযায়ী নির্গমন দ্বারটি বন্ধ।',
      };
    } else if (isBlocked) {
      return {
        exitId: e.id,
        exitName: e.name,
        cost: null,
        status: 'UNREACHABLE',
        reasonEn: 'Exit location is directly compromised by hazard.',
        reasonBn: 'নির্গমন অবস্থানটি সরাসরি বিপদে অবরুদ্ধ।',
      };
    } else if (rExit) {
      return {
        exitId: e.id,
        exitName: e.name,
        cost: rExit.cost,
        status: 'REACHABLE_HIGHER_COST',
        path: rExit.path,
        reasonEn: `Reachable at cost ${rExit.cost}, but ${optimal.exit.id} is lower cost (${optimal.cost}).`,
        reasonBn: `প্রবেশযোগ্য (খরচ: ${rExit.cost}), তবে ${optimal.exit.id}-এর খরচ কম (${optimal.cost})।`,
      };
    } else {
      return {
        exitId: e.id,
        exitName: e.name,
        cost: null,
        status: 'UNREACHABLE',
        reasonEn: 'Connecting corridor segments severed by active blockades.',
        reasonBn: 'সংযোগকারী করিডোর অবরুদ্ধ থাকায় পৌঁছানো সম্ভব নয়।',
      };
    }
  });

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
    exitEvaluations,
    explanation: {
      en: `Selected ${optimal.exit.id} with minimum transit cost of ${optimal.cost} (${optimal.path.join(' → ')}).`,
      bn: `সর্বনিম্ন ${optimal.cost} স্থানান্তরণ খরচে নির্গমন দ্বার ${optimal.exit.id} নির্বাচিত (${optimal.path.join(' → ')}।`,
    },
  };
}
