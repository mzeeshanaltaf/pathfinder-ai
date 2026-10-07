'use client';

import { useEffect } from 'react';
import { cinematicControl } from '@/components/player/playerState';
import { getPhase } from '@/data/roadmap';
import { TRACK_COLORS } from '@/lib/palette';
import { useUi } from '@/store/ui';
import { INK } from './kit';

/** Caption + Skip control while a cinematic (balloon flight, Summit fly-around) runs. Space / Enter / Esc also skip. */
export default function CinematicOverlay() {
  const cine = useUi((s) => (s.mode === 'cinematic' ? s.cinematic : null));

  useEffect(() => {
    if (!cine) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
        e.preventDefault();
        cinematicControl.skip = true;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cine]);

  if (!cine) return null;
  const balloon = cine.kind === 'balloon';
  const phase = balloon ? getPhase(cine.to) : null;
  const text = balloon ? `🎈 Flying to ${phase!.title}…` : '🎆 You reached the Summit!';
  const tint = phase ? TRACK_COLORS[phase.track].light : '#fff1c4';

  return (
    <>
      {/* Letterbox bars. */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-[7vh] bg-[#3d3452]/80 animate-[toast-in_300ms_ease-out]" aria-hidden />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-[7vh] bg-[#3d3452]/80 animate-[toast-in_300ms_ease-out]" aria-hidden />
      <div
        className="fixed inset-x-0 z-35 flex items-center justify-center gap-2 px-3"
        style={{ bottom: 'calc(7vh + max(12px, env(safe-area-inset-bottom)))' }}
        role="status"
      >
        <span className="rounded-full border-[3px] px-4 py-2 text-sm font-extrabold sm:text-base" style={{ borderColor: INK, background: tint, color: INK, boxShadow: `0 3px 0 ${INK}` }}>
          {text}
        </span>
        <button
          type="button"
          onClick={() => {
            cinematicControl.skip = true;
          }}
          className="min-h-11 rounded-full border-[3px] bg-white px-4 text-sm font-extrabold active:translate-y-0.5"
          style={{ borderColor: INK, color: INK, boxShadow: `0 3px 0 ${INK}` }}
        >
          Skip ▸▸<span className="hidden opacity-60 sm:inline"> · Space</span>
        </button>
      </div>
    </>
  );
}
