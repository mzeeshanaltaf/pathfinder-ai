'use client';

import { useState } from 'react';
import { requestTravel } from '@/components/player/playerState';
import { BUILD_PROJECTS, getPhase, PHASE_IDS, TIMELINE_NOTE, TIMELINES, TRACK_LABELS, trackPhases, type PhaseId } from '@/data/roadmap';
import { GEM_COLORS, TRACK_COLORS } from '@/lib/palette';
import { ACHIEVEMENTS, jobReady, PATH_TRACKS, preferredPath } from '@/lib/progress';
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

type PassportTab = 'map' | 'journey' | 'awards';

const TABS: { id: PassportTab; label: string }[] = [
  { id: 'map', label: '🗺 Map' },
  { id: 'journey', label: '🎯 Job-ready' },
  { id: 'awards', label: '🏆 Awards' },
];

function PassportBook() {
  const current = useUi((s) => s.currentIsland);
  const [selected, setSelected] = useState<PhaseId | null>(current);
  const [tab, setTab] = useState<PassportTab>('map');
  const unlocked = useProgress((s) => Object.keys(s.achievements).length);
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
              <span>
                🏆 {unlocked}/{ACHIEVEMENTS.length} awards
              </span>
            </div>
          </div>
          <CloseButton onClick={resumeExplore} />
        </header>

        <nav className="flex gap-1.5 border-b-4 px-3 pt-2" style={{ borderColor: INK, background: '#f6eed7' }} role="tablist" aria-label="Passport sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className="-mb-1 min-h-10 rounded-t-xl border-[3px] border-b-0 px-3 text-xs font-extrabold whitespace-nowrap sm:text-sm"
              style={{ borderColor: tab === t.id ? INK : 'transparent', background: tab === t.id ? '#fdf6e3' : 'transparent' }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'journey' && <JourneyTab />}
        {tab === 'awards' && <AwardsTab />}
        {tab === 'map' && (
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
        )}

        {tab === 'map' && selected && <Details id={selected} />}
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

/** "I built this" project names, by progress key. */
const PROJECT_TITLES: Record<string, string> = {
  ...Object.fromEntries(BUILD_PROJECTS.map((b) => [b.projectId, b.title])),
  ...Object.fromEntries(PHASE_IDS.flatMap((id) => (getPhase(id).project ? [[getPhase(id).project!.id, getPhase(id).project!.title]] : []))),
};

const fmtMonths = (m: number) => (m < 1 ? '<1' : String(Math.round(m)));

/** Job-ready meter: estimated months remaining per path, from the doc's timelines. */
function JourneyTab() {
  // Re-render on the slices the estimate reads (selectors return stable references).
  useProgress((s) => s.gems);
  useProgress((s) => s.badges);
  useProgress((s) => s.projects);
  const summitBadge = useProgress((s) => !!s.badges.summit);
  const finaleSeen = useProgress((s) => s.finaleSeen);
  const p = useProgress.getState();
  const estimates = PATH_TRACKS.map((t) => jobReady(p, t));
  const preferred = preferredPath(p);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4" style={{ touchAction: 'pan-y' }}>
      <p className="mb-3 text-sm font-semibold">
        How far are you from job-ready? Built projects count most: <i>“{TIMELINE_NOTE.split(';')[1]?.split('.')[0]?.trim()}.”</i>
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {estimates.map((e) => {
          const c = TRACK_COLORS[e.track];
          const timeline = TIMELINES.find((t) => t.track === e.track)!;
          const ready = e.ready >= 0.97;
          return (
            <section key={e.track} className="rounded-2xl border-[3px] p-3" style={{ borderColor: INK, background: c.light }} aria-label={`${TRACK_LABELS[e.track]} job-ready meter`}>
              <div className="flex flex-wrap items-center justify-between gap-1">
                <TrackBadge track={e.track} />
                {preferred === e.track && <span className="text-[10px] font-extrabold uppercase opacity-60">Your main path</span>}
              </div>
              <div className="mt-1.5 text-2xl leading-tight font-black">
                {ready ? 'Job-ready! 🎉' : `≈ ${fmtMonths(e.monthsLeft[0])}–${fmtMonths(e.monthsLeft[1])} months`}
              </div>
              <div className="text-xs font-bold opacity-70">{ready ? 'Keep building projects.' : `left of the doc's ${timeline.total} plan`}</div>
              <div className="mt-2 h-4 overflow-hidden rounded-full border-[3px] bg-white" style={{ borderColor: INK }} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(e.ready * 100)} aria-label="Job-ready">
                <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.round(e.ready * 100)}%`, background: c.dark }} />
              </div>
              <div className="mt-0.5 text-right text-[11px] font-extrabold tabular-nums">{Math.round(e.ready * 100)}% ready</div>
              <ol className="mt-2 flex flex-col gap-1.5">
                {e.steps.map((s) => (
                  <li key={s.what} className="rounded-xl border-2 bg-white/80 px-2 py-1" style={{ borderColor: `${INK}30` }}>
                    <div className="flex items-center gap-2 text-xs font-extrabold">
                      <span className="min-w-0 flex-1 truncate">{s.what}</span>
                      <span className="shrink-0 opacity-60">
                        {s.months} mo · {Math.round(s.done * 100)}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#3d3452]/10">
                      <div className="h-full rounded-full" style={{ width: `${Math.round(s.done * 100)}%`, background: c.dark }} />
                    </div>
                    {s.projects.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {s.projects.map((pr) => (
                          <span key={pr.id} className="rounded-full border-2 px-1.5 text-[10px] font-bold" style={{ borderColor: pr.built ? INK : `${INK}30`, background: pr.built ? '#7fd99a' : 'transparent' }}>
                            🛠 {PROJECT_TITLES[pr.id] ?? pr.id}
                            {pr.built ? ' ✓' : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
      <p className="mt-3 text-xs font-semibold opacity-60">
        Illustrative estimate: each step of the doc&apos;s timeline counts gems and badge stars, but a step with projects is mostly about marking them “I built this” on the island.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => useUi.getState().openMenu('certificate')}
          className="min-h-11 flex-1 rounded-full border-[3px] px-4 text-sm font-extrabold active:translate-y-0.5"
          style={{ borderColor: INK, background: summitBadge ? '#ffc93c' : 'white', boxShadow: `0 3px 0 ${INK}` }}
        >
          🎓 {summitBadge ? 'Your certificate' : 'Certificate (unlocks at the Summit)'}
        </button>
        {finaleSeen && (
          <button
            type="button"
            onClick={() => replayFinale()}
            className="min-h-11 flex-1 rounded-full border-[3px] bg-white px-4 text-sm font-extrabold active:translate-y-0.5"
            style={{ borderColor: INK, boxShadow: `0 3px 0 ${INK}` }}
          >
            🎆 Replay the Summit celebration
          </button>
        )}
      </div>
    </div>
  );
}

/** Fly to the Summit's plaza view and replay the celebration. */
export function replayFinale() {
  useUi.getState().startCinematic({ kind: 'finale' });
}

function AwardsTab() {
  const got = useProgress((s) => s.achievements);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4" style={{ touchAction: 'pan-y' }}>
      <ul className="grid gap-2 sm:grid-cols-2">
        {ACHIEVEMENTS.map((a) => {
          const at = got[a.id];
          return (
            <li
              key={a.id}
              className="flex items-center gap-3 rounded-2xl border-[3px] px-3 py-2"
              style={{ borderColor: at ? INK : `${INK}30`, background: at ? '#fff6d8' : '#ffffff90' }}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] text-2xl ${at ? '' : 'grayscale opacity-40'}`}
                style={{ borderColor: INK, background: at ? '#ffc93c' : '#ece8f5' }}
                aria-hidden
              >
                {a.icon}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-extrabold">{a.title}</div>
                <div className="text-xs font-semibold opacity-75">{a.text}</div>
                <div className="text-[10px] font-bold opacity-50">{at ? `Unlocked ${new Date(at).toLocaleDateString()}` : 'Locked'}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
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
          🎈 Fly here
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
