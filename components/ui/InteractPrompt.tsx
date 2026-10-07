'use client';

import { useState } from 'react';
import { MINIGAMES } from '@/data/minigames';
import { getPhase } from '@/data/roadmap';
import { isCoarsePointer } from '@/lib/device';
import { TRACK_COLORS } from '@/lib/palette';
import { useUi } from '@/store/ui';
import { INK } from './kit';

/** Lifts the touch prompt above the Jump + E button column (bottom-right) so they never overlap. */
const ABOVE_BUTTONS = 172;

/**
 * "Press E to explore …" near a landmark, or "Press E to play …" at a Challenge pedestal
 * (the pedestal wins when both are in range). On touch it's a tappable pill.
 */
export default function InteractPrompt() {
  const [touch] = useState(isCoarsePointer);
  const nearby = useUi((s) => s.nearbyPhaseId);
  const challenge = useUi((s) => s.nearbyChallenge);
  const dock = useUi((s) => s.nearbyDock);
  const visible = useUi((s) => s.mode === 'explore' && (s.pointerLocked || touch) && !s.fading);
  // Same priority as the Player's E key: pedestal, then balloon dock, then landmark.
  const id = challenge ?? dock ?? nearby;
  if (!id || !visible) return null;

  const phase = getPhase(id);
  const c = TRACK_COLORS[phase.track];
  const atDock = !challenge && !!dock;
  const verb = challenge ? 'play' : atDock ? 'fly' : 'explore';
  const what = challenge ? `★ ${MINIGAMES[id].title}` : atDock ? '🎈 by balloon' : phase.title;
  const open = () => {
    const ui = useUi.getState();
    if (challenge) ui.openMiniGame(id);
    else if (atDock) ui.setMode('passport');
    else ui.openPanel(id);
  };

  if (touch) {
    return (
      <button
        type="button"
        onClick={open}
        className="fixed left-1/2 z-20 max-w-[min(60vw,260px)] -translate-x-1/2 animate-[toast-in_200ms_ease-out] rounded-full border-[3px] px-4 py-2 text-sm font-extrabold"
        style={{
          bottom: `calc(max(24px, env(safe-area-inset-bottom)) + ${ABOVE_BUTTONS}px)`,
          borderColor: INK,
          background: challenge ? '#ffe9a8' : c.light,
          color: INK,
          boxShadow: `0 4px 0 ${INK}`,
        }}
      >
        Tap to {verb} {what}
      </button>
    );
  }

  return (
    <div
      key={`${verb}-${id}`}
      className="pointer-events-none fixed bottom-16 left-1/2 z-20 -translate-x-1/2 animate-[toast-in_200ms_ease-out] rounded-full border-[3px] px-5 py-2.5 text-base font-bold whitespace-nowrap"
      style={{ borderColor: INK, background: challenge ? '#fff6d8' : 'white', color: INK, boxShadow: `0 4px 0 ${INK}` }}
    >
      Press{' '}
      <kbd className="mx-1 inline-block rounded-md border-2 px-2 font-black" style={{ borderColor: INK, background: challenge ? '#ffc93c' : c.base }}>
        E
      </kbd>{' '}
      to {verb} <b>{what}</b>
    </div>
  );
}
