import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { 
  playRouteFoundSound, 
  playHazardAlertSound, 
  playSuccessFanfare, 
  playFailureAlarm, 
  startSiren, 
  stopSiren,
  getSoundEnabled,
  setSoundEnabled 
} from '../lib/audio';
import type { FloorplanData, HazardState } from '../types/graph';
import type { CameraViewMode, SimulationPhase } from '../types/simulation';
import type { Language } from '../i18n/translations';
import { CONTEST_BENCHMARK_PRESET } from '../lib/presets';

interface CinematicProductReelProps {
  isOpen: boolean;
  onClose: () => void;
  // External state manipulators
  onSetFloorplan: (fp: FloorplanData) => void;
  onSetStartNode: (id: string) => void;
  onSetHazards: (hazards: HazardState) => void;
  onSetLanguage: (lang: Language) => void;
  onSetSimulationPhase: (phase: SimulationPhase) => void;
  onSetCameraMode: (mode: CameraViewMode) => void;
  onStartSimulation: () => void;
  onExitSimulation: () => void;
  currentLanguage: Language;
}

interface SceneMarker {
  id: number;
  time: number; // in seconds
  duration: number;
  title: string;
  subtitle: string;
  tag: string;
  setup: (helpers: SceneHelpers) => void;
}

interface SceneHelpers {
  setFloorplan: (fp: FloorplanData) => void;
  setStartNode: (id: string) => void;
  setHazards: (hazards: HazardState) => void;
  setLanguage: (lang: Language) => void;
  setSimulationPhase: (phase: SimulationPhase) => void;
  setCameraMode: (mode: CameraViewMode) => void;
  startSim: () => void;
  exitSim: () => void;
  audioOn: boolean;
}

