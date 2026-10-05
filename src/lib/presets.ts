import type { FloorplanData } from '../types/graph';

export const CONTEST_BENCHMARK_PRESET: FloorplanData = {
  id: 'contest-default',
  title: {
    en: 'Contest Benchmark Complex',
    bn: 'প্রতিযোগিতা মানদণ্ড কমপ্লেক্স',
  },
  description: {
    en: 'Official DevFest verification layout with dual exit corridors (E1 & E2) and cross-junction link.',
    bn: 'অফিসিয়াল ডেভফেস্ট যাচাইকরণ লেআউট যাতে দুটি নির্গমন করিডোর (E1 এবং E2) রয়েছে।',
  },
  nodes: [
    {
      id: 'R1',
      name: { en: 'Room 1 (Executive Suite)', bn: 'রুম ১ (এক্সিকিউটিভ স্যুট)' },
      type: 'room',
      x: 100,
      y: 130,
      capacity: 15,
    },
    {
      id: 'R2',
      name: { en: 'Room 2 (Conference Hall)', bn: 'রুম ২ (সম্মেলন কক্ষ)' },
      type: 'room',
      x: 100,
      y: 350,
      capacity: 40,
    },
    {
      id: 'C1',
      name: { en: 'Junction C1 (North Hub)', bn: 'সংযোগস্থল C1 (উত্তর হাব)' },
      type: 'corridor',
      x: 280,
      y: 130,
    },
    {
      id: 'C2',
      name: { en: 'Corridor C2 (Northway)', bn: 'করিডোর C2 (উত্তর পথ)' },
      type: 'corridor',
      x: 480,
      y: 130,
    },
    {
      id: 'C3',
      name: { en: 'Junction C3 (South Hub)', bn: 'সংযোগস্থল C3 (দক্ষিণ হাব)' },
      type: 'corridor',
      x: 280,
      y: 350,
    },
    {
      id: 'C4',
      name: { en: 'Corridor C4 (Southway)', bn: 'করিডোর C4 (দক্ষিণ পথ)' },
      type: 'corridor',
      x: 480,
      y: 350,
    },
    {
      id: 'E1',
      name: { en: 'Exit 1 (North Gate)', bn: 'নির্গমন ১ (উত্তর গেট)' },
      type: 'exit',
      x: 680,
      y: 130,
      capacity: 100,
    },
    {
      id: 'E2',
      name: { en: 'Exit 2 (South Gate)', bn: 'নির্গমন ২ (দক্ষিণ গেট)' },
      type: 'exit',
      x: 680,
      y: 350,
      capacity: 100,
    },
  ],
  edges: [
    { id: 'E-R1-C1', source: 'R1', target: 'C1', cost: 2, label: 'Room 1 Access' },
    { id: 'E-C1-C2', source: 'C1', target: 'C2', cost: 3, label: 'North Corridor' },
    { id: 'E-C2-E1', source: 'C2', target: 'E1', cost: 2, label: 'North Exit Way' },
    { id: 'E-C1-C3', source: 'C1', target: 'C3', cost: 4, label: 'Central Fire Stairs' },
    { id: 'E-R2-C3', source: 'R2', target: 'C3', cost: 2, label: 'Room 2 Access' },
    { id: 'E-C3-C4', source: 'C3', target: 'C4', cost: 3, label: 'South Corridor' },
    { id: 'E-C4-E2', source: 'C4', target: 'E2', cost: 2, label: 'South Exit Way' },
  ],
};

