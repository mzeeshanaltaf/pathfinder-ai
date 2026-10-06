'use client';

import { useState, type ComponentType } from 'react';
import { INK, resumeExplore } from '@/components/ui/kit';
import { TUTORIAL_STEPS } from '@/components/ui/TutorialTracker';
import type { TutorialConfig } from '@/data/minigames';
import { isCoarsePointer } from '@/lib/device';
import { TRACK_COLORS } from '@/lib/palette';
import { useUi } from '@/store/ui';
import { GameButton } from './kit';
import type { MiniGameProps } from './types';

/**
 * Harbor tutorial. The checks happen in the world, so "Let's go!" hands control back to the
 * player; `TutorialTracker` (HUD) ticks the steps off and reports the result when all three are done.
 */
const Tutorial: ComponentType<MiniGameProps<TutorialConfig>> = () => {
  const [touch] = useState(isCoarsePointer);
  const go = () => {
    useUi.getState().setTutorial({ look: false, jump: false, passport: false });
    resumeExplore();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="max-w-md text-center text-sm font-semibold">Three quick checks and the first badge is yours:</p>
      <ol className="flex w-full max-w-md flex-col gap-2">
        {TUTORIAL_STEPS(touch).map((s, i) => (
          <li
            key={s.key}
            className="flex items-center gap-3 rounded-2xl border-[3px] bg-white px-3 py-2 text-sm font-bold"
            style={{ borderColor: INK }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-base"
              style={{ borderColor: INK, background: TRACK_COLORS.meta.light }}
              aria-hidden
            >
              {s.icon}
            </span>
            <span>
              {i + 1}. {s.text}
            </span>
          </li>
        ))}
      </ol>
      <GameButton onClick={go} color={TRACK_COLORS.meta.base}>
        Let&apos;s go! ▶
      </GameButton>
      <p className="text-xs font-bold opacity-60">A checklist stays on screen while you try.</p>
    </div>
  );
};

export default Tutorial;
