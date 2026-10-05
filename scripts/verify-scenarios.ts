import { CONTEST_BENCHMARK_PRESET } from '../src/lib/presets';
import { computeOptimalRoute } from '../src/lib/dijkstra';
import { FloorplanData, HazardState } from '../src/types/graph';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${msg}`);
  }
}

console.log('--- RUNNING CONTEST BENCHMARK VERIFICATION SUITE ---\n');

// 1. Baseline: Start R1, no hazards -> R1 -> C1 -> C2 -> E1 (cost 7)
const s1Hazards: HazardState = {
  blockedNodes: new Set(),
  blockedEdges: new Set(),
  closedExits: new Set(),
};
const res1 = computeOptimalRoute(CONTEST_BENCHMARK_PRESET, 'R1', s1Hazards);
console.log('Scenario 1 result:', res1.status, res1.path.join(' -> '), 'Cost:', res1.totalCost);
assert(res1.status === 'OPTIMAL_ROUTE_FOUND', 'Scenario 1 status must be OPTIMAL_ROUTE_FOUND');
assert(res1.path.join('->') === 'R1->C1->C2->E1', 'Scenario 1 path must be R1->C1->C2->E1');
assert(res1.totalCost === 7, 'Scenario 1 totalCost must be 7');
assert(res1.destinationExitId === 'E1', 'Scenario 1 destination must be E1');

// 2. Block C2: Start R1 -> R1 -> C1 -> C3 -> C4 -> E2 (cost 11)
const s2Hazards: HazardState = {
  blockedNodes: new Set(['C2']),
  blockedEdges: new Set(),
  closedExits: new Set(),
};
const res2 = computeOptimalRoute(CONTEST_BENCHMARK_PRESET, 'R1', s2Hazards);
console.log('Scenario 2 result:', res2.status, res2.path.join(' -> '), 'Cost:', res2.totalCost);
assert(res2.status === 'OPTIMAL_ROUTE_FOUND', 'Scenario 2 status must be OPTIMAL_ROUTE_FOUND');
assert(res2.path.join('->') === 'R1->C1->C3->C4->E2', 'Scenario 2 path must be R1->C1->C3->C4->E2');
assert(res2.totalCost === 11, 'Scenario 2 totalCost must be 11');
assert(res2.destinationExitId === 'E2', 'Scenario 2 destination must be E2');

// 3. Close E1 and E2: Start R1 -> No route available
const s3Hazards: HazardState = {
  blockedNodes: new Set(),
  blockedEdges: new Set(),
  closedExits: new Set(['E1', 'E2']),
};
const res3 = computeOptimalRoute(CONTEST_BENCHMARK_PRESET, 'R1', s3Hazards);
console.log('Scenario 3 result:', res3.status);
assert(res3.status === 'NO_ROUTE_AVAILABLE', 'Scenario 3 status must be NO_ROUTE_AVAILABLE');
assert(res3.path.length === 0, 'Scenario 3 path must be empty');

// 4. Start R2: Start R2 -> R2 -> C3 -> C4 -> E2 (cost 7)
const s4Hazards: HazardState = {
  blockedNodes: new Set(),
  blockedEdges: new Set(),
  closedExits: new Set(),
};
const res4 = computeOptimalRoute(CONTEST_BENCHMARK_PRESET, 'R2', s4Hazards);
console.log('Scenario 4 result:', res4.status, res4.path.join(' -> '), 'Cost:', res4.totalCost);
assert(res4.status === 'OPTIMAL_ROUTE_FOUND', 'Scenario 4 status must be OPTIMAL_ROUTE_FOUND');
assert(res4.path.join('->') === 'R2->C3->C4->E2', 'Scenario 4 path must be R2->C3->C4->E2');
assert(res4.totalCost === 7, 'Scenario 4 totalCost must be 7');
assert(res4.destinationExitId === 'E2', 'Scenario 4 destination must be E2');

// 5. Select R1 then block R1: Start R1, block R1 -> Starting location blocked
const s5Hazards: HazardState = {
  blockedNodes: new Set(['R1']),
  blockedEdges: new Set(),
  closedExits: new Set(),
};
const res5 = computeOptimalRoute(CONTEST_BENCHMARK_PRESET, 'R1', s5Hazards);
console.log('Scenario 5 result:', res5.status);
assert(res5.status === 'START_LOCATION_BLOCKED', 'Scenario 5 status must be START_LOCATION_BLOCKED');
assert(res5.path.length === 0, 'Scenario 5 path must be empty');

// 6. Test Tie-Breakers:
// Case A: Equal cost to different exits E1 and E2.
// E1 and E2 both cost 5. Must pick E1 because 'E1' < 'E2'.
const tieBreakFloorplan: FloorplanData = {
  id: 'tie-break-test',
  title: { en: 'Tie-break Floorplan', bn: 'টাই-ব্রেক' },
  nodes: [
    { id: 'START', name: { en: 'S', bn: 'S' }, type: 'room', x: 0, y: 0 },
    { id: 'E2', name: { en: 'E2', bn: 'E2' }, type: 'exit', x: 100, y: 100 },
    { id: 'E1', name: { en: 'E1', bn: 'E1' }, type: 'exit', x: 100, y: -100 },
  ],
  edges: [
    { id: 'e-s-e2', source: 'START', target: 'E2', cost: 5 },
    { id: 'e-s-e1', source: 'START', target: 'E1', cost: 5 },
  ],
};
const resTie1 = computeOptimalRoute(tieBreakFloorplan, 'START', s1Hazards);
console.log('Tie Break 1 (Equal Exit Cost): Chosen Exit:', resTie1.destinationExitId);
assert(resTie1.destinationExitId === 'E1', 'Tie-break between equal cost exits must pick lexicographically smaller exit ID (E1)');

// Case B: Equal cost to same exit through different paths:
// Path A: START -> A -> EXIT (cost: 2 + 2 = 4)
// Path B: START -> B -> EXIT (cost: 2 + 2 = 4)
// 'START'->'A'->'EXIT' vs 'START'->'B'->'EXIT' -> must pick 'A' path!
const tieBreakPathFloorplan: FloorplanData = {
  id: 'tie-break-path-test',
  title: { en: 'Path Tie-break', bn: 'পাথ টাই' },
  nodes: [
    { id: 'START', name: { en: 'S', bn: 'S' }, type: 'room', x: 0, y: 0 },
    { id: 'B', name: { en: 'B', bn: 'B' }, type: 'corridor', x: 50, y: 50 },
    { id: 'A', name: { en: 'A', bn: 'A' }, type: 'corridor', x: 50, y: -50 },
    { id: 'EXIT', name: { en: 'EXIT', bn: 'EXIT' }, type: 'exit', x: 100, y: 0 },
  ],
  edges: [
    { id: 'e-s-b', source: 'START', target: 'B', cost: 2 },
    { id: 'e-b-exit', source: 'B', target: 'EXIT', cost: 2 },
    { id: 'e-s-a', source: 'START', target: 'A', cost: 2 },
    { id: 'e-a-exit', source: 'A', target: 'EXIT', cost: 2 },
  ],
};
const resTie2 = computeOptimalRoute(tieBreakPathFloorplan, 'START', s1Hazards);
console.log('Tie Break 2 (Equal Path Cost): Path:', resTie2.path.join('->'));
assert(resTie2.path.join('->') === 'START->A->EXIT', 'Tie-break between equal cost paths to same exit must pick lexicographically smaller node sequence (START->A->EXIT)');

console.log('\n🎉 ALL 7 CONTEST BENCHMARK AND TIE-BREAKING TESTS PASSED PERFECTLY!');
