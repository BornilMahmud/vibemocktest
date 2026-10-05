import React from 'react';
import { ShieldCheck, Check, Sparkles } from 'lucide-react';
import { translations, type Language } from '../i18n/translations';
import { playClickSound, playRouteFoundSound } from '../lib/audio';

interface InitialLoaderProps {
  onComplete: () => void;
  language: Language;
}

export const InitialLoader: React.FC<InitialLoaderProps> = ({ onComplete, language }) => {
  const t = translations[language];
  const [step, setStep] = React.useState<number>(0);

  React.useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 250);
    const t2 = setTimeout(() => setStep(2), 550);
    const t3 = setTimeout(() => setStep(3), 850);
    const t4 = setTimeout(() => setStep(4), 1150);
    const t5 = setTimeout(() => {
      setStep(5);
      playRouteFoundSound();
    }, 1450);
    const t6 = setTimeout(() => {
      onComplete();
    }, 1900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [onComplete]);

  const steps = [
    t.graphLoadedStep,
    t.corridorsMappedStep,
    t.exitsIdentifiedStep,
    t.routingReadyStep,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050811] text-slate-100 p-6 select-none">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900/90 border border-sky-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col gap-5">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-400">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-widest text-slate-100 uppercase">
                {t.appName}
              </h1>
              <p className="text-[10px] text-cyan-400 font-mono tracking-wider">
                {t.initializingBuilding}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onComplete();
            }}
            className="text-[10px] font-mono text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800 border border-slate-700 transition-colors"
          >
            {t.skipIntro}
          </button>
        </div>

        {/* Staggered Checklist */}
        <div className="flex flex-col gap-2.5 py-1">
          {steps.map((st, idx) => {
            const isDone = step > idx;
            return (
              <div
                key={idx}
                className={`flex items-center gap-2.5 text-xs font-mono transition-all duration-300 ${
                  isDone ? 'text-emerald-300 opacity-100' : 'text-slate-600 opacity-40'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    isDone
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>{st}</span>
              </div>
            );
          })}
        </div>

        {/* Final System Ready Banner */}
        <div
          className={`p-3 rounded-xl border text-center font-mono font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
            step >= 5
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-lg shadow-emerald-500/20 scale-100'
              : 'bg-slate-950/40 border-slate-800 text-slate-600 scale-95 opacity-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{t.systemReadyStep}</span>
        </div>
      </div>
    </div>
  );
};
