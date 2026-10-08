'use client';

import { useState, type ReactNode } from 'react';
import { CAREER_PATHS, gemId, getPhase, TRACK_LABELS, type Phase, type PhaseId, type Topic, type TopicGroup, type Track } from '@/data/roadmap';
import { CATEGORY_TINTS, GEM_COLORS, TRACK_COLORS } from '@/lib/palette';
import { useProgress } from '@/store/progress';
import { INK, SectionTitle } from './kit';

// Roadmap building blocks shared by the island guide (PhasePanel) and the Roadmap tab.

export function Card({ children, className = '', tint }: { children: ReactNode; className?: string; tint?: string }) {
  return (
    <div className={`rounded-2xl border-[3px] p-3 ${className}`} style={{ borderColor: INK, background: tint ?? 'white' }}>
      {children}
    </div>
  );
}

export function Chips({ items, track }: { items: string[]; track: Track }) {
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

/** Heading for a phase's tool chips (the doc calls some of these lists "Technologies" or "Platforms"). */
export const toolsTitle = (phase: Phase) =>
  phase.id === 'dev-rag-library' || phase.id === 'eng-gpu-plant' ? 'Technologies' : phase.id === 'dev-watchtower' ? 'Platforms' : 'Tools';

export function ToolsSection({ phase }: { phase: Phase }) {
  if (!phase.tools) return null;
  return (
    <section>
      <SectionTitle>{toolsTitle(phase)}</SectionTitle>
      <Chips items={phase.tools} track={phase.track} />
    </section>
  );
}

export function KeyQuestion({ phase }: { phase: Phase }) {
  if (!phase.keyQuestion) return null;
  return (
    <Card tint="#fff4d6">
      <SectionTitle>Key question</SectionTitle>
      <p className="text-base font-extrabold">“{phase.keyQuestion}”</p>
    </Card>
  );
}

export function AntiPatterns({ phase }: { phase: Phase }) {
  if (!phase.antiPatterns) return null;
  return (
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
  );
}

/** A category's card tint: categories cycle through CATEGORY_TINTS in the phase's group order. */
export const categoryTint = (phase: Phase, group: TopicGroup) => CATEGORY_TINTS[Math.max(0, phase.groups.indexOf(group)) % CATEGORY_TINTS.length];

/**
 * One topic category, as a card: a tinted header (emoji, title, one-line blurb, gems found) over its topics.
 * `chips` (island guide): tap a topic to read its bite. `list` (Roadmap): every topic with its bite, collected gems ticked.
 */
export function TopicGroupView({ phase, group, variant = 'chips' }: { phase: Phase; group: TopicGroup; variant?: 'chips' | 'list' }) {
  const gems = useProgress((s) => s.gems);
  const [open, setOpen] = useState<Topic | null>(null);
  const c = TRACK_COLORS[phase.track];
  const gemColor = GEM_COLORS[phase.track];
  const tint = categoryTint(phase, group);
  const found = group.topics.filter((tp) => gems[gemId(phase.id, tp.id)]).length;

  const header = (
    <header className="flex items-start gap-2 border-b-[3px] px-3 py-2" style={{ background: tint.light, borderColor: tint.dark }}>
      {group.emoji && (
        <span className="text-xl leading-none" aria-hidden>
          {group.emoji}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <h3 className="text-sm leading-tight font-black">{group.title}</h3>
        {group.blurb && <p className="text-xs leading-snug font-semibold opacity-75">{group.blurb}</p>}
      </span>
      <span className="shrink-0 text-xs font-extrabold tabular-nums" title="Skill Gems found in this category">
        💎 {found}/{group.topics.length}
      </span>
    </header>
  );

  if (variant === 'list') {
    return (
      <section className="overflow-hidden rounded-2xl border-[3px] bg-white" style={{ borderColor: tint.dark }}>
        {header}
        <ul className="flex flex-col gap-1.5 p-2">
          {group.topics.map((tp) => {
            const got = !!gems[gemId(phase.id, tp.id)];
            return (
              <li key={tp.id} className="flex gap-2 rounded-xl border-2 px-2.5 py-1.5" style={{ borderColor: got ? c.dark : `${INK}25`, background: got ? c.light : 'white' }}>
                <span
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 text-[10px] font-black"
                  style={{ borderColor: got ? INK : `${INK}40`, background: got ? '#7fd99a' : 'white' }}
                  aria-label={got ? 'Gem collected' : 'Gem not collected yet'}
                >
                  {got ? '✓' : ''}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-extrabold">{tp.label}</span>
                  <span className="block text-[13px] leading-snug">{tp.bite}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border-[3px] bg-white" style={{ borderColor: tint.dark }}>
      {header}
      <div className="flex flex-wrap gap-1.5 p-2.5">
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
          className="mx-2.5 mb-2.5 rounded-2xl border-[3px] px-3 py-2 text-sm animate-[toast-in_200ms_ease-out]"
          style={{ borderColor: INK, background: c.light }}
        >
          <div className="font-extrabold">{open.label}</div>
          <p className="mt-0.5">{open.bite}</p>
          {!gems[gemId(phase.id, open.id)] && <p className="mt-1 text-xs font-bold opacity-60">Find this Skill Gem somewhere on the island.</p>}
        </div>
      )}
    </section>
  );
}

/** Career-ladder rung colour: a path's own rung and its specialisations take the path colour. */
export function rungColor(label: string, fallback: string = TRACK_COLORS.meta.light): string {
  const path = CAREER_PATHS.find((p) => p.ladderRung === label || p.ladderBranches?.includes(label));
  return path ? TRACK_COLORS[path.id].light : fallback;
}

/** A phase heading: kicker ("Phase 4 · 3–4 weeks", or the track for unnumbered waypoints), title and subtitle. */
export function phaseHeading(id: PhaseId): { kicker: string; title: string; subtitle: string } {
  const phase = getPhase(id);
  const kicker = [phase.docPhase ? `Phase ${phase.docPhase}` : TRACK_LABELS[phase.track], phase.duration].filter(Boolean).join(' · ');
  return { kicker, title: phase.title, subtitle: phase.subtitle };
}
