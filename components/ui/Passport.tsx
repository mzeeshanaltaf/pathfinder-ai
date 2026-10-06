'use client';

import { useState } from 'react';
import { requestTravel } from '@/components/player/playerState';
import { getPhase, PHASE_IDS, trackPhases, type PhaseId } from '@/data/roadmap';
import { GEM_COLORS, TRACK_COLORS } from '@/lib/palette';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';
import { BadgeStamp, CloseButton, INK, ProgressRing, resumeExplore, TrackBadge, usePhaseGems, useTotals } from './kit';

const TRUNK: PhaseId[] = ['harbor', 'code-village', 'math-mountain', 'ml-meadow', 'fork'];
const COLUMNS: { title: string; track: 'common' | 'developer' | 'engineer'; ids: PhaseId[] }[] = [
  { title: 'Common trunk', track: 'common', ids: TRUNK },
  { title: 'AI Developer', track: 'developer', ids: trackPhases('developer').map((p) => p.id) },
  { title: 'AI Engineer', track: 'engineer', ids: trackPhases('engineer').map((p) => p.id) },
];

/** The Skill Passport: a skill-tree overview of every island, with fast travel. */
export default function Passport() {
  const mode = useUi((s) => s.mode);
  if (mode !== 'passport') return null;
  return <PassportBook />;
}

function PassportBook() {
  const current = useUi((s) => s.currentIsland);
  const [selected, setSelected] = useState<PhaseId | null>(current);
  const { gems, gemTotal, badges, badgeTotal } = useTotals();
  const visited = useProgress((s) => PHASE_IDS.filter((id) => s.visited[id]).length);
  const built = useProgress((s) => PHASE_IDS.filter((id) => getPhase(id).project && s.projects[getPhase(id).project!.id]).length);
  const projectTotal = PHASE_IDS.filter((id) => getPhase(id).project).length;

  return (
    <div
      className="fixed inset-0 z-30 flex items-stretch justify-center bg-[#3d3452]/35 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={resumeExplore}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Skill Passport"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-3xl min-w-0 flex-col overflow-hidden bg-[#fdf6e3] sm:h-auto sm:max-h-[92vh] sm:rounded-3xl sm:border-4"
        style={{ borderColor: INK, color: INK, boxShadow: `0 8px 0 ${INK}` }}
      >
        <header
          className="flex items-start gap-3 border-b-4 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-3"
          style={{ background: TRACK_COLORS.meta.light, borderColor: INK }}
        >
          <span className="text-3xl" aria-hidden>
            📖
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl leading-tight font-extrabold">Skill Passport</h2>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs font-bold">
              <span>
                💎 {gems}/{gemTotal} gems
              </span>
              <span>
                🏅 {badges}/{badgeTotal} badges
              </span>
              <span>
                🛠 {built}/{projectTotal} projects
              </span>
              <span>
                🗺 {visited}/{PHASE_IDS.length} islands
              </span>
            </div>
          </div>
          <CloseButton onClick={resumeExplore} />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4" style={{ touchAction: 'pan-y' }}>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {COLUMNS.map((col) => (
              <section key={col.title} className="flex min-w-0 flex-col items-center">
                <h3
                  className="mb-2 w-full rounded-full border-2 px-1 py-0.5 text-center text-[11px] font-extrabold sm:text-xs"
                  style={{ background: TRACK_COLORS[col.track].light, borderColor: TRACK_COLORS[col.track].dark }}
                >
                  {col.title}
                </h3>
                {col.ids.map((id, i) => (
                  <div key={id} className="flex w-full flex-col items-center">
                    {i > 0 && <span className="h-3 w-1 rounded-full" style={{ background: TRACK_COLORS[col.track].dark }} aria-hidden />}
                    <Node id={id} selected={selected === id} here={current === id} onSelect={setSelected} />
                  </div>
                ))}
              </section>
            ))}
          </div>
          <div className="mt-3 flex flex-col items-center">
            <span className="mb-1 text-lg font-black" aria-hidden>
              ↓ ↓
            </span>
            <div className="w-1/3 min-w-28">
              <Node id="summit" selected={selected === 'summit'} here={current === 'summit'} onSelect={setSelected} />
            </div>
          </div>
        </div>

        {selected && <Details id={selected} />}
      </div>
    </div>
  );
}

