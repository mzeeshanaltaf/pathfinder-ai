'use client';

import { useEffect, useState } from 'react';
import { finishMiniGame } from '@/components/minigames/complete';
import { playerEvents, playerPose } from '@/components/player/playerState';
import { isCoarsePointer } from '@/lib/device';
import { TRACK_COLORS } from '@/lib/palette';
import { useUi, type TutorialSteps } from '@/store/ui';
import { INK } from './kit';

export const TUTORIAL_STEPS = (touch: boolean) =>
  [
    { key: 'look', icon: '👀', text: touch ? 'Look around: drag on the right side of the screen' : 'Look around: move the mouse' },
    { key: 'jump', icon: '🦘', text: touch ? 'Jump: tap the JUMP button' : 'Jump: press Space' },
    { key: 'passport', icon: '📖', text: touch ? 'Open your Skill Passport: tap 📖' : 'Open your Skill Passport: press P' },
  ] as const satisfies readonly { key: keyof TutorialSteps; icon: string; text: string }[];

/** Total turning (radians, any direction) that counts as "looked around": ~57°, about one swipe on a phone. */
const LOOK_TOTAL = 1.0;
const FINISH_DELAY_MS = 900;

/**
 * Harbor tutorial checklist. Watches the player (yaw, jump count, Passport) in its own rAF
 * loop and writes to the store only when a step flips. When all three are done it awards the
 * badge and opens the result screen.
 */
export default function TutorialTracker() {
  const [touch] = useState(isCoarsePointer);
  const steps = useUi((s) => s.tutorial);
  const active = steps !== null;
  const visible = useUi((s) => s.mode === 'explore' && !s.fading);

  useEffect(() => {
    if (!active) return;
    let lastYaw = playerPose.yaw;
    let turned = 0;
    const jumps0 = playerEvents.jumps;
    let finishTimer: number | undefined;
    let raf = 0;

    const tick = () => {
      const ui = useUi.getState();
      const cur = ui.tutorial;
      if (!cur) return;
      const d = playerPose.yaw - lastYaw;
      turned += Math.abs(Math.atan2(Math.sin(d), Math.cos(d)));
      lastYaw = playerPose.yaw;

      const next: TutorialSteps = {
        look: cur.look || turned > LOOK_TOTAL,
        jump: cur.jump || playerEvents.jumps > jumps0,
        passport: cur.passport || ui.mode === 'passport',
      };
      if (next.look !== cur.look || next.jump !== cur.jump || next.passport !== cur.passport) ui.setTutorial(next);

      if (next.look && next.jump && next.passport) {
        finishTimer = window.setTimeout(() => {
          useUi.getState().setTutorial(null);
          finishMiniGame('harbor', { score: 100, stars: 3 });
        }, FINISH_DELAY_MS);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(finishTimer);
    };
  }, [active]);

  if (!steps || !visible) return null;
  const done = TUTORIAL_STEPS(touch).filter((s) => steps[s.key]).length;

  return (
    <div
      className="pointer-events-none fixed z-25 w-60 max-w-[calc(100vw-130px)] rounded-2xl border-[3px] bg-white/95 px-3 py-2 animate-[toast-in_200ms_ease-out]"
      style={{
        left: 'max(10px, env(safe-area-inset-left))',
        top: 'calc(max(10px, env(safe-area-inset-top)) + 150px)',
        borderColor: INK,
        color: INK,
        boxShadow: `0 3px 0 ${INK}`,
      }}
      role="status"
      aria-label={`First Steps: ${done} of 3 done`}
    >
      <div className="text-[11px] font-extrabold tracking-wide uppercase" style={{ color: TRACK_COLORS.meta.dark }}>
        First Steps · {done}/3
      </div>
      <ul className="mt-1 flex flex-col gap-1">
        {TUTORIAL_STEPS(touch).map((s) => {
          const ok = steps[s.key];
          return (
            <li key={s.key} className={`flex items-start gap-1.5 text-xs leading-snug font-bold ${ok ? 'opacity-60' : ''}`}>
              <span
                className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 text-[10px]"
                style={{ borderColor: INK, background: ok ? '#7fd99a' : 'white' }}
                aria-hidden
              >
                {ok ? '✓' : ''}
              </span>
              <span className={ok ? 'line-through' : ''}>{s.text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
