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
  DoorOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Activity
} from 'lucide-react';
import type { RouteResult } from '../types/graph';
import type { SimulationPhase } from '../types/simulation';
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
  simulationPhase?: SimulationPhase;
  activeHazardsCount?: number;
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
  simulationPhase = 'IDLE',
  activeHazardsCount = 0,
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
  const [isExplainOpen, setIsExplainOpen] = React.useState(true);

  // Operational System State Machine Indicator
  const systemState = React.useMemo(() => {
    if (simulationPhase === 'SUCCESS') {
      return { label: t.sysStateExitReached, color: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50', dot: 'bg-emerald-400' };
    }
    if (simulationPhase === 'REROUTING') {
      return { label: t.sysStateRerouting, color: 'text-amber-400 bg-amber-950/80 border-amber-500/50', dot: 'bg-amber-400 animate-ping' };
    }
    if (simulationPhase === 'FAILED' || routeResult.status === 'NO_ROUTE_AVAILABLE' || routeResult.status === 'START_LOCATION_BLOCKED') {
      return { label: t.sysStateFailed, color: 'text-rose-400 bg-rose-950/80 border-rose-500/50', dot: 'bg-rose-500' };
    }
    if (simulationPhase === 'RUNNING') {
      return { label: language === 'bn' ? 'সিমুলেশন চলছে...' : 'SIMULATING ESCAPE', color: 'text-sky-400 bg-sky-950/80 border-sky-500/50', dot: 'bg-sky-400 animate-pulse' };
    }
    if (activeHazardsCount > 0) {
      return { label: t.sysStateMonitoring, color: 'text-amber-300 bg-amber-950/60 border-amber-500/40', dot: 'bg-amber-400' };
    }
    if (isFound) {
      return { label: t.sysStateRouteFound, color: 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40', dot: 'bg-emerald-400' };
    }
    return { label: t.sysStateArmed, color: 'text-cyan-300 bg-cyan-950/60 border-cyan-500/40', dot: 'bg-cyan-400' };
  }, [simulationPhase, routeResult.status, activeHazardsCount, isFound, language, t]);

  return (
    <aside className="w-full lg:w-80 xl:w-96 flex flex-col gap-3.5 bg-slate-900/60 border border-sky-500/20 rounded-2xl p-4 backdrop-blur-md shadow-2xl overflow-y-auto max-h-[calc(100vh-100px)]">
      {/* 0. LIVE OPERATIONAL SYSTEM STATE */}
      <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center justify-between shadow-sm ${systemState.color}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${systemState.dot}`} />
          <span className="tracking-wide uppercase">{systemState.label}</span>
        </div>
        <Activity className="w-3.5 h-3.5 opacity-80" />
      </div>

      {/* 1. HERO ROUTE STATUS BANNER */}
      <div className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all ${statusConfig.style}`}>
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
          <p className="text-xs text-rose-200/90 leading-relaxed font-sans">
            {t.startBlockedDesc}
          </p>
        )}
        {routeResult.status === 'NO_ROUTE_AVAILABLE' && (
          <p className="text-xs text-amber-200/90 leading-relaxed font-sans">
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
              {routeResult.path.length} ({routeResult.path.length - 1} {t.corridorsCount})
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

      {/* 3. EXPLAINABILITY ENGINE: "WHY THIS ROUTE?" (Judge Inspectable Panel) */}
      {isFound && (
        <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3.5 flex flex-col gap-2.5 shadow-lg">
          <div 
            onClick={() => setIsExplainOpen(!isExplainOpen)}
            className="flex items-center justify-between cursor-pointer select-none border-b border-slate-800/80 pb-2"
          >
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              {t.whyThisRoute}
            </span>
            {isExplainOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>

          {isExplainOpen && (
            <div className="flex flex-col gap-2.5 text-xs">
              {/* Decision Basis Summary */}
              <div className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-200 leading-relaxed font-sans">
                {routeResult.explanation?.[language] || routeResult.explanation?.en || (
                  language === 'bn' 
                    ? `সর্বনিম্ন মোট খরচে নির্গমন পথ নিশ্চিত করতে ${routeResult.destinationExitId} নির্বাচিত হয়েছে।`
                    : `Selected ${routeResult.destinationExitId} as the lowest-cost reachable egress point.`
                )}
              </div>

              {/* Corridor Transit Breakdown Table */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t.costBreakdown}
                </span>
                <div className="bg-slate-900/90 rounded-lg border border-slate-800 p-2 flex flex-col gap-1 font-mono text-[11px]">
                  {routeResult.steps.map((step, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-300 py-0.5 border-b border-slate-800/50 last:border-none">
                      <span>{step.fromNode.id} → {step.toNode.id}</span>
                      <span className="text-cyan-400 font-bold">+{step.edgeCost}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800">
                    <span className="uppercase text-[10px] tracking-wider">{language === 'bn' ? 'মোট খরচ' : 'TOTAL COST'}</span>
                    <span className="text-sm">{routeResult.totalCost}</span>
                  </div>
                </div>
              </div>

              {/* Alternative Exits Evaluated Matrix */}
              {routeResult.exitEvaluations && routeResult.exitEvaluations.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t.alternativeExitsChecked}
                  </span>
                  <div className="grid grid-cols-1 gap-1">
                    {routeResult.exitEvaluations.map((ev) => {
                      const isSelected = ev.exitId === routeResult.destinationExitId;
                      return (
                        <div
                          key={ev.exitId}
                          className={`px-2 py-1.5 rounded-md text-[11px] flex items-center justify-between gap-2 font-mono border ${
                            isSelected
                              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                              : ev.status === 'SEALED'
                              ? 'bg-amber-950/40 border-amber-800/40 text-amber-400'
                              : ev.status === 'REACHABLE_HIGHER_COST'
                              ? 'bg-slate-900 border-slate-800 text-slate-300'
                              : 'bg-rose-950/40 border-rose-800/40 text-rose-400'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                            <span className="font-bold flex-shrink-0">{ev.exitId}</span>
                            <span className="text-[9px] opacity-75 truncate">
                              {ev.exitName[language] || ev.exitName.en}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold flex-shrink-0 text-right">
                            {isSelected 
                              ? `${t.exitOptimalLabel} (${ev.cost})` 
                              : ev.status === 'SEALED' 
                              ? t.exitSealedLabel 
                              : ev.status === 'REACHABLE_HIGHER_COST'
                              ? `Cost ${ev.cost}`
                              : t.exitUnreachableLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. OPTIMAL PATH SEQUENCE CHAIN */}
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

      {/* 5. EVACUATION SIMULATOR CONTROLS (Always accessible) */}
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
                : isFound
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/30'
                : 'bg-amber-500/90 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? t.pauseSimulation : isFound ? t.playSimulation : t.simulateTrapped}</span>
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
            {simulationPhase === 'TRAPPED'
              ? t.trappedStatus
              : simulationPhase === 'FAILED'
              ? t.sysStateFailed
              : simulationStepIndex === (routeResult.path.length || 1) - 1 && isFound
              ? t.simSafe
              : isSimulating
              ? t.simEvacuating
              : isFound
              ? t.sysStateRouteFound
              : t.trappedDesc}
          </span>
          <span className="font-mono text-cyan-400 font-bold">
            {simulationStepIndex + 1} / {Math.max(1, routeResult.path.length)}
          </span>
        </div>
      </div>

      {/* 6. STEP-BY-STEP TURN-BY-TURN GUIDANCE */}
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