function Node({
  id,
  selected,
  here,
  onSelect,
}: {
  id: PhaseId;
  selected: boolean;
  here: boolean;
  onSelect: (id: PhaseId) => void;
}) {
  const phase = getPhase(id);
  const { found, total } = usePhaseGems(id);
  const visited = useProgress((s) => !!s.visited[id]);
  const badge = useProgress((s) => s.badges[id]);
  const built = useProgress((s) => (phase.project ? !!s.projects[phase.project.id] : false));
  const c = TRACK_COLORS[phase.track];
  const complete = found === total;

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={selected}
      className="relative flex w-full flex-col items-center gap-1 rounded-2xl border-[3px] px-1 py-1.5 transition-transform active:scale-95"
      style={{
        borderColor: selected ? INK : visited ? c.dark : `${INK}30`,
        background: visited ? c.light : '#ffffffb0',
        boxShadow: selected ? `0 3px 0 ${INK}` : undefined,
      }}
    >
      {here && (
        <span className="absolute -top-2 -right-1 rounded-full border-2 bg-white px-1 text-[9px] font-black" style={{ borderColor: INK }}>
          YOU
        </span>
      )}
      <ProgressRing value={found} total={total} size={34} stroke={4} color={GEM_COLORS[phase.track]}>
        <span className="text-[10px] font-black">{complete ? '✓' : found}</span>
      </ProgressRing>
      <span className={`line-clamp-2 text-center text-[11px] leading-tight font-extrabold sm:text-xs ${visited ? '' : 'opacity-60'}`}>
        {phase.title}
      </span>
      <span className="flex items-center gap-1">
        <BadgeStamp stars={badge?.stars} size="sm" />
        {phase.project && (
          <span
            className="flex h-4 w-4 items-center justify-center rounded border-2 text-[9px] font-black"
            style={{ borderColor: built ? INK : `${INK}40`, background: built ? '#7fd99a' : 'transparent' }}
            title={built ? 'Project built' : 'Project not built yet'}
          >
            {built ? '✓' : ''}
          </span>
        )}
      </span>
    </button>
  );
}

function Details({ id }: { id: PhaseId }) {
  const phase = getPhase(id);
  const { found, total } = usePhaseGems(id);
  const built = useProgress((s) => (phase.project ? !!s.projects[phase.project.id] : false));
  const badge = useProgress((s) => s.badges[id]);
  const c = TRACK_COLORS[phase.track];

  const travel = () => {
    requestTravel(id);
    resumeExplore();
  };

  return (
    <div
      className="border-t-4 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]"
      style={{ borderColor: INK, background: c.light }}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <h3 className="text-lg leading-tight font-extrabold">{phase.title}</h3>
        <TrackBadge track={phase.track} />
      </div>
      <p className="text-sm font-semibold opacity-75">{phase.subtitle}</p>
      <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs font-bold">
        <li>
          💎 {found}/{total} gems
        </li>
        {phase.project && <li>🛠 {phase.project.title}: {built ? 'built ✓' : 'not built yet'}</li>}
        <li>🏅 {badge ? `${badge.stars}★ badge` : 'badge not earned yet'}</li>
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={travel}
          className="min-h-11 flex-1 rounded-full border-[3px] px-4 text-sm font-extrabold active:translate-y-0.5"
          style={{ borderColor: INK, background: c.base, boxShadow: `0 3px 0 ${INK}` }}
        >
          🧭 Travel here
        </button>
        <button
          type="button"
          onClick={() => useUi.getState().openPanel(id)}
          className="min-h-11 flex-1 rounded-full border-[3px] bg-white px-4 text-sm font-extrabold active:translate-y-0.5"
          style={{ borderColor: INK, boxShadow: `0 3px 0 ${INK}` }}
        >
          📜 Read about it
        </button>
      </div>
    </div>
  );
}
