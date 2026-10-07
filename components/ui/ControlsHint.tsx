'use client';

import { useEffect, useState } from 'react';
import { playerPose } from '@/components/player/playerState';
import { isCoarsePointer } from '@/lib/device';
import { useUi } from '@/store/ui';
import { INK } from './kit';

/** Seconds of walking after which the hint tucks itself away. */
const HIDE_AFTER_MOVING = 8;
const TOGGLE_EVENT = 'pathfinder:controls-hint';

/** Show / hide the controls hint (HUD ⌨ button, H key). */
export function toggleControlsHint() {
  window.dispatchEvent(new Event(TOGGLE_EVENT));
}

const KEYS: [string, string][] = [
  ['WASD / Arrows', 'move & turn'],
  ['Space', 'jump'],
  ['Shift', 'sprint'],
  ['E', 'interact'],
  ['P', 'passport'],
];

/** Desktop only: a small controls pill at the bottom centre. Touch devices use the on-screen controls. */
export default function ControlsHint() {
  const [touch] = useState(isCoarsePointer);
  if (touch) return null;
  return <Hint />;
}

function Hint() {
  const [shown, setShown] = useState(true);
  // Only the first showing tucks itself away; once reopened by hand it stays until H / ⌨ again.
  const [auto, setAuto] = useState(true);
  const visible = useUi((s) => s.mode === 'explore' && s.worldReady && !s.fading);

  useEffect(() => {
    const onToggle = () => {
      setAuto(false);
      setShown((v) => !v);
    };
    window.addEventListener(TOGGLE_EVENT, onToggle);
    return () => window.removeEventListener(TOGGLE_EVENT, onToggle);
  }, []);

  // Count time spent actually moving (not just time on screen); hide once the player has the hang of it.
  useEffect(() => {
    if (!shown || !visible || !auto) return;
    let moving = 0;
    let last = performance.now();
    let px = playerPose.x;
    let pz = playerPose.z;
    let raf = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (Math.hypot(playerPose.x - px, playerPose.z - pz) > 0.02) moving += dt;
      px = playerPose.x;
      pz = playerPose.z;
      if (moving >= HIDE_AFTER_MOVING) {
        setShown(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shown, visible, auto]);

  if (!shown || !visible) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-3 left-1/2 z-15 max-w-[calc(100vw-24px)] -translate-x-1/2 animate-[toast-in_200ms_ease-out] rounded-full border-[3px] bg-white/92 px-3 py-1 text-xs font-bold whitespace-nowrap"
      style={{ borderColor: INK, color: INK, boxShadow: `0 3px 0 ${INK}` }}
      role="note"
      aria-label="Controls"
      data-controls-hint
    >
      {KEYS.map(([k, v], i) => (
        <span key={k}>
          {i > 0 && <span className="mx-1.5 opacity-40">·</span>}
          <kbd className="rounded border-2 px-1 font-black" style={{ borderColor: INK }}>
            {k}
          </kbd>{' '}
          {v}
        </span>
      ))}
      <span className="mx-1.5 opacity-40">·</span>
      <span className="opacity-60">H hides</span>
    </div>
  );
}
