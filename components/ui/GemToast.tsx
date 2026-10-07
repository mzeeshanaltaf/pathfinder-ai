'use client';

import { useEffect } from 'react';
import { topicForGem } from '@/data/roadmap';
import { GEM_COLORS, TRACK_COLORS } from '@/lib/palette';
import { useUi } from '@/store/ui';
import { INK } from './kit';

const SHOW_MS = 3000;
/** When several gems are queued, move through them faster. */
const FAST_MS = 1500;

/** Non-blocking "💎 Topic: bite" toast. Collecting several gems quickly queues them. */
export default function GemToast() {
  const head = useUi((s) => s.toastQueue[0]);
  const queued = useUi((s) => s.toastQueue.length);
  const backlog = queued > 1;
  // Paused (and hidden) while a panel or the Passport is open, so toasts never cover them.
  const exploring = useUi((s) => s.mode === 'explore');

  // Restarts when the head changes, or when a backlog first forms (switching to the fast pace).
  useEffect(() => {
    if (!head || !exploring) return;
    const id = window.setTimeout(() => useUi.getState().shiftToast(), backlog ? FAST_MS : SHOW_MS);
    return () => window.clearTimeout(id);
  }, [head, backlog, exploring]);

  const info = head ? topicForGem(head) : undefined;
  if (!info || !exploring) return null;
  const { phase, topic } = info;

  // Mobile: left-aligned so it never covers the minimap (top-right). Desktop: centred.
  return (
    <div
      className="hud-toast pointer-events-none fixed left-2.5 z-35 w-[calc(100vw-130px)] sm:left-1/2 sm:w-[min(400px,calc(100vw-340px))] sm:-translate-x-1/2"
      role="status"
      aria-live="polite"
    >
      <div
        key={head}
        className="animate-[toast-in_220ms_ease-out] rounded-2xl border-[3px] px-3 py-2"
        style={{ borderColor: INK, background: TRACK_COLORS[phase.track].light, color: INK, boxShadow: `0 4px 0 ${INK}` }}
      >
        <div className="flex items-center gap-1.5 text-sm font-extrabold">
          <span style={{ color: GEM_COLORS[phase.track] }}>💎</span>
          <span className="min-w-0 truncate">{topic.label}</span>
          {queued > 1 && <span className="ml-auto shrink-0 text-[11px] font-bold opacity-60">+{queued - 1}</span>}
        </div>
        <p className="line-clamp-2 text-xs leading-snug">{topic.bite}</p>
      </div>
    </div>
  );
}
