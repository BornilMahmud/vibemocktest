export type Language = 'en' | 'bn';

export interface Translations {
  appName: string;
  appSubtitle: string;
  badgeLive: string;
  resetAll: string;
  soundOn: string;
  soundOff: string;
  sirenOn: string;
  sirenOff: string;
  emergencyAlert: string;

  // Tabs / Navigation
  tabMap: string;
  tabAnalytics: string;
  tabPresets: string;

  // Control Center
  controlCenter: string;
  startLocation: string;
  selectStartNode: string;
  hazardManagement: string;
  activeHazardsCount: string;
  hazardBlockNode: string;
  hazardBlockEdge: string;
  hazardCloseExit: string;
  clickToBlock: string;
  clickToUnblock: string;
  clickToCloseExit: string;
  clickToOpenExit: string;
  noHazardsActive: string;
  clearHazards: string;

  // Preset & Dataset
  presetSection: string;
  loadPreset: string;
  importJson: string;
  exportJson: string;
  dragDropJson: string;
  invalidJson: string;

  // Quick Verification Scenarios
  contestScenarios: string;
  scenario1: string;
  scenario1Desc: string;
  scenario2: string;
  scenario2Desc: string;
  scenario3: string;
  scenario3Desc: string;
  scenario4: string;
  scenario4Desc: string;
  scenario5: string;
  scenario5Desc: string;
  scenarioCategoryContest: string;
  scenarioCategoryTieBreak: string;
  scenarioCategoryHospital: string;
  scenarioCategoryCyber: string;
  scenario6: string;
  scenario6Desc: string;
  scenario7: string;
  scenario7Desc: string;
  scenario8: string;
  scenario8Desc: string;
  scenario9: string;
  scenario9Desc: string;
  scenario10: string;
  scenario10Desc: string;
  scenario11: string;
  scenario11Desc: string;
  scenario12: string;
  scenario12Desc: string;
  runScenario: string;

  // Route Intel Panel
  routeIntel: string;
  routeStatus: string;
  statusOptimal: string;
  statusStartBlocked: string;
  statusNoRoute: string;
  statusInvalid: string;

  optimalExit: string;
  totalCost: string;
  costUnits: string;
  totalSteps: string;
  nodesVisited: string;
  calcLatency: string;
  pathSequence: string;
  stepByStepTurn: string;
  evacuateVia: string;
  edgeTransitCost: string;

  // Simulation Controls
  simulation: string;
  playSimulation: string;
  pauseSimulation: string;
  stepForward: string;
  resetSimulation: string;
  simSpeed: string;
  simEvacuating: string;
  simSafe: string;
  simBlocked: string;

  // Map & Visualizer
  mapHeroTitle: string;
  clickRoomToStart: string;
  shiftClickToHazard: string;
  corridorCostPill: string;
  exitGate: string;

  // Legend
  legendTitle: string;
  legendRoom: string;
  legendCorridor: string;
  legendExit: string;
  legendStart: string;
  legendActiveRoute: string;
  legendBlockedNode: string;
  legendBlockedCorridor: string;
  legendClosedExit: string;

  // Validation Modal
  validationTitle: string;
  validationPassed: string;
  validationFailed: string;
  fixErrorsToProceed: string;
  closeModal: string;
  loadAnyway: string;

  // Empty & Error States
  noRouteDesc: string;
  startBlockedDesc: string;
  checkHazardsHint: string;
  noNodesInGraph: string;

  // Operational System States
  sysStateArmed: string;
  sysStateRouteFound: string;
  sysStateMonitoring: string;
  sysStateHazardDetected: string;
  sysStateRerouting: string;
  sysStateExitReached: string;
  sysStateFailed: string;

  // Explainability ("Why this route?")
  whyThisRoute: string;
  whyThisRouteDesc: string;
  selectedExitReason: string;
  alternativeExitsChecked: string;
  costBreakdown: string;
  hazardsAffectingRoute: string;
  exitOptimalLabel: string;
  exitSealedLabel: string;
  exitUnreachableLabel: string;

  // Data Inspector
  buildingDataTitle: string;
  buildingNameLabel: string;
  nodesLabel: string;
  corridorsLabel: string;
  roomsLabel: string;
  junctionsLabel: string;
  exitsLabel: string;
  activeHazardsLabel: string;
  graphHealthLabel: string;
  graphHealthValid: string;
  initialStateLabel: string;
  corridorsCount: string;

