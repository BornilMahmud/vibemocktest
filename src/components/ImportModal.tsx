import React from 'react';
import { X, Upload, AlertCircle, CheckCircle, FileCode, Sparkles } from 'lucide-react';
import type { FloorplanData, ValidationResult } from '../types/graph';
import { translations, type Language } from '../i18n/translations';
import { normalizeFloorplan, validateFloorplan } from '../lib/validator';
import { CONTEST_BENCHMARK_PRESET } from '../lib/presets';
import { playClickSound } from '../lib/audio';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadFloorplan: (floorplan: FloorplanData) => void;
  language: Language;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onLoadFloorplan,
  language,
}) => {
  const t = translations[language];
  const [jsonText, setJsonText] = React.useState('');
  const [validation, setValidation] = React.useState<ValidationResult | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleValidateText = (text: string) => {
    setJsonText(text);
    if (!text.trim()) {
      setValidation(null);
      return;
    }
    try {
      const parsed = JSON.parse(text);
      const res = validateFloorplan(parsed);
      setValidation(res);
    } catch (e) {
      setValidation({
        isValid: false,
        errors: [
          {
            messageEn: `Syntax Error: ${(e as Error).message}`,
            messageBn: `JSON সিনট্যাক্স ত্রুটি: ${(e as Error).message}`,
            severity: 'error',
          },
        ],
        warnings: [],
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleValidateText(content);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    playClickSound();
    const formatted = JSON.stringify(CONTEST_BENCHMARK_PRESET, null, 2);
    handleValidateText(formatted);
  };

  const handleConfirmLoad = () => {
    if (!validation?.isValid && (!validation || validation.errors.length > 0)) return;
    try {
      const parsed = JSON.parse(jsonText);
      const normalized = normalizeFloorplan(parsed);
      onLoadFloorplan(normalized);
      onClose();
    } catch {
      // Handled by validation
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-sky-500/30 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-slate-100">
              {t.validationTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar (Upload File + Load Example Template) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>{fileName || t.dragDropJson}</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleLoadSample}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load Sample JSON Schema</span>
          </button>
        </div>

        {/* Raw JSON Input Textarea */}
        <div className="flex-1 flex flex-col gap-1.5 min-h-[200px]">
          <textarea
            value={jsonText}
            onChange={(e) => handleValidateText(e.target.value)}
            placeholder='Paste floorplan JSON here with "nodes" and "edges" ...'
            className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 resize-none"
          />
        </div>

        {/* Validation Result Box */}
        {validation && (
          <div
            className={`p-3 rounded-xl border flex flex-col gap-2 max-h-36 overflow-y-auto text-xs ${
              validation.isValid
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {validation.isValid ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{t.validationPassed}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>{t.validationFailed}</span>
                </>
              )}
            </div>

            {/* Error list */}
            {validation.errors.map((err, i) => (
              <div key={i} className="pl-6 text-[11px] text-rose-300 font-mono">
                • {language === 'bn' ? err.messageBn : err.messageEn}
              </div>
            ))}

            {/* Warning list */}
            {validation.warnings.map((warn, i) => (
              <div key={i} className="pl-6 text-[11px] text-amber-300 font-mono">
                ⚠ {language === 'bn' ? warn.messageBn : warn.messageEn}
              </div>
            ))}
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            {t.closeModal}
          </button>
          <button
            onClick={handleConfirmLoad}
            disabled={!validation?.isValid}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              validation?.isValid
                ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/30 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Floorplan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
