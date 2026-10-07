'use client';

import { useEffect } from 'react';
import { sfx } from '@/lib/audio';
import { useUi } from '@/store/ui';
import { INK } from './kit';

const SHOW_MS = 3600;

/** Celebratory toast for achievements, streak milestones and new hats (queued, one at a time). */
export default function NoticeToast() {
  const head = useUi((s) => s.notices[0]);
  const exploring = useUi((s) => s.mode === 'explore' && s.worldReady);

  useEffect(() => {
    if (!head || !exploring) return;
    sfx.achievement();
    const id = window.setTimeout(() => useUi.getState().shiftNotice(), SHOW_MS);
    return () => window.clearTimeout(id);
  }, [head, exploring]);

  if (!head || !exploring) return null;

  return (
    <div
      className="pointer-events-none fixed left-1/2 z-35 w-[min(360px,calc(100vw-24px))] -translate-x-1/2 bottom-[calc(max(24px,env(safe-area-inset-bottom))+236px)] sm:bottom-32"
      role="status"
      aria-live="polite"
    >
      <div
        key={head.key}
        className="flex animate-[drop-in_350ms_cubic-bezier(.2,1.4,.5,1)] items-center gap-3 rounded-2xl border-[3px] px-3 py-2"
        style={{ borderColor: INK, background: '#fff6d8', color: INK, boxShadow: `0 4px 0 ${INK}` }}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] text-2xl" style={{ borderColor: INK, background: '#ffc93c' }} aria-hidden>
          {head.icon}
        </span>
        <div className="min-w-0">
          <div className="text-[10px] font-extrabold tracking-wider uppercase opacity-60">{head.title}</div>
          <div className="text-sm leading-snug font-extrabold">{head.text}</div>
        </div>
      </div>
    </div>
  );
}
