'use client';

import { topicForGem } from '@/data/roadmap';
import { GEM_COLORS, TRACK_COLORS } from '@/lib/palette';
import { useUi } from '@/store/ui';
import { CloseButton, INK, usePhaseGems } from './kit';

/**
 * "💎 Topic: bite" card for the last gem collected. It stays until closed (✕ or Esc); a new gem
 * replaces it. Hidden, not cleared, while an overlay is open, so it never covers one.
 */
export default function GemToast() {
  const id = useUi((s) => s.gemCard);
  const exploring = useUi((s) => s.mode === 'explore');
  const belowTracker = useUi((s) => s.tutorial !== null && !s.fading);
  const info = id ? topicForGem(id) : undefined;
  if (!id || !info || !exploring) return null;
  return <GemCard key={id} gem={id} info={info} belowTracker={belowTracker} />;
}

function GemCard({ gem, info, belowTracker }: { gem: string; info: NonNullable<ReturnType<typeof topicForGem>>; belowTracker: boolean }) {
  const { phase, topic } = info;
  const { found, total } = usePhaseGems(phase.id);

  // Mobile: left-aligned so it never covers the minimap (top-right). Desktop: centred.
  return (
    <div
      className="hud-toast fixed left-2.5 z-35 w-[calc(100vw-130px)] sm:left-1/2 sm:w-[min(420px,calc(100vw-340px))] sm:-translate-x-1/2"
      data-below-tracker={belowTracker || undefined}
      role="status"
      aria-live="polite"
      data-gem={gem}
    >
      <div
        className="pointer-events-auto flex animate-[toast-in_220ms_ease-out] items-start gap-2 rounded-2xl border-[3px] py-2 pr-1.5 pl-3"
        style={{ borderColor: INK, background: TRACK_COLORS[phase.track].light, color: INK, boxShadow: `0 4px 0 ${INK}` }}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-sm leading-tight font-extrabold">
            <span style={{ color: GEM_COLORS[phase.track] }} aria-hidden>
              💎
            </span>
            <span className="min-w-0 wrap-break-word">{topic.label}</span>
          </div>
          <p className="mt-0.5 text-xs leading-snug">{topic.bite}</p>
          <p className="mt-1 text-[11px] font-bold opacity-65">
            {phase.title} · {found}/{total} gems
          </p>
        </div>
        <CloseButton onClick={() => useUi.getState().closeGemCard()} label="Close gem card" />
      </div>
    </div>
  );
}