  // Initial Loader
  initializingBuilding: string;
  graphLoadedStep: string;
  corridorsMappedStep: string;
  exitsIdentifiedStep: string;
  routingReadyStep: string;
  systemReadyStep: string;
  skipIntro: string;

  // Dataset Invalid Rejection
  datasetInvalidTitle: string;
  couldNotLoadBuilding: string;
  problemPrefix: string;
  tryAnotherFile: string;

  // Trapped / Failure Simulation Experience
  trappedStatus: string;
  trappedDesc: string;
  simulateTrapped: string;
  lastPositionLabel: string;
  exitsAvailableLabel: string;
  routeLostNotice: string;
  trappedFailureDesc: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'SMART ESCAPE',
    appSubtitle: 'Real-Time Evacuation Route Simulator & Operations Deck',
    badgeLive: 'SYSTEM ARMED & ACTIVE',
    resetAll: 'Reset All',
    soundOn: 'Audio FX Enabled',
    soundOff: 'Audio FX Muted',
    sirenOn: 'Evacuation Siren ON',
    sirenOff: 'Test Evacuation Siren',
    emergencyAlert: 'EMERGENCY EVACUATION ORDER',

    tabMap: 'Tactical Floorplan',
    tabAnalytics: 'Telemetry & Graph Intel',
    tabPresets: 'Benchmark Datasets',

    controlCenter: 'COMMAND CONTROLS',
    startLocation: 'Starting Origin',
    selectStartNode: 'Select Current Location',
    hazardManagement: 'Hazard & Blockade Controls',
    activeHazardsCount: 'Active Hazards',
    hazardBlockNode: 'Block Node / Room',
    hazardBlockEdge: 'Block Corridor Segment',
    hazardCloseExit: 'Close / Seal Exit Gate',
    clickToBlock: 'Click node to toggle hazard',
    clickToUnblock: 'Clear hazard from node',
    clickToCloseExit: 'Seal exit gate',
    clickToOpenExit: 'Reopen exit gate',
    noHazardsActive: 'No active hazards detected. All corridors clear.',
    clearHazards: 'Clear All Hazards',

    presetSection: 'Floorplan Presets',
    loadPreset: 'Load Layout',
    importJson: 'Import Custom Dataset',
    exportJson: 'Export Current Scenario',
    dragDropJson: 'Drag & Drop Floorplan JSON or Click to Browse',
    invalidJson: 'Invalid JSON file. Please check syntax.',

    contestScenarios: 'Contest Verification Scenarios',
    scenario1: '1. Baseline Test (R1 Start)',
    scenario1Desc: 'Path R1 → C1 → C2 → E1 (Cost: 7)',
    scenario2: '2. Hazard Reroute (Block C2)',
    scenario2Desc: 'Path R1 → C1 → C3 → C4 → E2 (Cost: 11)',
    scenario3: '3. All Exits Sealed (Close E1 & E2)',
    scenario3Desc: 'Exits closed → No route available',
    scenario4: '4. Alternate Origin (R2 Start)',
    scenario4Desc: 'Path R2 → C3 → C4 → E2 (Cost: 7)',
    scenario5: '5. Origin Trapped (Block R1)',
    scenario5Desc: 'Start R1 blocked → Origin trapped alert',
    scenarioCategoryContest: 'Official Contest Benchmark',
    scenarioCategoryTieBreak: 'Tie-Breaking Determinism Proofs',
    scenarioCategoryHospital: 'Metropolitan Hospital Emergency',
    scenarioCategoryCyber: 'Cyber Defense Datacenter',
    scenario6: '6. Equal Exit Cost Tie-Break (E1 vs E2)',
    scenario6Desc: 'Both exits cost 5 → Resolves E1 by alphabetical order',
    scenario7: '7. Equal Path Cost Tie-Break (A vs B)',
    scenario7Desc: 'Both routes cost 4 → Resolves route via A by node order',
    scenario8: '8. ICU Emergency Evacuation',
    scenario8Desc: 'ICU → J_NORTH → Helipad Exit Alpha (Cost: 8)',
    scenario9: '9. Helipad Cut Off (Divert to Ambulance)',
    scenario9Desc: 'Exit Alpha sealed → Reroute to Exit Bravo (Cost: 9)',
    scenario10: '10. Hospital All Exits Sealed',
    scenario10Desc: 'Exits Alpha, Bravo & Charlie sealed → Trapped failure simulation',
    scenario11: '11. Server Hall Blast Evacuation',
    scenario11Desc: 'SERVER_HALL → SEC_CORRIDOR_1 → Blast East (Cost: 9)',
    scenario12: '12. East Blast Sealed (Divert West)',
    scenario12Desc: 'East exit sealed → Evacuate via Stairwell West (Cost: 8)',
    runScenario: 'Apply Scenario',

