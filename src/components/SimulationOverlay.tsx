import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  LogOut, 
  Volume2, 
  VolumeX, 
  AlertOctagon, 
  RefreshCw, 
  Camera, 
  ShieldCheck,
  Compass
} from 'lucide-react';
import type { CameraViewMode, SimulationPhase } from '../types/simulation';
import type { RouteResult } from '../types/graph';
import type { Language } from '../i18n/translations';
import { playClickSound } from '../lib/audio';

interface SimulationOverlayProps {
  phase: SimulationPhase;
  cameraMode: CameraViewMode;
  onChangeCameraMode: (mode: CameraViewMode) => void;
  onPauseResume: () => void;
  onRestart: () => void;
  onExitSimulation: () => void;
  isAudioOn: boolean;
  onToggleAudio: () => void;
  routeResult: RouteResult;
  traversedCount: number;
  rerouteNotice: string | null;
  language: Language;
}

export const SimulationOverlay: React.FC<SimulationOverlayProps> = ({
  phase,
  cameraMode,
  onChangeCameraMode,
  onPauseResume,
  onRestart,
  onExitSimulation,
  isAudioOn,
  onToggleAudio,
  routeResult,
  traversedCount,
  rerouteNotice,
  language,
}) => {
  const isPaused = phase === 'PAUSED';
  const isRerouting = phase === 'REROUTING';
  const isSuccess = phase === 'SUCCESS';
  const isFailed = phase === 'FAILED';

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
      {/* 1. TOP FLOATING COMMAND BAR */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="flex flex-wrap items-center justify-between gap-3 w-full max-w-4xl mx-auto bg-slate-950/85 backdrop-blur-md border border-sky-500/30 rounded-2xl px-4 py-2.5 shadow-2xl pointer-events-auto"
      >
        {/* Live Simulation Status Indicator */}
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isRerouting ? 'bg-amber-400' : isFailed ? 'bg-rose-500' : 'bg-emerald-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${
              isRerouting ? 'bg-amber-500' : isFailed ? 'bg-rose-600' : 'bg-emerald-500'
            }`}></span>
          </span>
          <div>
            <div className="text-xs font-black tracking-wider uppercase text-slate-100 flex items-center gap-1.5">
              <span>{isRerouting ? (language === 'bn' ? 'দিক পরিবর্তন হচ্ছে...' : 'REROUTING VECTOR') : isPaused ? (language === 'bn' ? 'সিমুলেশন স্থগিত' : 'SIMULATION PAUSED') : (language === 'bn' ? 'সিমুলেশন চলছে' : 'SIMULATION ACTIVE')}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {language === 'bn' ? 'গন্তব্য দ্বার:' : 'Target:'} {routeResult.destinationExitId || 'NONE'} • {language === 'bn' ? 'অতিক্রম:' : 'Traversed:'} {traversedCount}
            </div>
          </div>
        </div>

        {/* Camera Mode Pills */}
        <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs font-semibold">
          {(['FOLLOW', 'ORBIT', 'OVERVIEW'] as CameraViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                playClickSound();
                onChangeCameraMode(mode);
              }}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                cameraMode === mode
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3 h-3" />
              <span>{mode}</span>
            </button>
          ))}
        </div>

        {/* Action Buttons: Pause/Resume, Restart, Sound, Exit */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playClickSound();
              onPauseResume();
            }}
            className={`p-2 rounded-lg border text-xs font-bold transition-all ${
              isPaused
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-slate-700'
            }`}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              playClickSound();
              onRestart();
            }}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
            title="Restart Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              playClickSound();
              onToggleAudio();
            }}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
            title="Toggle Audio"
          >
            {isAudioOn ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={() => {
              playClickSound();
              onExitSimulation();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'bn' ? 'কমান্ড সেন্টারে ফিরুন' : 'Exit Simulation'}</span>
          </button>
        </div>
      </motion.div>

      {/* 2. DYNAMIC REROUTE NOTIFICATION BANNER */}
      <AnimatePresence>
        {rerouteNotice && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="self-center bg-amber-950/95 border-2 border-amber-500 text-amber-200 px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-lg flex items-center gap-3 pointer-events-auto"
          >
            <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
            <div className="text-sm font-bold tracking-wide">
              {rerouteNotice}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. RESULT MODALS (SUCCESS / FAILURE) */}
      <AnimatePresence>
        {/* SUCCESS MODAL */}
        {isSuccess && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="self-center bg-slate-900/95 border border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl w-full max-w-md pointer-events-auto flex flex-col items-center text-center gap-4 border-t-4 border-t-emerald-400"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/40">
                {language === 'bn' ? 'উদ্ধার সফল' : 'MISSION ACCOMPLISHED'}
              </span>
              <h2 className="text-2xl font-black text-slate-100 mt-2 tracking-wide">
                {language === 'bn' ? 'নিরাপদে বহির্গমন সম্পন্ন!' : 'ESCAPE SUCCESSFUL'}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {language === 'bn'
                  ? 'উদ্ধারকারী নিরাপদে নির্ধারিত জরুরি নির্গমন দ্বারে পৌঁছেছেন।'
                  : 'Evacuee safely reached designated open emergency exit gate.'}
              </p>
            </div>

            {/* Performance Metrics Card */}
            <div className="grid grid-cols-3 gap-2 w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-mono">{language === 'bn' ? 'নির্গমন দ্বার' : 'Exit Gate'}</span>
                <span className="text-base font-black text-emerald-400 font-mono">{routeResult.destinationExitId}</span>
              </div>
              <div className="flex flex-col border-x border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono">{language === 'bn' ? 'মোট খরচ' : 'Total Cost'}</span>
                <span className="text-base font-black text-cyan-400 font-mono">{routeResult.totalCost}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-mono">{language === 'bn' ? 'অতিক্রম' : 'Traversed'}</span>
                <span className="text-base font-black text-slate-200 font-mono">{traversedCount}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full mt-2">
              <button
                onClick={() => {
                  playClickSound();
                  onRestart();
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{language === 'bn' ? 'পুনরায় চালান' : 'Run Again'}</span>
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  onExitSimulation();
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
              >
                {language === 'bn' ? 'কমান্ড সেন্টার' : 'Command Deck'}
              </button>
            </div>
          </motion.div>
        )}

        {/* FAILURE MODAL */}
        {isFailed && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="self-center bg-slate-900/95 border border-rose-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl w-full max-w-md pointer-events-auto flex flex-col items-center text-center gap-4 border-t-4 border-t-rose-500"
          >
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/20">
              <AlertOctagon className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-rose-400 font-bold px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-800/40">
                {language === 'bn' ? 'জরুরি পরিস্থিতি' : 'CRITICAL LOCKOUT'}
              </span>
              <h2 className="text-2xl font-black text-slate-100 mt-2 tracking-wide">
                {language === 'bn' ? 'বহির্গমন পথ অবরুদ্ধ!' : 'EVACUATION FAILED'}
              </h2>
              <p className="text-xs text-rose-200/90 mt-1">
                {language === 'bn'
                  ? 'সমস্ত নির্গমন পথ আগুন বা ধ্বংসস্তূপে বন্ধ। কোনো নিরাপদ পথ অবশিষ্ট নেই।'
                  : 'All accessible evacuation paths are severed or sealed. Safe egress is impossible.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full mt-2">
              <button
                onClick={() => {
                  playClickSound();
                  onRestart();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{language === 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'}</span>
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  onExitSimulation();
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
              >
                {language === 'bn' ? 'কমান্ড সেন্টার' : 'Command Deck'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. BOTTOM FLOATING NAVIGATION ADVICE */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="self-center bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 px-4 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 pointer-events-none"
      >
        <Compass className="w-3.5 h-3.5 text-cyan-400" />
        <span>{language === 'bn' ? 'সিমুলেশন চলাকালীন যেকোনো করিডোর বা নোডে ক্লিক করে সরাসরি বিপদ ইনজেক্ট করুন' : 'Click any corridor or room on the map to inject real-time hazards and test dynamic rerouting'}</span>
      </motion.div>
    </div>
  );
};
