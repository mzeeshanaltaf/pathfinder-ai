'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { INK, SectionTitle } from '@/components/ui/kit';
import { getPhase, type PhaseId } from '@/data/roadmap';
import { TRACK_COLORS } from '@/lib/palette';

/** Shared bits for the Phase 4 concept simulations (SVG / HTML inside the mini-game overlay). */

export const GOOD = '#45b06a';
export const BAD = '#e5584f';
export const WARN = '#f2a33a';
export const GOLD = '#ffc93c';

export const trackColors = (phaseId: PhaseId) => TRACK_COLORS[getPhase(phaseId).track];

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Small pill that marks made-up teaching numbers as such. */
export function Illustrative({ children = 'Illustrative numbers' }: { children?: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border-2 border-dashed px-2 py-0.5 text-[10px] font-extrabold tracking-wide whitespace-nowrap uppercase"
      style={{ borderColor: `${INK}80`, color: `${INK}b0`, background: '#ffffffb0' }}
    >
      ⓘ {children}
    </span>
  );
}

/** White outlined card used to group a sim's controls or charts. */
export function SimCard({ title, aside, children, className = '' }: { title?: ReactNode; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`w-full min-w-0 rounded-2xl border-[3px] bg-white p-3 ${className}`} style={{ borderColor: INK }}>
      {(title || aside) && (
        <div className="mb-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          {title ? <SectionTitle>{title}</SectionTitle> : <span />}
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

/** "Round 2 of 3 · Title" strip. */
export function RoundHeader({ round, total, title, color }: { round: number; total: number; title: ReactNode; color: string }) {
  return (
    <div className="flex w-full items-center gap-2">
      <span
        className="shrink-0 rounded-full border-[3px] px-2.5 py-0.5 text-xs font-black whitespace-nowrap"
        style={{ borderColor: INK, background: color }}
      >
        {round} / {total}
      </span>
      <h3 className="min-w-0 text-base leading-tight font-extrabold">{title}</h3>
    </div>
  );
}

/** Labelled range slider (native input, so mouse, touch and keyboard all work). */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
  color = '#ffd66e',
  disabled = false,
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display?: ReactNode;
  color?: string;
  disabled?: boolean;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="block w-full min-w-0">
      <span className="flex items-baseline justify-between gap-2 text-sm font-extrabold">
        <span className="min-w-0">{label}</span>
        <span className="shrink-0 rounded-lg px-1.5 tabular-nums" style={{ background: `${color}66` }}>
          {display ?? value}
        </span>
      </span>
      <input
        type="range"
        className="sim-range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--pct': `${pct}%`, '--fill': color } as CSSProperties}
      />
    </label>
  );
}

/** Row of toggle buttons; exactly one is pressed. */
export function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
  color = '#ffd66e',
}: {
  label?: ReactNode;
  options: { value: T; label: ReactNode; disabled?: boolean }[];
  value: T;
  onChange: (v: T) => void;
  color?: string;
}) {
  return (
    <div className="w-full min-w-0">
      {label && <div className="mb-1 text-sm font-extrabold">{label}</div>}
      <div role="group" className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={String(o.value)}
              type="button"
              aria-pressed={on}
              disabled={o.disabled}
              onClick={() => onChange(o.value)}
              className="min-h-11 min-w-12 flex-1 rounded-xl border-[3px] px-2 text-sm font-extrabold whitespace-nowrap transition-transform active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35"
              style={{
                borderColor: INK,
                background: on ? color : 'white',
                color: INK,
                boxShadow: on ? `inset 0 3px 0 ${INK}30` : `0 3px 0 ${INK}`,
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Horizontal meter (0–1). Optional threshold tick; `good` decides which side of it is green.
 */
export function Meter({
  label,
  value,
  display,
  threshold,
  good = 'high',
  color,
  height = 18,
}: {
  label: ReactNode;
  value: number;
  display: ReactNode;
  threshold?: number;
  good?: 'high' | 'low';
  color?: string;
  height?: number;
}) {
  const v = clamp(value, 0, 1);
  const ok = threshold === undefined ? true : good === 'high' ? value >= threshold : value <= threshold;
  const fill = color ?? (threshold === undefined ? '#82bdf2' : ok ? '#7fd99a' : '#ff9f9f');
  return (
    <div className="w-full min-w-0">
      <div className="flex items-baseline justify-between gap-2 text-xs font-extrabold">
        <span className="min-w-0">{label}</span>
        <span className="shrink-0 tabular-nums">{display}</span>
      </div>
      <div className="relative mt-0.5 overflow-hidden rounded-full border-[3px] bg-white" style={{ borderColor: INK, height }}>
        <div className="h-full rounded-full transition-[width] duration-300 ease-out" style={{ width: `${v * 100}%`, background: fill }} />
        {threshold !== undefined && (
          <div
            aria-hidden
            className="absolute top-0 bottom-0 w-[3px]"
            style={{ left: `calc(${clamp(threshold, 0, 1) * 100}% - 1.5px)`, background: INK }}
          />
        )}
      </div>
    </div>
  );
}

/** Small "label / big value" tile for scoreboards. */
export function Stat({ label, value, tone = 'info' }: { label: ReactNode; value: ReactNode; tone?: 'good' | 'bad' | 'info' }) {
  const bg = tone === 'good' ? '#d6f5df' : tone === 'bad' ? '#ffe1e1' : '#f4f1fb';
  return (
    <div className="min-w-0 rounded-xl border-[3px] px-2 py-1.5 text-center" style={{ borderColor: INK, background: bg }}>
      <div className="truncate text-[10px] font-extrabold tracking-wide uppercase opacity-70">{label}</div>
      <div className="text-lg leading-tight font-black tabular-nums">{value}</div>
    </div>
  );
}

/** Collapsible hint card (native <details>, so it works with taps and keyboard). */
export function HintCard({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <details className="w-full rounded-2xl border-[3px] border-dashed bg-[#fff8e6] px-3 py-2 text-sm" style={{ borderColor: `${INK}80` }}>
      <summary className="cursor-pointer font-extrabold select-none">💡 {title}</summary>
      <div className="mt-1.5 font-semibold">{children}</div>
    </details>
  );
}

/** requestAnimationFrame loop while `active`; the callback gets the frame delta in seconds. */
export function useRaf(active: boolean, cb: (dt: number, now: number) => void) {
  const cbRef = useRef(cb);
  useEffect(() => {
    cbRef.current = cb;
  });
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      cbRef.current(dt, now);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}

/** Points earned → stars, never below 1. */
export const starsFromPoints = (points: number): 1 | 2 | 3 => (points >= 3 ? 3 : points >= 2 ? 2 : 1);
