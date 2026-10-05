import React from 'react';
import { 
  Compass, 
  Flame, 
  DoorClosed, 
  FolderDown, 
  FileUp, 
  Layers, 
  CheckCircle2, 
  Trash2,
  SlidersHorizontal,
  Workflow
} from 'lucide-react';
import type { FloorplanData, HazardState } from '../types/graph';
import { translations, type Language } from '../i18n/translations';
import { PRESETS } from '../lib/presets';
import { playClickSound, playHazardAlertSound } from '../lib/audio';

interface ControlCenterProps {
  floorplan: FloorplanData;
  startNodeId: string;
  onSelectStartNode: (id: string) => void;
  hazards: HazardState;
  onToggleNodeHazard: (nodeId: string) => void;
  onToggleEdgeHazard: (edgeId: string) => void;
  onToggleExitClosed: (exitId: string) => void;
  onClearHazards: () => void;
  onSelectPreset: (preset: FloorplanData) => void;
  onOpenImportModal: () => void;
  onExportJson: () => void;
  onApplyScenario: (scenarioIndex: number) => void;
  language: Language;
}

export const ControlCenter: React.FC<ControlCenterProps> = ({
  floorplan,
  startNodeId,
  onSelectStartNode,
  hazards,
  onToggleNodeHazard,
  onToggleEdgeHazard,
  onToggleExitClosed,
  onClearHazards,
  onSelectPreset,
  onOpenImportModal,
  onExportJson,
  onApplyScenario,
  language,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = React.useState<'controls' | 'scenarios' | 'datasets'>('controls');

  const startCandidates = floorplan.nodes.filter(n => n.type === 'room' || n.type === 'corridor');
  const allExits = floorplan.nodes.filter(n => n.type === 'exit');
  const allRoomsAndJunctions = floorplan.nodes;

  const totalHazards = hazards.blockedNodes.size + hazards.blockedEdges.size + hazards.closedExits.size;

  return (
    <aside className="w-full lg:w-80 xl:w-96 flex flex-col gap-4 bg-slate-900/60 border border-sky-500/20 rounded-2xl p-4 backdrop-blur-md shadow-2xl overflow-hidden">
      {/* Panel Navigation Tabs */}
      <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => { playClickSound(); setActiveTab('controls'); }}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'controls' ? 'bg-sky-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{t.controlCenter}</span>
        </button>
        <button
          onClick={() => { playClickSound(); setActiveTab('scenarios'); }}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'scenarios' ? 'bg-sky-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Workflow className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'দৃশ্যপট' : 'Scenarios'}</span>
        </button>
        <button
          onClick={() => { playClickSound(); setActiveTab('datasets'); }}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'datasets' ? 'bg-sky-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'ডেটাসেট' : 'Data'}</span>
        </button>
      </div>

      {/* Tab 1: Live Controls */}
      {activeTab === 'controls' && (
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
          {/* Starting Origin Selector */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                {t.startLocation}
              </label>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 font-mono border border-cyan-800/40">
                {startNodeId}
              </span>
            </div>

            <select
              value={startNodeId}
              onChange={(e) => {
                playClickSound();
                onSelectStartNode(e.target.value);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-colors"
            >
              {startCandidates.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.id}: {node.name[language] || node.name.en} ({node.type})
                </option>
              ))}
            </select>

            {/* Quick origin selector pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {startCandidates.slice(0, 6).map((node) => {
                const isSelected = node.id === startNodeId;
                const isBlocked = hazards.blockedNodes.has(node.id);
                return (
                  <button
                    key={node.id}
                    onClick={() => {
                      playClickSound();
                      onSelectStartNode(node.id);
                    }}
                    className={`px-2.5 py-1 text-xs rounded-md font-mono transition-all border ${
                      isSelected
                        ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold shadow-md shadow-sky-500/20'
                        : isBlocked
                        ? 'bg-rose-950/40 text-rose-400 border-rose-800/60 line-through'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-sky-500/50'
                    }`}
                  >
                    {node.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hazard Management Card */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                {t.hazardManagement}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                totalHazards > 0 ? 'bg-rose-950 text-rose-300 border border-rose-800/50' : 'bg-slate-900 text-slate-400'
              }`}>
                {totalHazards} {language === 'bn' ? 'সক্রিয়' : 'Active'}
              </span>
            </div>

            {/* 1. Block Nodes / Rooms */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400">
                {t.hazardBlockNode}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {allRoomsAndJunctions.map((n) => {
                  const isBlocked = hazards.blockedNodes.has(n.id);
                  return (
                    <button
                      key={n.id}
                      onClick={() => {
                        playHazardAlertSound();
                        onToggleNodeHazard(n.id);
                      }}
                      className={`px-2 py-1 text-xs rounded-md font-mono border transition-all ${
                        isBlocked
                          ? 'bg-rose-600 text-white border-rose-400 font-bold shadow-sm shadow-rose-600/50'
                          : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-rose-500/50 hover:text-rose-300'
                      }`}
                      title={isBlocked ? t.clickToUnblock : t.clickToBlock}
                    >
                      {n.id} {isBlocked && '⚠️'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Block Corridor Segments */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400">
                {t.hazardBlockEdge}
              </span>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {floorplan.edges.map((e) => {
                  const isBlocked = hazards.blockedEdges.has(e.id);
                  return (
                    <button
                      key={e.id}
                      onClick={() => {
                        playHazardAlertSound();
                        onToggleEdgeHazard(e.id);
                      }}
                      className={`px-2 py-1 text-[11px] rounded-md font-mono border text-left truncate transition-all ${
                        isBlocked
                          ? 'bg-rose-950/90 text-rose-300 border-rose-500 font-semibold'
                          : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:border-rose-500/50 hover:text-slate-200'
                      }`}
                      title={`${e.source} ↔ ${e.target} (cost: ${e.cost})`}
                    >
                      {isBlocked ? '🚫 ' : ''}{e.source}↔{e.target} ({e.cost})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Close Exit Doors */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <DoorClosed className="w-3 h-3 text-amber-400" />
                {t.hazardCloseExit}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {allExits.map((ex) => {
                  const isClosed = hazards.closedExits.has(ex.id);
                  return (
                    <button
                      key={ex.id}
                      onClick={() => {
                        playHazardAlertSound();
                        onToggleExitClosed(ex.id);
                      }}
                      className={`px-2.5 py-1 text-xs rounded-md font-mono border transition-all ${
                        isClosed
                          ? 'bg-amber-600 text-slate-950 border-amber-300 font-bold shadow-md shadow-amber-500/20'
                          : 'bg-slate-900 text-emerald-400 border-slate-800 hover:border-amber-500/50'
                      }`}
                      title={isClosed ? t.clickToOpenExit : t.clickToCloseExit}
                    >
                      {ex.id} {isClosed ? '(SEALED)' : '(OPEN)'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clear All Hazards */}
            {totalHazards > 0 && (
              <button
                onClick={() => {
                  playClickSound();
                  onClearHazards();
                }}
                className="w-full mt-1 py-1.5 rounded-lg bg-slate-900 border border-rose-900/50 text-rose-400 hover:bg-rose-950/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t.clearHazards}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Contest Verification Scenarios (1 to 5) */}
      {activeTab === 'scenarios' && (
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
          <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-800/40 text-[11px] text-sky-300 leading-relaxed">
            {language === 'bn'
              ? 'অফিসিয়াল প্রতিযোগিতার ৫টি যাচাইকরণ দৃশ্যপট এক ক্লিকে পরীক্ষা করুন।'
              : 'Directly verify all 5 official contest problem scenarios with one-click test injections.'}
          </div>

          {[
            { id: 1, title: t.scenario1, desc: t.scenario1Desc, badge: 'Target: Cost 7' },
            { id: 2, title: t.scenario2, desc: t.scenario2Desc, badge: 'Target: Cost 11' },
            { id: 3, title: t.scenario3, desc: t.scenario3Desc, badge: 'Target: No Route' },
            { id: 4, title: t.scenario4, desc: t.scenario4Desc, badge: 'Target: Cost 7' },
            { id: 5, title: t.scenario5, desc: t.scenario5Desc, badge: 'Target: Start Blocked' },
          ].map((sc) => (
            <div
              key={sc.id}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col gap-1.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                  {sc.title}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-sky-400 border border-slate-700">
                  {sc.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {sc.desc}
              </p>
              <button
                onClick={() => {
                  playClickSound();
                  onApplyScenario(sc.id);
                }}
                className="mt-1 w-full py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-slate-950 border border-sky-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t.runScenario}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Dataset Presets & Import / Export */}
      {activeTab === 'datasets' && (
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
          {/* Preset Floorplans */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              {t.presetSection}
            </span>
            <div className="flex flex-col gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    playClickSound();
                    onSelectPreset(preset);
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    floorplan.id === preset.id
                      ? 'bg-sky-500/15 border-sky-400 text-sky-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>{preset.title[language] || preset.title.en}</span>
                    {floorplan.id === preset.id && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500 text-slate-950 font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {preset.description?.[language] || preset.description?.en}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Import / Export JSON buttons */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2.5">
            <button
              onClick={() => {
                playClickSound();
                onOpenImportModal();
              }}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-sky-950/50 border border-slate-700 hover:border-sky-500/50 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <FileUp className="w-4 h-4 text-sky-400" />
              {t.importJson}
            </button>
            <button
              onClick={() => {
                playClickSound();
                onExportJson();
              }}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <FolderDown className="w-4 h-4 text-emerald-400" />
              {t.exportJson}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