    routeIntel: 'ROUTE INTELLIGENCE',
    routeStatus: 'Status',
    statusOptimal: 'OPTIMAL ROUTE SECURED',
    statusStartBlocked: 'STARTING LOCATION BLOCKED',
    statusNoRoute: 'NO SAFE ROUTE AVAILABLE',
    statusInvalid: 'INVALID DATASET TOPOLOGY',

    optimalExit: 'Assigned Safe Exit',
    totalCost: 'Total Evacuation Cost',
    costUnits: 'transit units',
    totalSteps: 'Waypoints',
    nodesVisited: 'Search Scope',
    calcLatency: 'Computation Time',
    pathSequence: 'Optimal Waypoint Sequence',
    stepByStepTurn: 'Step-by-Step Path Guidance',
    evacuateVia: 'Proceed via',
    edgeTransitCost: 'transit cost',

    simulation: 'Evacuation Simulation Deck',
    playSimulation: 'Simulate Escape',
    pauseSimulation: 'Pause',
    stepForward: 'Next Step',
    resetSimulation: 'Reset Runner',
    simSpeed: 'Simulation Speed',
    simEvacuating: 'Agent transiting to safe egress...',
    simSafe: 'Agent safely reached exit gate!',
    simBlocked: 'Evacuation path blocked. Immediate shelter required.',

    mapHeroTitle: 'Tactical Evacuation Floorplan',
    clickRoomToStart: 'Click room/junction to set starting origin',
    shiftClickToHazard: 'Click hazard badge or toggle below to inject blockades',
    corridorCostPill: 'Cost',
    exitGate: 'EXIT',

    legendTitle: 'Operations Legend',
    legendRoom: 'Room / Office',
    legendCorridor: 'Junction / Corridor',
    legendExit: 'Emergency Exit',
    legendStart: 'Selected Origin',
    legendActiveRoute: 'Clear Escape Route',
    legendBlockedNode: 'Hazard / Fire Blockade',
    legendBlockedCorridor: 'Blocked Corridor',
    legendClosedExit: 'Sealed / Inactive Exit',

    validationTitle: 'Dataset Inspection & Validation Report',
    validationPassed: 'Dataset conforms 100% to specification.',
    validationFailed: 'Dataset contains critical errors.',
    fixErrorsToProceed: 'Please review and resolve the errors listed below.',
    closeModal: 'Dismiss',
    loadAnyway: 'Force Load',

    noRouteDesc: 'All paths to viable exits are impassable due to active hazards or sealed doors.',
    startBlockedDesc: 'The designated starting room or junction is currently compromised by fire or debris.',
    checkHazardsHint: 'Remove blockades or select an alternative starting room to compute an escape vector.',
    noNodesInGraph: 'No nodes present in current floorplan.',

    // Operational System States
    sysStateArmed: 'SYSTEM ARMED & READY',
    sysStateRouteFound: 'ROUTE CALCULATED',
    sysStateMonitoring: 'MONITORING HAZARDS',
    sysStateHazardDetected: 'HAZARD DETECTED',
    sysStateRerouting: 'REROUTING VECTOR',
    sysStateExitReached: 'SAFE EXIT REACHED',
    sysStateFailed: 'NO SAFE ROUTE',

    // Explainability ("Why this route?")
    whyThisRoute: 'WHY THIS ROUTE?',
    whyThisRouteDesc: 'Deterministic Dijkstra route selection telemetry and decision matrix.',
    selectedExitReason: 'Decision Basis',
    alternativeExitsChecked: 'Alternative Exits Evaluated',
    costBreakdown: 'Corridor Transit Breakdown',
    hazardsAffectingRoute: 'Hazards on Graph',
    exitOptimalLabel: 'OPTIMAL EGRESS',
    exitSealedLabel: 'SEALED / CLOSED',
    exitUnreachableLabel: 'UNREACHABLE',

