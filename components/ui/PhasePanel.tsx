'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { MINIGAMES } from '@/data/minigames';
import {
  BUILD_ADVICE,
  BUILD_PROJECTS,
  CAREER_LADDER,
  COMPARISON,
  DEFINITIONS,
  DEVELOPER_FINAL_SKILLS,
  DIFFERENCE,
  ENTRY_POINT_NOTE,
  gemId,
  getPhase,
  ROADMAP_SHAPE,
  TIMELINE_NOTE,
  TIMELINES,
  TRACK_GOALS,
  type Phase,
  type PhaseId,
  type Topic,
  type TopicGroup,
} from '@/data/roadmap';
import { GEM_COLORS, TRACK_COLORS } from '@/lib/palette';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';
import {
  BadgeStamp,
  CloseButton,
  Flow,
  INK,
  ProgressRing,
  resumeExplore,
  SectionTitle,
  TrackBadge,
  usePhaseGems,
} from './kit';
import { replayFinale } from './Passport';

type TabId = 'overview' | 'compare' | 'topics' | 'project' | 'skills' | 'timelines' | 'build' | 'challenge';

const TAB_LABELS: Record<TabId, string> = {
  overview: 'Overview',
  compare: 'Compare',
  topics: 'Topics',
  project: 'Project',
  skills: 'Skill sets',
  timelines: 'Timelines',
  build: 'What to build',
  challenge: 'Challenge',
};

function tabsFor(phase: Phase): TabId[] {
  if (phase.id === 'fork') return ['compare', 'topics', 'challenge'];
  if (phase.id === 'summit') return ['overview', 'skills', 'timelines', 'build', 'topics', 'challenge'];
  return phase.project ? ['overview', 'topics', 'project', 'challenge'] : ['overview', 'topics', 'challenge'];
}

export default function PhasePanel() {
  const mode = useUi((s) => s.mode);
  const id = useUi((s) => s.activePhaseId);
  if (mode !== 'panel' || !id) return null;
  return <PanelBody key={id} id={id} />;
}

function PanelBody({ id }: { id: PhaseId }) {
  const phase = getPhase(id);
  const tabs = tabsFor(phase);
  const [tab, setTab] = useState<TabId>(tabs[0]);
  const { found, total } = usePhaseGems(id);
  const colors = TRACK_COLORS[phase.track];

  return (
    <div
      className="fixed inset-0 z-30 flex items-stretch justify-center bg-[#3d3452]/35 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={resumeExplore}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={phase.title}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-2xl min-w-0 flex-col overflow-hidden bg-[#fffdf8] sm:h-auto sm:max-h-[88vh] sm:rounded-3xl sm:border-4"
        style={{ borderColor: INK, color: INK, boxShadow: `0 8px 0 ${INK}` }}
      >
        {/* Header */}
        <header
          className="flex items-start gap-3 border-b-4 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-3"
          style={{ background: colors.light, borderColor: INK }}
        >
          <ProgressRing value={found} total={total} size={48} stroke={5} color={GEM_COLORS[phase.track]}>
            <span className="text-[11px] font-black">
              {found}/{total}
            </span>
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <TrackBadge track={phase.track} />
              {phase.docPhase && (
                <span className="text-[11px] font-bold opacity-70">
                  Phase {phase.docPhase}
                  {phase.duration ? ` · ${phase.duration}` : ''}
                </span>
              )}
            </div>
            <h2 className="mt-1 text-2xl leading-tight font-extrabold wrap-break-word">{phase.title}</h2>
            <p className="text-sm font-semibold opacity-75">{phase.subtitle}</p>
          </div>
          <CloseButton onClick={resumeExplore} />
        </header>

        {/* Tabs */}
        <nav className="flex flex-wrap gap-1 border-b-2 border-[#3d3452]/15 bg-white px-2 py-2 sm:gap-1.5 sm:px-3" role="tablist">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className="min-h-10 rounded-full border-[3px] px-2.5 text-sm font-bold transition-colors sm:px-3"
              style={
                tab === t
                  ? { background: colors.base, borderColor: INK, color: INK }
                  : { background: 'white', borderColor: 'transparent', color: `${INK}b0` }
              }
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </nav>

        {/* Body */}
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-[max(16px,env(safe-area-inset-bottom))] select-text"
          style={{ touchAction: 'pan-y' }}
        >
          {tab === 'overview' && id === 'summit' && <SummitRewards />}
          {tab === 'overview' && (id === 'harbor' ? <HarborOverview phase={phase} /> : <Overview phase={phase} />)}
          {tab === 'compare' && <ForkCompare phase={phase} />}
          {tab === 'topics' && <Topics phase={phase} />}
          {tab === 'project' && phase.project && <ProjectTab phase={phase} />}
          {tab === 'skills' && <SummitSkills />}
          {tab === 'timelines' && <SummitTimelines />}
          {tab === 'build' && <SummitBuild />}
          {tab === 'challenge' && <Challenge phase={phase} />}
        </div>
      </div>
    </div>
  );
}

