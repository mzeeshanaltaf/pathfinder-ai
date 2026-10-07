'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { CAREER_PATH_BY_ID, CAREER_PATHS, getPhase, shortPathLabel, type PhaseId } from '@/data/roadmap';
import { TRACK_COLORS } from '@/lib/palette';
import { preferredPath, roadmapSections, suggestedNext } from '@/lib/progress';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';
import { BadgeStamp, Flow, flyTo, INK, SectionTitle, usePhaseGems } from './kit';
import { AntiPatterns, KeyQuestion, phaseHeading, ToolsSection, TopicGroupView } from './roadmapParts';
import { RoadmapPageLink } from './RoadmapPageLinks';
import RoadmapPrint from './RoadmapPrint';

/** Passport → 📜 Roadmap: one career path's whole roadmap, phase by phase, with print / save as PDF. */
export default function RoadmapTab() {
  const stored = useUi((s) => s.roadmapPath);
  const preferred = useProgress((s) => preferredPath(s));
  const path = CAREER_PATH_BY_ID[stored ?? preferred];
  const sections = roadmapSections(path.id);
  const all = sections.flatMap((s) => s.ids);
  const [open, setOpen] = useState<ReadonlySet<PhaseId>>(() => {
    const next = suggestedNext(useProgress.getState());
    return new Set(next && all.includes(next) ? [next] : []);
  });
  const toggle = (id: PhaseId) =>
    setOpen((cur) => {
      const s = new Set(cur);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });

  // The print document lives in #print-root (outside #game) while this tab is open.
  // The game is client-only (ssr: false), so the document is always there.
  const [printRoot] = useState(() => document.getElementById('print-root'));
  const c = TRACK_COLORS[path.id];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4" style={{ touchAction: 'pan-y' }}>
      {/* Path picker */}
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Career path">
        {CAREER_PATHS.map((p) => {
          const on = p.id === path.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => useUi.getState().setRoadmapPath(p.id)}
              className="min-h-11 min-w-0 flex-1 rounded-full border-[3px] px-3 text-sm font-extrabold active:translate-y-0.5"
              style={{ borderColor: on ? INK : `${INK}30`, background: on ? TRACK_COLORS[p.id].base : 'white', boxShadow: on ? `0 3px 0 ${INK}` : undefined }}
            >
              {p.emoji} {shortPathLabel(p)}
            </button>
          );
        })}
      </div>

      {/* Path header */}
      <section className="mt-3 rounded-2xl border-[3px] p-3" style={{ borderColor: INK, background: c.light }} aria-label={`${path.label} roadmap`}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
          <h3 className="text-lg font-extrabold">
            {path.emoji} {path.label} roadmap
          </h3>
          <span className="text-sm font-extrabold">⏱ {path.timeline.total}</span>
        </div>
        <p className="mt-1 text-sm">
          Goal: <b>{path.goal}</b>
        </p>
        <p className="mt-1 text-sm">{path.definition}</p>
        <RoadmapPageLink path={path} className="mt-1 inline-block text-sm">
          Open as a web page
        </RoadmapPageLink>
        <ol className="mt-2 flex flex-wrap gap-1.5" aria-label="Timeline">
          {path.timeline.steps.map((s) => (
            <li key={s.when} className="rounded-xl border-2 bg-white/85 px-2 py-0.5 text-[11px] leading-tight" style={{ borderColor: c.dark }}>
              <span className="font-extrabold opacity-60">{s.when}</span> <span className="font-bold">{s.what}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Toolbar */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <ToolButton onClick={() => setOpen(new Set(all))}>Expand all</ToolButton>
        <ToolButton onClick={() => setOpen(new Set())}>Collapse all</ToolButton>
        <ToolButton onClick={() => window.print()} tint="#ffc93c" className="ml-auto">
          🖨 Print / Save as PDF
        </ToolButton>
      </div>

      {sections.map((sec) => (
        <div key={sec.title} className="mt-4">
          <h3
            className="mb-2 rounded-full border-2 px-3 py-0.5 text-center text-xs font-extrabold"
            style={{ background: TRACK_COLORS[sec.track].light, borderColor: TRACK_COLORS[sec.track].dark }}
          >
            {sec.title}
          </h3>
          <div className="flex flex-col gap-2">
            {sec.ids.map((id) => (
              <PhaseSection key={id} id={id} open={open.has(id)} onToggle={() => toggle(id)} />
            ))}
          </div>
        </div>
      ))}

      {printRoot && createPortal(<RoadmapPrint path={path.id} />, printRoot)}
    </div>
  );
}

function ToolButton({ onClick, children, tint = 'white', className = '' }: { onClick: () => void; children: React.ReactNode; tint?: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 rounded-full border-[3px] px-3 text-xs font-extrabold whitespace-nowrap active:translate-y-0.5 sm:text-sm ${className}`}
      style={{ borderColor: INK, background: tint, boxShadow: `0 3px 0 ${INK}` }}
    >
      {children}
    </button>
  );
}

function PhaseSection({ id, open, onToggle }: { id: PhaseId; open: boolean; onToggle: () => void }) {
  const phase = getPhase(id);
  const { kicker, title, subtitle } = phaseHeading(id);
  const { found, total } = usePhaseGems(id);
  const badge = useProgress((s) => s.badges[id]);
  const built = useProgress((s) => (phase.project ? !!s.projects[phase.project.id] : false));
  const c = TRACK_COLORS[phase.track];

  return (
    <section className="overflow-hidden rounded-2xl border-[3px]" style={{ borderColor: open ? INK : c.dark, background: 'white' }} data-phase={id}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex min-h-12 w-full items-center gap-2 px-3 py-2 text-left"
        style={{ background: c.light }}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-extrabold uppercase opacity-60">{kicker}</span>
          <span className="block text-sm leading-tight wrap-break-word">
            <b className="font-extrabold">{title}:</b> <span className="font-semibold">{subtitle}</span>
          </span>
        </span>
        <span className="shrink-0 text-xs font-extrabold tabular-nums" title="Skill Gems found">
          💎 {found}/{total}
        </span>
        <BadgeStamp stars={badge?.stars} size="sm" />
        <span className="w-4 shrink-0 text-center font-black" aria-hidden>
          {open ? '▾' : '▸'}
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-4 border-t-[3px] px-3 py-3" style={{ borderColor: INK }}>
          <p className="text-sm leading-relaxed">{phase.summary}</p>
          {phase.groups.map((g) => (
            <TopicGroupView key={g.title} phase={phase} group={g} variant="list" />
          ))}
          <ToolsSection phase={phase} />
          <KeyQuestion phase={phase} />
          <AntiPatterns phase={phase} />
          {phase.diagrams?.map((d) => (
            <section key={d.title}>
              <SectionTitle>{d.title}</SectionTitle>
              <Flow steps={d.steps} track={phase.track} />
            </section>
          ))}
          {phase.project && (
            <section>
              <SectionTitle>Project</SectionTitle>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="font-extrabold">🛠 {phase.project.title}</span>
                <span
                  className="rounded-full border-2 px-2 text-[11px] font-extrabold"
                  style={{ borderColor: built ? INK : `${INK}30`, background: built ? '#7fd99a' : 'transparent' }}
                >
                  {built ? 'Built ✓' : 'Not built yet'}
                </span>
              </div>
              <Flow steps={phase.project.pipeline} track={phase.track} />
            </section>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => useUi.getState().openPanel(id, 'passport')}
              className="min-h-11 flex-1 rounded-full border-[3px] bg-white px-4 text-sm font-extrabold whitespace-nowrap active:translate-y-0.5"
              style={{ borderColor: INK, boxShadow: `0 3px 0 ${INK}` }}
            >
              📜 Island guide
            </button>
            <button
              type="button"
              onClick={() => flyTo(id)}
              className="min-h-11 flex-1 rounded-full border-[3px] px-4 text-sm font-extrabold whitespace-nowrap active:translate-y-0.5"
              style={{ borderColor: INK, background: c.base, boxShadow: `0 3px 0 ${INK}` }}
            >
              🎈 Fly here
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