export const CinematicProductReel: React.FC<CinematicProductReelProps> = ({
  isOpen,
  onClose,
  onSetFloorplan,
  onSetStartNode,
  onSetHazards,
  onSetLanguage,
  onSetSimulationPhase,
  onSetCameraMode,
  onStartSimulation,
  onExitSimulation,
  currentLanguage,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(getSoundEnabled());
  const [activeSceneIdx, setActiveSceneIdx] = useState<number>(0);
  const playbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const TOTAL_DURATION = 90; // 90 seconds presentation

  const scenes: SceneMarker[] = [
    {
      id: 1,
      time: 0,
      duration: 5,
      title: "SMART ESCAPE",
      subtitle: "INTERACTIVE EVACUATION ROUTE SIMULATOR",
      tag: "01 // OPENING HOOK",
      setup: (h) => {
        h.exitSim();
        h.setFloorplan(CONTEST_BENCHMARK_PRESET);
        h.setStartNode('R1');
        h.setHazards({ blockedNodes: new Set(), blockedEdges: new Set(), closedExits: new Set() });
        h.setCameraMode('OVERVIEW');
        stopSiren();
      }
    },
    {
      id: 2,
      time: 5,
      duration: 5,
      title: "THE PROBLEM",
      subtitle: "One building. Multiple paths. One safest escape.",
      tag: "02 // PROBLEM STATEMENT",
      setup: (h) => {
        h.setCameraMode('OVERVIEW');
        if (h.audioOn) playRouteFoundSound();
      }
    },
    {
      id: 3,
      time: 10,
      duration: 6,
      title: "ORIGIN & CALCULATION",
      subtitle: "Select Room 101 (R1) • Optimal Route: R1 → C1 → C2 → E1 (Cost: 7)",
      tag: "03 // SHORTEST PATH ENGINE",
      setup: (h) => {
        h.setStartNode('R1');
        h.setHazards({ blockedNodes: new Set(), blockedEdges: new Set(), closedExits: new Set() });
        h.setCameraMode('OVERVIEW');
        if (h.audioOn) playRouteFoundSound();
      }
    },
    {
      id: 4,
      time: 16,
      duration: 6,
      title: "ARCHITECTURAL 3D WORLD",
      subtitle: "Every room, corridor, and exit gate is generated directly from building data.",
      tag: "04 // DATA-DRIVEN ENVIRONMENT",
      setup: (h) => {
        h.setCameraMode('ORBIT');
      }
    },
    {
      id: 5,
      time: 22,
      duration: 8,
      title: "HAZARD INJECTION",
      subtitle: "Corridor C2 is blocked! Current escape route is immediately severed.",
      tag: "05 // ROUTE INTERRUPTED",
      setup: (h) => {
        h.setCameraMode('OVERVIEW');
        h.setHazards({ blockedNodes: new Set(['C2']), blockedEdges: new Set(), closedExits: new Set() });
        if (h.audioOn) playHazardAlertSound();
      }
    },
    {
      id: 6,
      time: 30,
      duration: 8,
      title: "INTELLIGENT REROUTING",
      subtitle: "NEW ROUTE SECURED: R1 → C1 → C3 → C4 → E2 (Total Cost: 11)",
      tag: "06 // REAL-TIME RECALCULATION",
      setup: (h) => {
        h.setCameraMode('OVERVIEW');
        if (h.audioOn) playRouteFoundSound();
      }
    },
    {
      id: 7,
      time: 38,
      duration: 7,
      title: "START SIMULATION",
      subtitle: "Evacuation agent launches calmly. Follow camera engages.",
      tag: "07 // 3D TRANSIT INITIALIZATION",
      setup: (h) => {
        h.startSim();
        h.setCameraMode('FOLLOW');
      }
    },
    {
      id: 8,
      time: 45,
      duration: 8,
      title: "DYNAMIC EVACUEE TRANSIT",
      subtitle: "Navigating waypoints across safe corridors • Turning towards Exit Gate E2",
      tag: "08 // CORRIDOR NAVIGATION",
      setup: (h) => {
        h.setCameraMode('FOLLOW');
      }
    },
    {
      id: 9,
      time: 53,
      duration: 7,
      title: "ESCAPE SUCCESSFUL",
      subtitle: "SAFE EXIT REACHED • Exit: E2 • Total Cost: 11 • Fanfare & Calm Lighting",
      tag: "09 // SUCCESS OUTCOME",
      setup: (h) => {
        h.setSimulationPhase('SUCCESS');
        h.setCameraMode('EXIT');
        stopSiren();
        if (h.audioOn) playSuccessFanfare();
      }
    },
    {
      id: 10,
      time: 60,
      duration: 12,
      title: "TRAPPED / FAILURE SCENARIO",
      subtitle: "When all exits are sealed (E1 & E2 closed), agent begins a best-effort traversal.",
      tag: "10 // NO ESCAPE ROUTE EXISTS",
      setup: (h) => {
        h.exitSim();
        h.setStartNode('R1');
        h.setHazards({ blockedNodes: new Set(), blockedEdges: new Set(), closedExits: new Set(['E1', 'E2']) });
        stopSiren();
        setTimeout(() => {
          h.startSim();
          h.setCameraMode('FOLLOW');
        }, 1200);
      }
    },
    {
      id: 11,
      time: 72,
      duration: 6,
      title: "DEAD END // REALIZATION",
      subtitle: "Agent reaches C4 • Route extinguishes • SIREN ON • Rapid red emergency strobes pulse.",
      tag: "11 // FAILURE ACTIVATION",
      setup: (h) => {
        h.setSimulationPhase('TRAPPED');
        h.setCameraMode('TRAPPED');
        if (h.audioOn) {
          startSiren();
          setTimeout(() => stopSiren(), 4000);
        }
      }
    },
    {
      id: 12,
      time: 78,
      duration: 6,
      title: "EVACUATION FAILED OVERLAY",
      subtitle: "Last Position: Junction C4 • Exits Available: 0 • Serious tactical assessment.",
      tag: "12 // TELEMETRY & DIAGNOSTICS",
      setup: (h) => {
        h.setSimulationPhase('FAILED');
        h.setCameraMode('FAILED');
        if (h.audioOn) playFailureAlarm();
      }
    },
    {
      id: 13,
      time: 84,
      duration: 4,
      title: "BILINGUAL COMMAND CENTER",
      subtitle: "Full operational fidelity in English and বাংলা • Instant real-time toggle.",
      tag: "13 // GLOBAL ACCESSIBILITY",
      setup: (h) => {
        h.setLanguage(currentLanguage === 'en' ? 'bn' : 'en');
        h.exitSim();
        h.setCameraMode('OVERVIEW');
        setTimeout(() => h.setLanguage('en'), 2000);
      }
    },
    {
      id: 14,
      time: 88,
      duration: 2,
      title: "SMART ESCAPE",
      subtitle: "Build. Calculate. Adapt. Escape. • Interactive Evacuation Route Simulator",
      tag: "14 // FINAL HERO FRAME",
      setup: (h) => {
        h.setCameraMode('OVERVIEW');
        stopSiren();
        if (h.audioOn) playRouteFoundSound();
      }
    }
  ];

  // Trigger scene setup when currentTime crosses into a scene
  const lastTriggeredSceneRef = useRef<number>(-1);
  useEffect(() => {
    if (!isOpen) return;

    // Find current scene
    const sceneIdx = scenes.findIndex((sc, idx) => {
      const nextTime = scenes[idx + 1]?.time ?? TOTAL_DURATION;
      return currentTime >= sc.time && currentTime < nextTime;
    });

    if (sceneIdx !== -1 && sceneIdx !== lastTriggeredSceneRef.current) {
      lastTriggeredSceneRef.current = sceneIdx;
      setActiveSceneIdx(sceneIdx);
      const scene = scenes[sceneIdx];
      scene.setup({
        setFloorplan: onSetFloorplan,
        setStartNode: onSetStartNode,
        setHazards: onSetHazards,
        setLanguage: onSetLanguage,
        setSimulationPhase: onSetSimulationPhase,
        setCameraMode: onSetCameraMode,
        startSim: onStartSimulation,
        exitSim: onExitSimulation,
        audioOn: audioEnabled
      });
    }
  }, [currentTime, isOpen, audioEnabled]);

  // Master Playback Timer
  useEffect(() => {
    if (!isOpen || !isPlaying) {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
      return;
    }

    playbackIntervalRef.current = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= TOTAL_DURATION) {
          setIsPlaying(false);
          return TOTAL_DURATION;
        }
        return prev + 0.25;
      });
    }, 250);

    return () => {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    };
  }, [isOpen, isPlaying]);

  // Cleanup on close
  const handleClose = () => {
    stopSiren();
    onExitSimulation();
    onClose();
  };

  const handleRestart = () => {
    stopSiren();
    setCurrentTime(0);
    lastTriggeredSceneRef.current = -1;
    setIsPlaying(true);
  };

  const handleSeek = (targetTime: number) => {
    setCurrentTime(targetTime);
    lastTriggeredSceneRef.current = -1;
  };

  const currentScene = scenes[activeSceneIdx] || scenes[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between overflow-hidden">
      {/* 1. TOP CINEMATIC 2.39:1 LETTERBOX BAR */}
      <div className="w-full bg-black h-16 sm:h-20 border-b border-sky-500/20 px-4 sm:px-8 py-3 flex items-center justify-between pointer-events-auto backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold tracking-widest animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>REC ● 4K 60FPS</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-cyan-400 font-bold">SMART ESCAPE</span>
            <span>// PRODUCT SHOWCASE REEL</span>
          </div>
        </div>

        {/* Scene Chapter Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono tracking-widest text-sky-400 font-bold px-3 py-1 rounded-full bg-sky-950/80 border border-sky-500/30">
            {currentScene.tag}
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          title="Exit Reel Mode"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. CENTER FLOATING CINEMATIC SUBTITLE OVERLAY */}
      <div className="self-center w-full max-w-4xl px-4 flex flex-col items-center text-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="bg-slate-950/85 backdrop-blur-md border border-sky-500/30 rounded-2xl px-6 py-4 shadow-2xl pointer-events-auto max-w-2xl"
          >
            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-100 to-emerald-300 tracking-wider">
              {currentScene.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium leading-relaxed">
              {currentScene.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. BOTTOM CINEMATIC 2.39:1 LETTERBOX BAR & CONTROLLER */}
      <div className="w-full bg-black/95 border-t border-sky-500/20 px-4 sm:px-8 py-3 flex flex-col gap-2 pointer-events-auto backdrop-blur-xl">
        {/* Timeline Progress Scrubber with 14 Chapter Markers */}
        <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
          <div 
            className="h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 transition-all duration-200"
            style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }}
          />
          {/* Chapter Tick Marks */}
          {scenes.map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleSeek(sc.time)}
              title={`${sc.tag}: ${sc.title}`}
              style={{ left: `${(sc.time / TOTAL_DURATION) * 100}%` }}
              className="absolute top-0 bottom-0 w-0.5 bg-slate-500 hover:bg-sky-400 hover:w-1 transition-all z-10"
            />
          ))}
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Playback Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-all shadow-md shadow-sky-500/30"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={handleRestart}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Restart Reel"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const next = !audioEnabled;
                setSoundEnabled(next);
                setAudioEnabled(next);
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title={audioEnabled ? "Mute Audio" : "Unmute Audio"}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Timecode Display */}
            <div className="text-slate-300 font-mono tracking-widest pl-2">
              <span>{Math.floor(currentTime / 60).toString().padStart(2, '0')}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</span>
              <span className="text-slate-500"> / 01:30</span>
            </div>
          </div>

          {/* Quick Scene Selector Jumpers */}
          <div className="hidden lg:flex items-center gap-1">
            {scenes.slice(0, 10).map((sc, i) => (
              <button
                key={sc.id}
                onClick={() => handleSeek(sc.time)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                  activeSceneIdx === i
                    ? 'bg-sky-500 text-slate-950 font-black'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {sc.id}
              </button>
            ))}
          </div>

          {/* Tagline reminder */}
          <div className="hidden sm:block text-slate-400 italic text-[11px]">
            "See the building. Detect the hazard. Calculate. Adapt. Escape."
          </div>
        </div>
      </div>
    </div>
  );
};
