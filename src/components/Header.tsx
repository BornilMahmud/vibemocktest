import React from 'react';
import { ShieldAlert, Volume2, VolumeX, RotateCcw, AlertTriangle, Radio, Box, Map } from 'lucide-react';
import { translations, type Language } from '../i18n/translations';
import { getSoundEnabled, isSirenActive, playClickSound, setSoundEnabled, toggleSiren } from '../lib/audio';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onReset: () => void;
  routeStatus: string;
  viewMode: '3d' | '2d';
  onToggleViewMode: (mode: '3d' | '2d') => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  onReset,
  routeStatus,
  viewMode,
  onToggleViewMode,
}) => {
  const t = translations[language];
  const [soundOn, setSoundOn] = React.useState(getSoundEnabled());
  const [sirenOn, setSirenOn] = React.useState(isSirenActive());

  const handleSoundToggle = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) playClickSound();
  };

  const handleSirenToggle = () => {
    const active = toggleSiren();
    setSirenOn(active);
  };

  const isAlarming = routeStatus === 'START_LOCATION_BLOCKED' || routeStatus === 'NO_ROUTE_AVAILABLE';

  return (
    <header className="w-full border-b border-sky-500/20 bg-slate-950/80 backdrop-blur-md px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-xl">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 text-slate-950 shadow-lg shadow-sky-500/30">
          <ShieldAlert className="w-6 h-6 text-slate-950" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-200 to-emerald-400">
              {t.appName}
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-sky-950/90 text-sky-400 border border-sky-500/30 flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
              v2.4 OPS
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            {t.appSubtitle}
          </p>
        </div>
      </div>

      {/* Center Operational State Pill */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs">
        <span className={`w-2 h-2 rounded-full ${isAlarming ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`}></span>
        <span className="text-slate-300 font-medium tracking-wide">
          {t.badgeLive}
        </span>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Siren Alarm Button */}
        <button
          onClick={handleSirenToggle}
          title={sirenOn ? t.sirenOn : t.sirenOff}
          aria-label="Toggle Siren"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            sirenOn
              ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-600/50'
              : 'bg-slate-900/80 text-rose-400 border-rose-900/40 hover:bg-rose-950/30'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{sirenOn ? t.sirenOn : t.sirenOff}</span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={handleSoundToggle}
          title={soundOn ? t.soundOn : t.soundOff}
          aria-label="Toggle Audio Feedback"
          className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-sky-400 hover:border-sky-500/40 transition-colors"
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* 3D / 2D View Switch */}
        <div className="flex items-center rounded-lg p-0.5 bg-slate-900 border border-slate-800" role="group" aria-label="View Mode">
          <button
            onClick={() => {
              playClickSound();
              onToggleViewMode('3d');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
              viewMode === '3d'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="3D Tactical Command Deck"
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D</span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              onToggleViewMode('2d');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
              viewMode === '2d'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="2D Blueprint Floorplan"
          >
            <Map className="w-3.5 h-3.5" />
            <span>2D</span>
          </button>
        </div>

        {/* Language Switch */}
        <div className="flex items-center rounded-lg p-0.5 bg-slate-900 border border-slate-800" role="group" aria-label="Language Selector">
          <button
            onClick={() => {
              playClickSound();
              onLanguageChange('en');
            }}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
              language === 'en'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => {
              playClickSound();
              onLanguageChange('bn');
            }}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
              language === 'bn'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            বাংলা
          </button>
        </div>

        {/* Reset State */}
        <button
          onClick={() => {
            playClickSound();
            onReset();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-rose-500/40 hover:bg-rose-950/20 transition-all"
          title={t.resetAll}
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">{t.resetAll}</span>
        </button>
      </div>
    </header>
  );
};
