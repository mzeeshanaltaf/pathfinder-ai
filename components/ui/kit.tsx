'use client';

import { Fragment, type ReactNode } from 'react';
import { allGemIds, gemsForPhase, PHASE_IDS, TRACK_LABELS, type PhaseId, type Track } from '@/data/roadmap';
import { TRACK_COLORS } from '@/lib/palette';
import { requestGameLock } from '@/lib/pointerLock';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';

export const INK = '#3d3452';

/** Close any overlay and, on desktop, re-grab the mouse straight away (only works from a click/tap). */
export function resumeExplore() {
  useUi.getState().closeOverlay();
  requestGameLock();
}

/** Gems found / total for one phase (re-renders only when the count changes). */
export function usePhaseGems(id: PhaseId) {
  const found = useProgress((s) => gemsForPhase(id).reduce((n, g) => n + (s.gems[g] ? 1 : 0), 0));
  return { found, total: gemsForPhase(id).length };
}

export function useTotals() {
  const gems = useProgress((s) => allGemIds.reduce((n, g) => n + (s.gems[g] ? 1 : 0), 0));
  const badges = useProgress((s) => PHASE_IDS.reduce((n, id) => n + (s.badges[id] ? 1 : 0), 0));
  return { gems, gemTotal: allGemIds.length, badges, badgeTotal: PHASE_IDS.length };
}

export function TrackBadge({ track, className = '' }: { track: Track; className?: string }) {
  const c = TRACK_COLORS[track];
  return (
    <span
      className={`inline-flex items-center rounded-full border-2 px-2 py-0.5 text-[11px] font-bold leading-none whitespace-nowrap ${className}`}
      style={{ background: c.light, borderColor: c.dark, color: INK }}
    >
      {TRACK_LABELS[track]}
    </span>
  );
}

export function ProgressRing({
  value,
  total,
  size = 36,
  stroke = 4,
  color,
  children,
}: {
  value: number;
  total: number;
  size?: number;
  stroke?: number;
  color: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const frac = total > 0 ? value / total : 0;
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="white" stroke="#e7e2f3" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * frac} ${c}`}
          className="transition-[stroke-dasharray] duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">{children}</span>
    </span>
  );
}

/** Vertical flow of steps. A step containing " | " renders as parallel boxes. */
export function Flow({ steps, track }: { steps: string[]; track: Track }) {
  const c = TRACK_COLORS[track];
  return (
    <ol className="flex flex-col items-center gap-1">
      {steps.map((step, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <li aria-hidden className="text-lg leading-none font-black" style={{ color: c.dark }}>
              ↓
            </li>
          )}
          <li className="flex w-full max-w-sm flex-wrap justify-center gap-2">
            {step.split(' | ').map((part) => (
              <span
                key={part}
                className="min-w-0 flex-1 rounded-xl border-[3px] px-3 py-1.5 text-center text-sm font-bold wrap-break-word"
                style={{ background: c.light, borderColor: INK, color: INK, boxShadow: `0 3px 0 ${INK}` }}
              >
                {part}
              </span>
            ))}
          </li>
        </Fragment>
      ))}
    </ol>
  );
}

export function CloseButton({ onClick, label = 'Close' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] bg-white text-xl font-black active:translate-y-0.5"
      style={{ borderColor: INK, color: INK, boxShadow: `0 3px 0 ${INK}` }}
    >
      ✕
    </button>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 text-xs font-extrabold tracking-wider uppercase opacity-60">{children}</h3>;
}

/** Empty / filled badge stamp (badges are awarded from Phase 3). */
export function BadgeStamp({ stars, size = 'md' }: { stars?: 1 | 2 | 3; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'h-4 w-4 text-[9px]' : 'h-14 w-14 text-sm';
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 font-black ${dim} ${
        stars ? 'border-amber-500 bg-amber-200 text-amber-700' : 'border-dashed border-[#3d3452]/30 text-[#3d3452]/30'
      }`}
      title={stars ? `${stars}-star badge` : 'Badge not earned yet'}
    >
      {size === 'md' ? (stars ? '★'.repeat(stars) : '☆☆☆') : stars ? '★' : ''}
    </span>
  );
}