    // Data Inspector
    buildingDataTitle: 'BUILDING DATA INSPECTOR',
    buildingNameLabel: 'Building Name',
    nodesLabel: 'Total Nodes',
    corridorsLabel: 'Corridors (Edges)',
    roomsLabel: 'Rooms',
    junctionsLabel: 'Junctions',
    exitsLabel: 'Exits',
    activeHazardsLabel: 'Active Hazards',
    graphHealthLabel: 'GRAPH HEALTH',
    graphHealthValid: 'VALID & DETERMINISTIC',
    initialStateLabel: 'INITIAL STATE',
    corridorsCount: 'corridors',

    // Initial Loader
    initializingBuilding: 'INITIALIZING BUILDING TOPOLOGY...',
    graphLoadedStep: 'Graph schema validated & loaded',
    corridorsMappedStep: 'Corridors & weights bidirectionalized',
    exitsIdentifiedStep: 'Exit portals mapped & verified',
    routingReadyStep: 'Dijkstra shortest path engine primed',
    systemReadyStep: 'SYSTEM READY',
    skipIntro: 'Skip Intro',

    // Dataset Invalid Rejection
    datasetInvalidTitle: 'DATASET INVALID',
    couldNotLoadBuilding: 'The application could not load this building.',
    problemPrefix: 'Problem',
    tryAnotherFile: 'TRY ANOTHER FILE',

