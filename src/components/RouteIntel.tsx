import React from 'react';
import { 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle, 
  HelpCircle, 
  ArrowRight, 
  Footprints, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Timer, 
  Gauge, 
  DoorOpen 
} from 'lucide-react';
import type { RouteResult } from '../types/graph';
import { translations, type Language } from '../i18n/translations';
import { playClickSound } from '../lib/audio';

interface RouteIntelProps {
  routeResult: RouteResult;
  simulationStepIndex: number;
  isSimulating: boolean;
  onToggleSimulate: () => void;
  onStepSimulate: () => void;
  onResetSimulate: () => void;
  simulationSpeed: number;
  onChangeSpeed: (spd: number) => void;
  language: Language;
}

export const RouteIntel: React.FC<RouteIntelProps> = ({
  routeResult,
  simulationStepIndex,
  isSimulating,
  onToggleSimulate,
  onStepSimulate,
  onResetSimulate,
  simulationSpeed,
  onChangeSpeed,
  language,
}) => {
  const t = translations[language];

  // Helper status config
  const statusConfig = {
    OPTIMAL_ROUTE_FOUND: {
      title: t.statusOptimal,
      icon: CheckCircle2,
      style: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
      badgeBg: 'bg-emerald-500 text-slate-950',
    },
    START_LOCATION_BLOCKED: {
      title: t.statusStartBlocked,
      icon: AlertOctagon,
      style: 'bg-rose-950/60 border-rose-500/40 text-rose-300',
      badgeBg: 'bg-rose-600 text-white',
    },
    NO_ROUTE_AVAILABLE: {
      title: t.statusNoRoute,
      icon: AlertTriangle,
      style: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
      badgeBg: 'bg-amber-500 text-slate-950',
    },
    INVALID_DATASET: {
      title: t.statusInvalid,
      icon: HelpCircle,
      style: 'bg-red-950/60 border-red-500/40 text-red-300',
      badgeBg: 'bg-red-600 text-white',
    },
  }[routeResult.status];

  const StatusIcon = statusConfig.icon;
  const isFound = routeResult.status === 'OPTIMAL_ROUTE_FOUND';

  return (
    <aside className="w-full lg:w-80 xl:w-96 flex flex-col gap-4 bg-slate-900/60 border border-sky-500/20 rounded-2xl p-4 backdrop-blur-md shadow-2xl overflow-y-auto max-h-[calc(100vh-100px)]">
      {/* 1. HERO ROUTE STATUS BANNER */}
      <div className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${statusConfig.style}`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-950/60">
            {t.routeStatus}
          </span>
          <StatusIcon className="w-5 h-5 animate-pulse" />
        </div>
        <div className="text-base font-black tracking-wide">
          {statusConfig.title}
        </div>
        {routeResult.status === 'START_LOCATION_BLOCKED' && (
          <p className="text-xs text-rose-200/90 leading-relaxed">
            {t.startBlockedDesc}
          </p>
        )}
        {routeResult.status === 'NO_ROUTE_AVAILABLE' && (
          <p className="text-xs text-amber-200/90 leading-relaxed">
            {t.noRouteDesc}
          </p>
        )}
      </div>

      {/* 2. CORE METRICS GRID */}
      {isFound && (
        <div className="grid grid-cols-2 gap-2.5">
          {/* Destination Exit */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <DoorOpen className="w-3 h-3 text-emerald-400" />
              {t.optimalExit}
            </span>
            <div className="text-lg font-black text-emerald-400 font-mono">
              {routeResult.destinationExitId}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {routeResult.destinationExit?.name[language] || routeResult.destinationExit?.name.en}
            </div>
          </div>

          {/* Total Transit Cost */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Gauge className="w-3 h-3 text-cyan-400" />
              {t.totalCost}
            </span>
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 font-mono">
              {routeResult.totalCost}
            </div>
            <div className="text-[10px] text-slate-400">
              {t.costUnits}
            </div>
          </div>

          {/* Waypoints Count */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">{t.totalSteps}</span>
            <span className="text-xs font-mono font-bold text-slate-200">
              {routeResult.path.length}
            </span>
          </div>

          {/* Search Latency */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Timer className="w-3 h-3 text-slate-400" />
              {t.calcLatency}
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {routeResult.computationTimeMs.toFixed(2)} ms
            </span>
          </div>
        </div>
      )}

      {/* 3. OPTIMAL PATH SEQUENCE CHAIN */}
      {isFound && (
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col gap-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <Footprints className="w-3.5 h-3.5 text-cyan-400" />
            {t.pathSequence}
          </span>
          <div className="flex flex-wrap items-center gap-1.5 py-1">
            {routeResult.path.map((nodeId, idx) => {
              const isStart = idx === 0;
              const isEnd = idx === routeResult.path.length - 1;
              const isCurrentSim = idx === simulationStepIndex;

              return (
                <React.Fragment key={nodeId}>
                  <div
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1 transition-all ${
                      isCurrentSim
                        ? 'bg-emerald-400 text-slate-950 scale-110 shadow-lg shadow-emerald-400/50'
                        : isStart
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50'
                        : isEnd
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                        : 'bg-slate-900 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span>{nodeId}</span>
                  </div>
                  {idx < routeResult.path.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. EVACUATION SIMULATOR CONTROLS */}
      {isFound && (
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Play className="w-3 h-3 text-emerald-400" />
              {t.simulation}
            </span>
            {/* Speed toggle pills */}
            <div className="flex items-center gap-1 text-[10px] font-mono">
              {[1, 2, 4].map(spd => (
                <button
                  key={spd}
                  onClick={() => onChangeSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded border transition-colors ${
                    simulationSpeed === spd
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playClickSound();
                onToggleSimulate();
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isSimulating
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/30'
              }`}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isSimulating ? t.pauseSimulation : t.playSimulation}</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                onStepSimulate();
              }}
              className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-sky-500/50 text-slate-300 hover:text-white transition-colors"
              title={t.stepForward}
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                playClickSound();
                onResetSimulate();
              }}
              className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white transition-colors"
              title={t.resetSimulation}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Simulation Progress Status */}
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
            <span>
              {simulationStepIndex === routeResult.path.length - 1
                ? t.simSafe
                : t.simEvacuating}
            </span>
            <span className="font-mono text-cyan-400 font-bold">
              {simulationStepIndex + 1} / {routeResult.path.length}
            </span>
          </div>
        </div>
      )}

      {/* 5. STEP-BY-STEP TURN-BY-TURN GUIDANCE */}
      {isFound && routeResult.steps.length > 0 && (
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {t.stepByStepTurn}
          </span>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            {routeResult.steps.map((step, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 text-xs flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-950 text-sky-400 font-mono text-[10px] font-bold flex items-center justify-center border border-slate-800">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-mono font-bold text-slate-200">
                      {step.fromNode.id} → {step.toNode.id}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {step.toNode.name[language] || step.toNode.name.en}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono text-cyan-300 font-bold">
                    +{step.edgeCost}
                  </span>
                  <div className="text-[9px] text-slate-400 font-mono">
                    (cum: {step.cumulativeCost})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