export const HOSPITAL_WING_PRESET: FloorplanData = {
  id: 'hospital-wing',
  title: {
    en: 'Metropolitan Hospital (ICU Wing)',
    bn: 'মেট্রোপলিটন হাসপাতাল (আইসিইউ উইং)',
  },
  description: {
    en: 'High-density multi-wing medical center with Emergency, ICU, Ward A/B, and 3 Fire Exits.',
    bn: 'জরুরি বিভাগ, আইসিইউ এবং ৩টি জরুরি নির্গমন পথ বিশিষ্ট হাসপাতাল ব্যবস্থা।',
  },
  nodes: [
    { id: 'ICU', name: { en: 'Intensive Care Unit', bn: 'ইনটেনসিভ কেয়ার ইউনিট' }, type: 'room', x: 120, y: 100 },
    { id: 'WARDA', name: { en: 'General Ward A', bn: 'সাধারণ ওয়ার্ড ক' }, type: 'room', x: 120, y: 240 },
    { id: 'WARDB', name: { en: 'Pediatric Ward B', bn: 'শিশু ওয়ার্ড খ' }, type: 'room', x: 120, y: 380 },
    { id: 'J_WEST', name: { en: 'West Wing Station', bn: 'পশ্চিম উইং স্টেশন' }, type: 'corridor', x: 280, y: 240 },
    { id: 'J_CENTRAL', name: { en: 'Central Atrium', bn: 'কেন্দ্রীয় অলিন্দ' }, type: 'corridor', x: 440, y: 240 },
    { id: 'J_NORTH', name: { en: 'North Concourse', bn: 'উত্তর কনকোর্স' }, type: 'corridor', x: 440, y: 100 },
    { id: 'J_SOUTH', name: { en: 'South Concourse', bn: 'দক্ষিণ কনকোর্স' }, type: 'corridor', x: 440, y: 380 },
    { id: 'TRIAGE', name: { en: 'Emergency Triage', bn: 'ইমার্জেন্সি ট্রায়াজ' }, type: 'room', x: 280, y: 380 },
    { id: 'EXIT_A', name: { en: 'Exit Alpha (Helipad)', bn: 'নির্গমন আলফা (হ্যালিপ্যাড)' }, type: 'exit', x: 620, y: 100 },
    { id: 'EXIT_B', name: { en: 'Exit Bravo (Ambulance Bay)', bn: 'নির্গমন ব্রাভো (অ্যাম্বুলেন্স বে)' }, type: 'exit', x: 620, y: 240 },
    { id: 'EXIT_C', name: { en: 'Exit Charlie (Ground Ramp)', bn: 'নির্গমন চার্লি (গ্রাউন্ড র‍্যাম্প)' }, type: 'exit', x: 620, y: 380 },
  ],
  edges: [
    { id: 'E-ICU-JW', source: 'ICU', target: 'J_WEST', cost: 4 },
    { id: 'E-ICU-JN', source: 'ICU', target: 'J_NORTH', cost: 5 },
    { id: 'E-WA-JW', source: 'WARDA', target: 'J_WEST', cost: 2 },
    { id: 'E-WB-JW', source: 'WARDB', target: 'J_WEST', cost: 3 },
    { id: 'E-WB-TR', source: 'WARDB', target: 'TRIAGE', cost: 2 },
    { id: 'E-TR-JS', source: 'TRIAGE', target: 'J_SOUTH', cost: 3 },
    { id: 'E-JW-JC', source: 'J_WEST', target: 'J_CENTRAL', cost: 3 },
    { id: 'E-JN-JC', source: 'J_NORTH', target: 'J_CENTRAL', cost: 3 },
    { id: 'E-JS-JC', source: 'J_SOUTH', target: 'J_CENTRAL', cost: 3 },
    { id: 'E-JN-EA', source: 'J_NORTH', target: 'EXIT_A', cost: 3 },
    { id: 'E-JC-EB', source: 'J_CENTRAL', target: 'EXIT_B', cost: 2 },
    { id: 'E-JS-EC', source: 'J_SOUTH', target: 'EXIT_C', cost: 3 },
  ],
};

export const TECH_CAMPUS_PRESET: FloorplanData = {
  id: 'tech-campus',
  title: {
    en: 'Cyber Defense Lab & Datacenter',
    bn: 'সাইবার ডিফেন্স ল্যাব ও ডেটাসেন্টার',
  },
  description: {
    en: 'Secure underground research bunker with Server Hall, Quantum Lab, and Dual Airlock Exits.',
    bn: 'সার্ভার হল, কোয়ান্টাম ল্যাব এবং জরুরি এয়ারলক নির্গমন পথ।',
  },
  nodes: [
    { id: 'SERVER_HALL', name: { en: 'Server Core (Room 01)', bn: 'সার্ভার কোর (কক্ষ ০১)' }, type: 'room', x: 100, y: 150 },
    { id: 'NOC', name: { en: 'Network Ops Center', bn: 'নেটওয়ার্ক অপস সেন্টার' }, type: 'room', x: 100, y: 330 },
    { id: 'SEC_CORRIDOR_1', name: { en: 'Security Cor 1', bn: 'নিরাপত্তা করিডোর ১' }, type: 'corridor', x: 260, y: 150 },
    { id: 'SEC_CORRIDOR_2', name: { en: 'Security Cor 2', bn: 'নিরাপত্তা করিডোর ২' }, type: 'corridor', x: 260, y: 330 },
    { id: 'MAIN_INTERSECTION', name: { en: 'Central Junction', bn: 'প্রধান ইন্টারসেকশন' }, type: 'corridor', x: 400, y: 240 },
    { id: 'QUANTUM_LAB', name: { en: 'Quantum Physics Lab', bn: 'কোয়ান্টাম পদার্থবিজ্ঞান ল্যাব' }, type: 'room', x: 400, y: 100 },
    { id: 'AIRLOCK_EAST', name: { en: 'Blast Exit East', bn: 'ব্লাস্ট নির্গমন পূর্ব' }, type: 'exit', x: 580, y: 180 },
    { id: 'AIRLOCK_WEST', name: { en: 'Emergency Stairwell', bn: 'জরুরি সিঁড়িদ্বার' }, type: 'exit', x: 580, y: 300 },
  ],
  edges: [
    { id: 'E-SH-SC1', source: 'SERVER_HALL', target: 'SEC_CORRIDOR_1', cost: 2 },
    { id: 'E-NOC-SC2', source: 'NOC', target: 'SEC_CORRIDOR_2', cost: 3 },
    { id: 'E-SC1-SC2', source: 'SEC_CORRIDOR_1', target: 'SEC_CORRIDOR_2', cost: 4 },
    { id: 'E-SC1-MI', source: 'SEC_CORRIDOR_1', target: 'MAIN_INTERSECTION', cost: 3 },
    { id: 'E-SC2-MI', source: 'SEC_CORRIDOR_2', target: 'MAIN_INTERSECTION', cost: 3 },
    { id: 'E-QL-MI', source: 'QUANTUM_LAB', target: 'MAIN_INTERSECTION', cost: 2 },
    { id: 'E-MI-AE', source: 'MAIN_INTERSECTION', target: 'AIRLOCK_EAST', cost: 4 },
    { id: 'E-MI-AW', source: 'MAIN_INTERSECTION', target: 'AIRLOCK_WEST', cost: 3 },
    { id: 'E-QL-AE', source: 'QUANTUM_LAB', target: 'AIRLOCK_EAST', cost: 5 },
  ],
};

