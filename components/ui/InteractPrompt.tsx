'use client';

import { useState } from 'react';
import { getPhase } from '@/data/roadmap';
import { isCoarsePointer } from '@/lib/device';
import { TRACK_COLORS } from '@/lib/palette';
import { useUi } from '@/store/ui';
import { INK } from './kit';

/** Lifts the touch prompt above the Jump + E button column (bottom-right) so they never overlap. */
const ABOVE_BUTTONS = 172;

/** "Press E to explore …" when the player stands near a landmark. On touch it's a tappable pill. */
export default function InteractPrompt() {
  const [touch] = useState(isCoarsePointer);
  const nearby = useUi((s) => s.nearbyPhaseId);
  const visible = useUi((s) => s.mode === 'explore' && (s.pointerLocked || touch) && !s.fading);
  if (!nearby || !visible) return null;

  const phase = getPhase(nearby);
  const c = TRACK_COLORS[phase.track];

  if (touch) {
    return (
      <button
        type="button"
        onClick={() => useUi.getState().openPanel(nearby)}
        className="fixed left-1/2 z-20 max-w-[min(60vw,260px)] -translate-x-1/2 animate-[toast-in_200ms_ease-out] rounded-full border-[3px] px-4 py-2 text-sm font-extrabold"
        style={{ bottom: `calc(max(24px, env(safe-area-inset-bottom)) + ${ABOVE_BUTTONS}px)`, borderColor: INK, background: c.light, color: INK, boxShadow: `0 4px 0 ${INK}` }}
      >
        Tap to explore {phase.title}
      </button>
    );
  }

  return (
    <div
      className="pointer-events-none fixed bottom-16 left-1/2 z-20 -translate-x-1/2 animate-[toast-in_200ms_ease-out] rounded-full border-[3px] px-5 py-2.5 text-base font-bold whitespace-nowrap"
      style={{ borderColor: INK, background: 'white', color: INK, boxShadow: `0 4px 0 ${INK}` }}
    >
      Press{' '}
      <kbd className="mx-1 inline-block rounded-md border-2 px-2 font-black" style={{ borderColor: INK, background: c.base }}>
        E
      </kbd>{' '}
      to explore <b>{phase.title}</b>
    </div>
  );
}