/** Summit only: the certificate, and a replay of the celebration once it has played. */
function SummitRewards() {
  const badge = useProgress((s) => !!s.badges.summit);
  const seen = useProgress((s) => s.finaleSeen);
  return (
    <div className="mb-4 flex flex-col gap-2 rounded-2xl border-[3px] p-3" style={{ borderColor: INK, background: '#fff6d8' }}>
      <p className="text-sm font-bold">
        {badge ? 'You earned the Summit badge. Your certificate is ready!' : 'Earn the Summit Challenge badge to unlock your certificate and the celebration.'}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!badge}
          onClick={() => useUi.getState().openMenu('certificate')}
          className="min-h-11 flex-1 rounded-full border-[3px] px-4 text-sm font-extrabold active:translate-y-0.5 disabled:opacity-45"
          style={{ borderColor: INK, background: '#ffc93c', boxShadow: `0 3px 0 ${INK}` }}
        >
          🎓 Certificate
        </button>
        {seen && (
          <button
            type="button"
            onClick={replayFinale}
            className="min-h-11 flex-1 rounded-full border-[3px] bg-white px-4 text-sm font-extrabold active:translate-y-0.5"
            style={{ borderColor: INK, boxShadow: `0 3px 0 ${INK}` }}
          >
            🎆 Replay celebration
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared bits

function Card({ children, className = '', tint }: { children: ReactNode; className?: string; tint?: string }) {
  return (
    <div className={`rounded-2xl border-[3px] p-3 ${className}`} style={{ borderColor: INK, background: tint ?? 'white' }}>
      {children}
    </div>
  );
}

function MentorQuote({ phase, line = 1 }: { phase: Phase; line?: number }) {
  const colors = TRACK_COLORS[phase.track];
  const text = phase.mentor.lines[line] ?? phase.mentor.lines[0];
  return (
    <div className="flex items-start gap-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[3px] text-lg"
        style={{ background: colors.base, borderColor: INK }}
        aria-hidden
      >
        🤖
      </span>
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border-[3px] bg-white px-3 py-2" style={{ borderColor: INK }}>
        <div className="text-[11px] font-extrabold uppercase" style={{ color: colors.dark }}>
          {phase.mentor.name}
        </div>
        <p className="text-sm">{text}</p>
      </div>
    </div>
  );
}

function Chips({ items, track }: { items: string[]; track: Phase['track'] }) {
  const c = TRACK_COLORS[track];
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <span key={s} className="rounded-full border-2 px-2.5 py-1 text-xs font-bold" style={{ borderColor: c.dark, background: c.light }}>
          {s}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Overview

function Overview({ phase }: { phase: Phase }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-[15px] leading-relaxed">{phase.summary}</p>
      {phase.duration && (
        <div className="flex items-center gap-2 text-sm font-bold">
          <span aria-hidden>⏱️</span> Suggested duration: {phase.duration}
        </div>
      )}
      <MentorQuote phase={phase} />
      {phase.keyQuestion && (
        <Card tint="#fff4d6">
          <SectionTitle>Key question</SectionTitle>
          <p className="text-base font-extrabold">“{phase.keyQuestion}”</p>
        </Card>
      )}
      {phase.antiPatterns && (
        <Card tint="#ffe8e8">
          <SectionTitle>What doesn&apos;t work</SectionTitle>
          <ul className="flex flex-col gap-1 text-sm font-semibold">
            {phase.antiPatterns.map((a) => (
              <li key={a} className="flex gap-2">
                <span aria-hidden>🚫</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {phase.diagrams?.map((d) => (
        <section key={d.title}>
          <SectionTitle>{d.title}</SectionTitle>
          <Flow steps={d.steps} track={phase.track} />
        </section>
      ))}
      {phase.id === 'summit' && (
        <Card tint={TRACK_COLORS.developer.light}>
          <p className="text-sm font-semibold">{ENTRY_POINT_NOTE}</p>
        </Card>
      )}
    </div>
  );
}

function HarborOverview({ phase }: { phase: Phase }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-[15px] leading-relaxed">{phase.summary}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Card tint={TRACK_COLORS.developer.light}>
          <h3 className="font-extrabold">🟢 AI Developer</h3>
          <p className="mt-1 text-sm">{DEFINITIONS.developer}</p>
        </Card>
        <Card tint={TRACK_COLORS.engineer.light}>
          <h3 className="font-extrabold">🔵 AI Engineer</h3>
          <p className="mt-1 text-sm">{DEFINITIONS.engineer}</p>
        </Card>
      </div>
      <p className="text-center text-sm font-extrabold">{DEFINITIONS.shared}</p>
      <MentorQuote phase={phase} line={3} />
      <section>
        <SectionTitle>The roadmap at a glance</SectionTitle>
        <Flow steps={ROADMAP_SHAPE.trunk} track="common" />
        <div className="my-2 text-center text-lg font-black" aria-hidden>
          ↙ ↘
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="mb-1 text-center text-xs font-extrabold">AI Developer</div>
            <Flow steps={ROADMAP_SHAPE.developer} track="developer" />
          </div>
          <div>
            <div className="mb-1 text-center text-xs font-extrabold">AI Engineer</div>
            <Flow steps={ROADMAP_SHAPE.engineer} track="engineer" />
          </div>
        </div>
        <div className="my-2 text-center text-lg font-black" aria-hidden>
          ↘ ↙
        </div>
        <Flow steps={[ROADMAP_SHAPE.converge]} track="meta" />
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Topics

function Topics({ phase }: { phase: Phase }) {
  const { found, total } = usePhaseGems(phase.id);
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm font-semibold">
        💎 {found} of {total} Skill Gems found on this island. Tap a topic to read about it.
      </p>
      {phase.groups.map((g) => (
        <TopicGroupView key={g.title} phase={phase} group={g} />
      ))}
      {phase.tools && (
        <section>
          <SectionTitle>{phase.id === 'dev-rag-library' || phase.id === 'eng-gpu-plant' ? 'Technologies' : 'Tools'}</SectionTitle>
          <Chips items={phase.tools} track={phase.track} />
        </section>
      )}
    </div>
  );
}

function TopicGroupView({ phase, group }: { phase: Phase; group: TopicGroup }) {
  const gems = useProgress((s) => s.gems);
  const [open, setOpen] = useState<Topic | null>(null);
  const c = TRACK_COLORS[phase.track];
  const gemColor = GEM_COLORS[phase.track];

  return (
    <section>
      <SectionTitle>{group.title}</SectionTitle>
      <div className="flex flex-wrap gap-1.5">
        {group.topics.map((tp) => {
          const got = !!gems[gemId(phase.id, tp.id)];
          const selected = open?.id === tp.id;
          return (
            <button
              key={tp.id}
              type="button"
              onClick={() => setOpen(selected ? null : tp)}
              aria-pressed={selected}
              className="min-h-9 rounded-full border-[3px] px-3 py-1 text-left text-sm font-bold transition-transform active:scale-95"
              style={{
                borderColor: selected ? INK : got ? c.dark : `${INK}30`,
                background: got ? c.light : 'white',
                color: got ? INK : `${INK}a0`,
              }}
            >
              {got && (
                <span className="mr-1" style={{ color: gemColor }} aria-label="collected">
                  ◆
                </span>
              )}
              {tp.label}
            </button>
          );
        })}
      </div>
      {open && (
        <div
          className="mt-2 rounded-2xl border-[3px] px-3 py-2 text-sm animate-[toast-in_200ms_ease-out]"
          style={{ borderColor: INK, background: c.light }}
        >
          <div className="font-extrabold">{open.label}</div>
          <p className="mt-0.5">{open.bite}</p>
          {!gems[gemId(phase.id, open.id)] && (
            <p className="mt-1 text-xs font-bold opacity-60">Find this Skill Gem somewhere on the island.</p>
          )}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Project

function BuiltToggle({ projectId, compact = false }: { projectId: string; compact?: boolean }) {
  const built = useProgress((s) => !!s.projects[projectId]);
  const setBuilt = useProgress((s) => s.setProjectBuilt);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={built}
      onClick={() => setBuilt(projectId, !built)}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border-[3px] font-extrabold transition-colors active:translate-y-0.5 ${
        compact ? 'min-h-9 px-2.5 text-xs' : 'min-h-12 px-4 text-base'
      }`}
      style={{ borderColor: INK, background: built ? '#7fd99a' : 'white', boxShadow: `0 3px 0 ${INK}` }}
    >
      <span
        className={`flex items-center justify-center rounded-md border-2 ${compact ? 'h-4 w-4 text-[10px]' : 'h-6 w-6 text-sm'}`}
        style={{ borderColor: INK, background: built ? INK : 'white', color: 'white' }}
        aria-hidden
      >
        {built ? '✓' : ''}
      </span>
      I built this
    </button>
  );
}

function ProjectTab({ phase }: { phase: Phase }) {
  const project = phase.project!;
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-center">
        <SectionTitle>Build</SectionTitle>
        <h3 className="text-xl font-extrabold">{project.title}</h3>
      </div>
      <Flow steps={project.pipeline} track={phase.track} />
      <BuiltToggle projectId={project.id} />
      <p className="max-w-sm text-center text-xs font-semibold opacity-60">
        Projects matter more than completing a calendar schedule. Tick this when you&apos;ve really built it.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Challenge

function Challenge({ phase }: { phase: Phase }) {
  const badge = useProgress((s) => s.badges[phase.id]);
  const game = MINIGAMES[phase.id];
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <BadgeStamp stars={badge?.stars} />
      <div>
        <SectionTitle>Mini-game</SectionTitle>
        <h3 className="text-xl font-extrabold">★ {game.title}</h3>
      </div>
      <p className="max-w-sm text-sm font-semibold">{game.howTo}</p>
      <button
        type="button"
        onClick={() => useUi.getState().openMiniGame(phase.id)}
        className="min-h-12 rounded-full border-[3px] px-6 text-base font-extrabold active:translate-y-0.5"
        style={{ borderColor: INK, background: TRACK_COLORS[phase.track].base, boxShadow: `0 4px 0 ${INK}` }}
      >
        ▶ {badge ? 'Play again' : 'Play mini-game'}
      </button>
      <span className="text-xs font-bold opacity-60">
        {badge
          ? badge.stars < 3
            ? `Best: ${badge.stars}★. Beat it to upgrade your badge.`
            : 'Perfect 3★ badge earned!'
          : 'Earn this island’s badge: up to 3 stars.'}
      </span>
      <p className="text-xs font-semibold opacity-50">Tip: the ★ Challenge pedestal next to the landmark starts it too.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fork: side-by-side comparison

function ForkCompare({ phase }: { phase: Phase }) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const dev = TRACK_COLORS.developer;
  const eng = TRACK_COLORS.engineer;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[15px] leading-relaxed">{phase.summary}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Card tint={dev.light}>
          <h3 className="font-extrabold">🟢 AI Developer</h3>
          <p className="mt-1 text-sm">
            Goal: <b>{TRACK_GOALS.developer}</b>
          </p>
          <p className="mt-2 text-base font-extrabold italic">“{DIFFERENCE.developer.quote}”</p>
          <p className="mt-2 text-xs font-bold opacity-70">Excellent at</p>
          <p className="text-sm font-semibold">{DIFFERENCE.developer.excellentAt.join(' + ')}</p>
        </Card>
        <Card tint={eng.light}>
          <h3 className="font-extrabold">🔵 AI Engineer</h3>
          <p className="mt-1 text-sm">
            Goal: <b>{TRACK_GOALS.engineer}</b>
          </p>
          <p className="mt-2 text-base font-extrabold italic">“{DIFFERENCE.engineer.quote}”</p>
          <p className="mt-2 text-xs font-bold opacity-70">Excellent at</p>
          <p className="text-sm font-semibold">{DIFFERENCE.engineer.excellentAt.join(' + ')}</p>
        </Card>
      </div>

      <section>
        <SectionTitle>Side-by-side comparison</SectionTitle>
        <div className="mb-2 flex flex-wrap gap-3 text-xs font-bold">
          <span className="flex items-center gap-1">
            <span className="h-3 w-5 rounded-full border-2" style={{ background: dev.base, borderColor: INK }} /> AI Developer
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-5 rounded-full border-2" style={{ background: eng.base, borderColor: INK }} /> AI Engineer
          </span>
        </div>
        <ul className="flex flex-col gap-2">
          {COMPARISON.map((row, i) => (
            <li key={row.area} className="grid grid-cols-[minmax(0,7.5rem)_1fr] items-center gap-2 sm:grid-cols-[10rem_1fr]">
              <span className="text-xs leading-tight font-bold wrap-break-word">{row.area}</span>
              <span className="flex flex-col gap-1" aria-label={`${row.area}: Developer ${row.dev} of 5, Engineer ${row.eng} of 5`}>
                {[
                  { v: row.dev, c: dev },
                  { v: row.eng, c: eng },
                ].map(({ v, c }, k) => (
                  <span key={k} className="flex items-center gap-1.5">
                    <span className="h-3 flex-1 overflow-hidden rounded-full border-2 bg-white" style={{ borderColor: `${INK}40` }}>
                      <span
                        className="block h-full rounded-full transition-[width] duration-700 ease-out"
                        style={{ width: grown ? `${v * 20}%` : '0%', background: c.dark, transitionDelay: `${i * 30}ms` }}
                      />
                    </span>
                    <span className="w-14 text-[10px] tracking-tighter text-amber-500" aria-hidden>
                      {'★'.repeat(v)}
                    </span>
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <MentorQuote phase={phase} line={3} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summit

function SummitSkills() {
  const dev = TRACK_COLORS.developer;
  const eng = TRACK_COLORS.engineer;
  return (
    <div className="flex flex-col gap-5">
      <Card tint={dev.light}>
        <h3 className="font-extrabold">🟢 AI Developer final skill set</h3>
        <div className="mt-2">
          <Chips items={DEVELOPER_FINAL_SKILLS.foundation} track="developer" />
          <div className="my-1 text-center text-lg font-black">+</div>
          <Chips items={DEVELOPER_FINAL_SKILLS.ai} track="developer" />
        </div>
        <p className="mt-3 text-sm">
          Capable of taking <b>“{DEVELOPER_FINAL_SKILLS.challenge}”</b> {DEVELOPER_FINAL_SKILLS.outcome}
        </p>
      </Card>
      <Card tint={eng.light}>
        <h3 className="font-extrabold">🔵 AI Engineer: excellent at</h3>
        <div className="mt-2">
          <Chips items={DIFFERENCE.engineer.excellentAt} track="engineer" />
        </div>
        <p className="mt-3 text-sm">
          <b>“{DIFFERENCE.engineer.quote}”</b>
        </p>
      </Card>
      <Card>
        <p className="text-sm font-semibold">{ENTRY_POINT_NOTE}</p>
      </Card>
    </div>
  );
}

function SummitTimelines() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {TIMELINES.map((tl) => {
          const c = TRACK_COLORS[tl.track];
          return (
            <Card key={tl.track} tint={c.light}>
              <h3 className="font-extrabold">
                {tl.track === 'developer' ? '🟢 AI Developer' : '🔵 AI Engineer'}
                <span className="ml-2 text-sm">{tl.total}</span>
              </h3>
              <ol className="mt-2 flex flex-col">
                {tl.steps.map((s, i) => (
                  <li key={s.when} className="relative flex gap-3 pb-2 pl-1">
                    <span className="flex flex-col items-center">
                      <span className="mt-1 h-3 w-3 shrink-0 rounded-full border-2" style={{ background: c.dark, borderColor: INK }} />
                      {i < tl.steps.length - 1 && <span className="w-0.5 flex-1" style={{ background: c.dark }} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-extrabold uppercase opacity-60">{s.when}</span>
                      <span className="block text-sm font-bold">{s.what}</span>
                    </span>
                  </li>
                ))}
              </ol>
              {tl.note && <p className="mt-1 text-xs font-semibold">{tl.note}</p>}
            </Card>
          );
        })}
      </div>
      <p className="text-center text-sm font-bold">{TIMELINE_NOTE}</p>
    </div>
  );
}

function SummitBuild() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm font-semibold">{BUILD_ADVICE}</p>
      <ol className="flex flex-col gap-2">
        {BUILD_PROJECTS.map((p) => (
          <li key={p.number}>
            <Card className="flex flex-col gap-2">
              <div className="flex items-start gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] text-sm font-black"
                  style={{ borderColor: INK, background: TRACK_COLORS.meta.light }}
                >
                  {p.number}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-extrabold uppercase opacity-60">{p.level}</div>
                  <div className="font-extrabold">{p.title}</div>
                  <p className="text-sm">{p.description}</p>
                  {p.phaseId && p.phaseId !== 'summit' && (
                    <p className="mt-0.5 text-xs font-bold opacity-60">Island: {getPhase(p.phaseId).title}</p>
                  )}
                </div>
              </div>
              {p.pipeline && <p className="text-xs font-semibold wrap-break-word opacity-80">{p.pipeline.join(' + ')}</p>}
              {p.number === 8 && <Flow steps={getPhase('summit').project!.pipeline} track="meta" />}
              <div className="flex justify-end">
                <BuiltToggle projectId={p.projectId} compact />
              </div>
            </Card>
          </li>
        ))}
      </ol>

      <section>
        <SectionTitle>Career progression</SectionTitle>
        <ol className="flex flex-col items-center gap-1">
          {CAREER_LADDER.map((row, i) => (
            <li key={i} className="flex w-full flex-col items-center gap-1">
              {i > 0 && (
                <span aria-hidden className="text-lg leading-none font-black">
                  ↓
                </span>
              )}
              <span className="flex w-full max-w-md flex-wrap justify-center gap-2">
                {row.map((r) => (
                  <span
                    key={r}
                    className="min-w-0 flex-1 rounded-xl border-[3px] px-2 py-1.5 text-center text-sm font-bold"
                    style={{
                      borderColor: INK,
                      background:
                        r === 'AI Developer' || r === 'AI Apps'
                          ? TRACK_COLORS.developer.light
                          : r === 'AI Engineer' || r === 'ML/DL' || r === 'AI Systems'
                            ? TRACK_COLORS.engineer.light
                            : TRACK_COLORS.meta.light,
                    }}
                  >
                    {r}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