export const TIE_BREAK_EXITS_PRESET: FloorplanData = {
  id: 'tie-break-exits',
  title: {
    en: 'Tie-Break Benchmark (Equal Exits)',
    bn: 'টাই-ব্রেক মানদণ্ড (সমান বহির্গমন পথ)',
  },
  description: {
    en: 'Two exits with identical path cost (5). Verified that engine selects E1 over E2 by alphabetical tie-breaker.',
    bn: 'উভয় বহির্গমনের দূরত্ব সমান (৫)। অ্যালগরিদম বর্ণানুক্রমিক নিয়মে E1 কে নির্বাচন করে।',
  },
  nodes: [
    { id: 'START', name: { en: 'Start Point', bn: 'শুরুর স্থান' }, type: 'room', x: 120, y: 240 },
    { id: 'E2', name: { en: 'Exit 2 (South Gate)', bn: 'নির্গমন ২' }, type: 'exit', x: 520, y: 360 },
    { id: 'E1', name: { en: 'Exit 1 (North Gate)', bn: 'নির্গমন ১' }, type: 'exit', x: 520, y: 120 },
  ],
  edges: [
    { id: 'e-s-e1', source: 'START', target: 'E1', cost: 5, label: 'North Run (Cost 5)' },
    { id: 'e-s-e2', source: 'START', target: 'E2', cost: 5, label: 'South Run (Cost 5)' },
  ],
};

export const TIE_BREAK_PATHS_PRESET: FloorplanData = {
  id: 'tie-break-paths',
  title: {
    en: 'Tie-Break Benchmark (Equal Paths)',
    bn: 'টাই-ব্রেক মানদণ্ড (সমান রুটসমূহ)',
  },
  description: {
    en: 'Two paths to EXIT with identical cost (4): START->A->EXIT vs START->B->EXIT. Engine selects path via A.',
    bn: 'একই খরচে (৪) দুটি বিকল্প রুট। নোড সিকোয়েন্স অনুযায়ী A রুট বিজয়ী হয়।',
  },
  nodes: [
    { id: 'START', name: { en: 'Start Point', bn: 'শুরুর স্থান' }, type: 'room', x: 120, y: 240 },
    { id: 'A', name: { en: 'Waypoint Alpha', bn: 'ওয়েপয়েন্ট আলফা' }, type: 'corridor', x: 320, y: 140 },
    { id: 'B', name: { en: 'Waypoint Bravo', bn: 'ওয়েপয়েন্ট ব্রাভো' }, type: 'corridor', x: 320, y: 340 },
    { id: 'EXIT', name: { en: 'Final Safe Exit', bn: 'চূড়ান্ত নিরাপদ নির্গমন' }, type: 'exit', x: 520, y: 240 },
  ],
  edges: [
    { id: 'e-s-a', source: 'START', target: 'A', cost: 2, label: 'Path A Seg 1' },
    { id: 'e-a-x', source: 'A', target: 'EXIT', cost: 2, label: 'Path A Seg 2' },
    { id: 'e-s-b', source: 'START', target: 'B', cost: 2, label: 'Path B Seg 1' },
    { id: 'e-b-x', source: 'B', target: 'EXIT', cost: 2, label: 'Path B Seg 2' },
  ],
};

export const PRESETS = [
  CONTEST_BENCHMARK_PRESET,
  HOSPITAL_WING_PRESET,
  TECH_CAMPUS_PRESET,
  TIE_BREAK_EXITS_PRESET,
  TIE_BREAK_PATHS_PRESET,
];