    // Trapped / Failure Simulation Experience
    trappedStatus: 'AGENT TRAPPED — DEAD END',
    trappedDesc: 'Evacuation agent reached the furthest safe point. All forward exits are blocked or sealed.',
    simulateTrapped: 'Simulate Escape Attempt',
    lastPositionLabel: 'LAST POSITION',
    exitsAvailableLabel: 'EXITS AVAILABLE',
    routeLostNotice: '⚠️ ROUTE LOST — NO SAFE EXIT AHEAD',
    trappedFailureDesc: 'The evacuation attempt could not reach an accessible exit under the current hazard conditions.',
  },
  bn: {
    appName: 'স্মার্ট এস্কেপ',
    appSubtitle: 'রিয়েল-টাইম জরুরি বহির্গমন ও উদ্ধার পথ নির্দেশক ব্যবস্থা',
    badgeLive: 'নিরাপত্তা ব্যবস্থা সক্রিয় ও প্রস্তুত',
    resetAll: 'রিসেট করুন',
    soundOn: 'অডিও ইফেক্ট চালু',
    soundOff: 'অডিও ইফেক্ট বন্ধ',
    sirenOn: 'জরুরি সাইরেন চালু',
    sirenOff: 'জরুরি সাইরেন টেস্ট',
    emergencyAlert: 'জরুরি বহির্গমন সতর্কতা জারি',

    tabMap: 'কৌশলগত ফ্লোরপ্ল্যান',
    tabAnalytics: 'টেলিমেট্রি ও গ্রাফ তথ্য',
    tabPresets: 'মানদণ্ড ডেটাসেট',

    controlCenter: 'কমান্ড কন্ট্রোল সেন্টার',
    startLocation: 'প্রারম্ভিক অবস্থান',
    selectStartNode: 'বর্তমান অবস্থান নির্বাচন করুন',
    hazardManagement: 'বিপদ ও প্রতিবন্ধকতা নিয়ন্ত্রণ',
    activeHazardsCount: 'সক্রিয় প্রতিবন্ধকতা',
    hazardBlockNode: 'নোড / কক্ষ অবরুদ্ধ করুন',
    hazardBlockEdge: 'করিডোর অংশ অবরুদ্ধ করুন',
    hazardCloseExit: 'নির্গমন দ্বার সিল / বন্ধ করুন',
    clickToBlock: 'বিপদ যুক্ত করতে ক্লিক করুন',
    clickToUnblock: 'বিপদ মুক্ত করুন',
    clickToCloseExit: 'গেট বন্ধ করুন',
    clickToOpenExit: 'গেট পুনরায় খুলুন',
    noHazardsActive: 'কোনো সক্রিয় বিপদ নেই। সমস্ত করিডোর উন্মুক্ত।',
    clearHazards: 'সকল প্রতিবন্ধকতা মুছুন',

    presetSection: 'ফ্লোরপ্ল্যান প্রিসেট',
    loadPreset: 'লেআউট লোড করুন',
    importJson: 'কাস্টম ডেটাসেট আমদানি',
    exportJson: 'বর্তমান পরিস্থিতি এক্সপোর্ট',
    dragDropJson: 'ফ্লোরপ্ল্যান JSON ফাইল ড্রপ করুন বা ব্রাউজ করুন',
    invalidJson: 'অবৈধ JSON ফাইল। সিনট্যাক্স যাচাই করুন।',

    contestScenarios: 'প্রতিযোগিতা যাচাইকরণ দৃশ্যপট',
    scenario1: '১. বেসলাইন টেস্ট (R1 থেকে শুরু)',
    scenario1Desc: 'রুট R1 → C1 → C2 → E1 (খরচ: ৭)',
    scenario2: '২. বিপদকালীন দিক পরিবর্তন (C2 অবরুদ্ধ)',
    scenario2Desc: 'রুট R1 → C1 → C3 → C4 → E2 (খরচ: ১১)',
    scenario3: '৩. সকল নির্গমন দ্বার বন্ধ (E1 ও E2 বন্ধ)',
    scenario3Desc: 'দ্বার বন্ধ → কোনো নিরাপদ রুট নেই',
    scenario4: '৪. বিকল্প প্রারম্ভিক বিন্দু (R2 থেকে শুরু)',
    scenario4Desc: 'রুট R2 → C3 → C4 → E2 (খরচ: ৭)',
    scenario5: '৫. প্রারম্ভিক কক্ষেই আগুন (R1 অবরুদ্ধ)',
    scenario5Desc: 'শুরুর স্থান অবরুদ্ধ → প্রারম্ভিক বিপদ সতর্কতা',
    scenarioCategoryContest: 'অফিসিয়াল কন্টেস্ট বেঞ্চমার্ক',
    scenarioCategoryTieBreak: 'টাই-ব্রেকিং অ্যালগরিদম প্রমাণ',
    scenarioCategoryHospital: 'হাসপাতাল উইং জরুরি নিষ্ক্রমণ',
    scenarioCategoryCyber: 'সাইবার বাঙ্কার ও ডেটাসেন্টার',
    scenario6: '৬. সমান দূরত্বের নির্গমন টাই-ব্রেক (E1 বনাম E2)',
    scenario6Desc: 'উভয় গেটে দূরত্ব ৫ → বর্ণানুক্রমিক নিয়মে E1 নির্বাচিত',
    scenario7: '৭. সমখরচ বিকল্প রুট টাই-ব্রেক (রুট A বনাম B)',
    scenario7Desc: 'উভয় রুটে খরচ ৪ → নোড ক্রমানুসারে রুট A নির্বাচিত',
    scenario8: '৮. হাসপাতাল আইসিইউ থেকে হ্যালিপ্যাডে নিষ্ক্রমণ',
    scenario8Desc: 'আইসিইউ → উত্তর কনকোর্স → হ্যালিপ্যাড গেট (খরচ: ৮)',
    scenario9: '৯. হ্যালিপ্যাড অবরুদ্ধ (অ্যাম্বুলেন্স বে-তে স্থানান্তর)',
    scenario9Desc: 'হ্যালিপ্যাড সিলকৃত → অ্যাম্বুলেন্স বে-তে বিকল্প রুট (খরচ: ৯)',
    scenario10: '১০. হাসপাতালের সকল গেট অবরুদ্ধ (আটকা পড়ার দৃশ্য)',
    scenario10Desc: '৩টি গেটই সিলকৃত → আটকা পড়ার জরুরি সাইরেন সিমুলেশন',
    scenario11: '১১. সার্ভার কোর ব্লাস্ট নিষ্ক্রমণ',
    scenario11Desc: 'সার্ভার রুম → নিরাপত্তা পথ ১ → পূর্ব ব্লাস্ট গেট (খরচ: ৯)',
    scenario12: '১২. পূর্ব এয়ারলক বিচ্ছিন্ন (পশ্চিম জরুরি সিঁড়িতে স্থানান্তর)',
    scenario12Desc: 'পূর্ব গেট বন্ধ → পশ্চিম জরুরি সিঁড়িদ্বারে বিকল্প রুট (খরচ: ৮)',
    runScenario: 'দৃশ্যপট প্রয়োগ করুন',

    routeIntel: 'রুট বুদ্ধিমত্তা ডেক',
    routeStatus: 'স্ট্যাটাস',
    statusOptimal: 'সর্বোত্তম নিরাপদ পথ নির্ণীত',
    statusStartBlocked: 'প্রারম্ভিক অবস্থান অবরুদ্ধ!',
    statusNoRoute: 'কোনো নিরাপদ পথ উন্মুক্ত নেই!',
    statusInvalid: 'অবৈধ ডেটাসেট টপোলজি',

    optimalExit: 'নির্ধারিত নিরাপদ নির্গমন দ্বার',
    totalCost: 'মোট স্থানান্তরণ খরচ',
    costUnits: 'ইউনিট দূরত্ব',
    totalSteps: 'ওয়েপয়েন্ট সংখ্যা',
    nodesVisited: 'অনুসন্ধানের পরিধি',
    calcLatency: 'গণনার সময়',
    pathSequence: 'সর্বোত্তম ওয়েপয়েন্ট অনুক্রম',
    stepByStepTurn: 'ধাপে ধাপে উদ্ধার পথ নির্দেশিকা',
    evacuateVia: 'যে পথে অগ্রসর হবেন',
    edgeTransitCost: 'যাত্রাপথ খরচ',

    simulation: 'উদ্ধার অভিযান সিমুলেটর',
    playSimulation: 'সিমুলেশন শুরু',
    pauseSimulation: 'থামুন',
    stepForward: 'পরবর্তী ধাপ',
    resetSimulation: 'রিসেট রানার',
    simSpeed: 'সিমুলেশন গতি',
    simEvacuating: 'নিরাপদ নির্গমন দ্বারের দিকে অগ্রসর হচ্ছে...',
    simSafe: 'নিরাপদে নির্গমন দ্বারে পৌঁছেছে!',
    simBlocked: 'পথ সম্পূর্ণ অবরুদ্ধ। অনতিবিলম্বে সুরক্ষিত আশ্রয় নিন।',

    mapHeroTitle: 'কৌশলগত জরুরি বহির্গমন ম্যাপ',
    clickRoomToStart: 'শুরুর স্থান নির্ধারণ করতে রুমে ক্লিক করুন',
    shiftClickToHazard: 'প্রতিবন্ধকতা তৈরি করতে ব্যাজে ক্লিক করুন',
    corridorCostPill: 'খরচ',
    exitGate: 'নির্গমন',

    legendTitle: 'অপারেশনাল নির্দেশিকা',
    legendRoom: 'কক্ষ / অফিস',
    legendCorridor: 'সংযোগস্থল / করিডোর',
    legendExit: 'জরুরি নির্গমন দ্বার',
    legendStart: 'বর্তমান অবস্থান',
    legendActiveRoute: 'নিরাপদ বহির্গমন পথ',
    legendBlockedNode: 'বিপদ / আগুনের প্রতিবন্ধকতা',
    legendBlockedCorridor: 'অবরুদ্ধ করিডোর',
    legendClosedExit: 'বন্ধ বা সিলকৃত নির্গমন দ্বার',

    validationTitle: 'ডেটাসেট নিরীক্ষা ও যাচাই প্রতিবেদন',
    validationPassed: 'ডেটাসেটটি শতভাগ সঠিক ও স্পেসিফিকেশন সম্মত।',
    validationFailed: 'ডেটাসেটে গুরুতর ত্রুটি পরিলক্ষিত হয়েছে।',
    fixErrorsToProceed: 'অনুগ্রহ করে নিচে তালিকাভুক্ত ত্রুটিগুলি সংশোধন করুন।',
    closeModal: 'বাতিল করুন',
    loadAnyway: 'বাধ্যতামূলক লোড করুন',

    noRouteDesc: 'সক্রিয় প্রতিবন্ধকতা বা বন্ধ দ্বারের কারণে কোনো নির্গমন পথে পৌঁছানো সম্ভব হচ্ছে না।',
    startBlockedDesc: 'নির্বাচিত প্রারম্ভিক কক্ষ বা সংযোগস্থলটি বর্তমানে আগুন বা ধ্বংসস্তূপে অবরুদ্ধ।',
    checkHazardsHint: 'প্রতিবন্ধকতা অপসারণ করুন বা বিকল্প শুরুর কক্ষ নির্বাচন করুন।',
    noNodesInGraph: 'বর্তমান ফ্লোরপ্ল্যানে কোনো নোড পাওয়া যায়নি।',

    // Operational System States
    sysStateArmed: 'সিস্টেম প্রস্তুত ও সক্রিয়',
    sysStateRouteFound: 'নিরাপদ রুট নির্ণীত',
    sysStateMonitoring: 'বিপদ নিরীক্ষণ চলছে',
    sysStateHazardDetected: 'বিপদ শনাক্ত হয়েছে',
    sysStateRerouting: 'বিকল্প রুট গণনা চলছে',
    sysStateExitReached: 'নিরাপদে বহির্গমন সম্পন্ন',
    sysStateFailed: 'কোনো নিরাপদ পথ নেই',

    // Explainability ("Why this route?")
    whyThisRoute: 'কেন এই রুট?',
    whyThisRouteDesc: 'ডাইকস্ট্রা অ্যালগরিদম ভিত্তিক রুট নির্বাচন টেলিমেট্রি ও সিদ্ধান্ত ম্যাট্রিক্স।',
    selectedExitReason: 'সিদ্ধান্তের ভিত্তি',
    alternativeExitsChecked: 'যাচাইকৃত বিকল্প নির্গমন দ্বার',
    costBreakdown: 'করিডোর ট্রানজিট খরচ বিবরণী',
    hazardsAffectingRoute: 'গ্রাফে সক্রিয় বিপদ',
    exitOptimalLabel: 'সর্বোত্তম বহির্গমন',
    exitSealedLabel: 'সিলকৃত / বন্ধ',
    exitUnreachableLabel: 'অনধিগম্য',

    // Data Inspector
    buildingDataTitle: 'বিল্ডিং ডেটা ও গ্রাফ পরিদর্শক',
    buildingNameLabel: 'বিল্ডিং নাম',
    nodesLabel: 'মোট নোড',
    corridorsLabel: 'করিডোর (এজ)',
    roomsLabel: 'কক্ষ',
    junctionsLabel: 'সংযোগস্থল',
    exitsLabel: 'নির্গমন দ্বার',
    activeHazardsLabel: 'সক্রিয় প্রতিবন্ধকতা',
    graphHealthLabel: 'গ্রাফের স্থিতি',
    graphHealthValid: 'বৈধ ও সুনির্দিষ্ট',
    initialStateLabel: 'প্রাথমিক অবস্থা',
    corridorsCount: 'করিডোর',

    // Initial Loader
    initializingBuilding: 'বিল্ডিং টপোলজি প্রস্তুত করা হচ্ছে...',
    graphLoadedStep: 'গ্রাফ স্কিমা যাচাই ও লোড সম্পন্ন',
    corridorsMappedStep: 'করিডোর ও সংযোগ ম্যাপিং সম্পন্ন',
    exitsIdentifiedStep: 'বহির্গমন দ্বার শনাক্তকরণ সম্পন্ন',
    routingReadyStep: 'ডাইকস্ট্রা ইঞ্জিন প্রস্তুত',
    systemReadyStep: 'সিস্টেম প্রস্তুত',
    skipIntro: 'স্কিপ করুন',

    // Dataset Invalid Rejection
    datasetInvalidTitle: 'ডেটাসেট সঠিক নয়',
    couldNotLoadBuilding: 'এই বিল্ডিং ডেটা লোড করা যায়নি।',
    problemPrefix: 'সমস্যা',
    tryAnotherFile: 'অন্য ফাইল নির্বাচন করুন',

    // Trapped / Failure Simulation Experience
    trappedStatus: 'উদ্ধারকারী অবরুদ্ধ — পথ সমাপ্ত',
    trappedDesc: 'উদ্ধারকারী সর্বোচ্চ সম্ভাব্য নিরাপদ স্থানে পৌঁছেছেন। পরবর্তী সকল নির্গমন পথ বন্ধ বা অবরুদ্ধ।',
    simulateTrapped: 'বহির্গমন প্রচেষ্টা চালান',
    lastPositionLabel: 'সর্বশেষ অবস্থান',
    exitsAvailableLabel: 'উন্মুক্ত নির্গমন দ্বার',
    routeLostNotice: '⚠️ পথ অবরুদ্ধ — সামনে কোনো নিরাপদ নির্গমন নেই',
    trappedFailureDesc: 'বর্তমান ঝুঁকির অবস্থায় কোনো উন্মুক্ত নির্গমনপথে পৌঁছানো সম্ভব হয়নি।',
  },
};
