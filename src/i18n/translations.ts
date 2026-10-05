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
  },
};
