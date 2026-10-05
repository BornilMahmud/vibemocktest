import React from 'react';
import { Info, Keyboard } from 'lucide-react';
import { translations, type Language } from '../i18n/translations';

interface LegendProps {
  language: Language;
}

export const Legend: React.FC<LegendProps> = ({ language }) => {
  const t = translations[language];

  const items = [
    { label: t.legendRoom, color: 'bg-slate-700 border-slate-500' },
    { label: t.legendCorridor, color: 'bg-slate-800 border-slate-600' },
    { label: t.legendExit, color: 'bg-emerald-600 border-emerald-400' },
    { label: t.legendStart, color: 'bg-sky-500 border-sky-300 ring-2 ring-sky-400/40' },
    { label: t.legendActiveRoute, color: 'bg-cyan-400 border-cyan-200' },
    { label: t.legendBlockedNode, color: 'bg-rose-600 border-rose-400' },
    { label: t.legendBlockedCorridor, color: 'bg-rose-950 border-rose-500 border-dashed' },
    { label: t.legendClosedExit, color: 'bg-amber-600 border-amber-300' },
  ];

  return (
    <footer className="w-full bg-slate-950/80 border-t border-sky-500/20 px-4 py-2.5 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
      {/* Legend Token Badges */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <Info className="w-3.5 h-3.5" />
          {t.legendTitle}:
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-[11px]">
              <span className={`w-3 h-3 rounded-full border ${item.color}`}></span>
              <span className="text-slate-300">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Keyboard Shortcuts Guide */}
      <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-400">
        <Keyboard className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300">
          Left Click
        </span>
        <span>Set Origin / Toggle Exit</span>
        <span className="text-slate-600">•</span>
        <span className="font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300">
          Right Click
        </span>
        <span>Toggle Hazard</span>
      </div>
    </footer>
  );
};
