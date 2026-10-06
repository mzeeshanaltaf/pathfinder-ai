'use client';

import { useEffect } from 'react';
import { getPhase } from '@/data/roadmap';
import { TRACK_COLORS } from '@/lib/palette';
import { useUi } from '@/store/ui';
import { INK, TrackBadge, useTotals } from './kit';

export function openPassport() {
  useUi.getState().setMode('passport');
}

/** Global overlay keys: P toggles the Passport, Esc closes any panel or mini-game. */
function useOverlayKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const ui = useUi.getState();
      if (e.code === 'KeyP') {
        if (ui.mode === 'explore' || ui.mode === 'panel') openPassport();
        else if (ui.mode === 'passport') ui.closeOverlay();
      } else if (e.code === 'Escape' && (ui.mode === 'panel' || ui.mode === 'passport' || ui.mode === 'minigame')) {
        // Esc can't re-grab the mouse (not a user activation); the "Click to explore" card handles that.
        ui.closeOverlay();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

function Pill({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border-[3px] bg-white/95 px-2.5 py-1.5 ${className}`}
      style={{ borderColor: INK, color: INK, boxShadow: `0 3px 0 ${INK}` }}
    >
      {children}
    </div>
  );
}

export default function HUD() {
  useOverlayKeys();
  const island = useUi((s) => s.currentIsland);
  const mode = useUi((s) => s.mode);
  const ready = useUi((s) => s.worldReady);
  const { gems, gemTotal, badges, badgeTotal } = useTotals();
  if (!ready || mode === 'panel' || mode === 'passport' || mode === 'minigame') return null;

  const phase = island ? getPhase(island) : null;

  return (
    <>
      {/* Top-left: where am I */}
      <div
        className="pointer-events-none fixed z-25 max-w-[calc(50vw-12px)] sm:max-w-xs"
        style={{ left: 'max(10px, env(safe-area-inset-left))', top: 'max(10px, env(safe-area-inset-top))' }}
      >
        <Pill>
          {phase ? (
            <>
              <div className="truncate text-sm leading-tight font-extrabold sm:text-base">{phase.title}</div>
              <TrackBadge track={phase.track} className="mt-1 max-w-full truncate" />
            </>
          ) : (
            <div className="text-sm font-bold opacity-70">Between islands</div>
          )}
        </Pill>
      </div>

      {/* Top-right: progress + Passport */}
      <div
        className="fixed z-25 flex items-start gap-1.5"
        style={{ right: 'max(10px, env(safe-area-inset-right))', top: 'max(10px, env(safe-area-inset-top))' }}
      >
        <Pill className="pointer-events-none flex flex-col items-end gap-0.5 text-xs font-extrabold sm:flex-row sm:items-center sm:gap-3 sm:text-sm">
          <span title="Skill Gems collected">
            💎 {gems}
            <span className="opacity-50">/{gemTotal}</span>
          </span>
          <span title="Badges earned">
            🏅 {badges}
            <span className="opacity-50">/{badgeTotal}</span>
          </span>
        </Pill>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openPassport();
          }}
          aria-label="Open Skill Passport (P)"
          className="flex h-11 min-w-11 items-center justify-center gap-1 rounded-2xl border-[3px] px-2 text-sm font-extrabold active:translate-y-0.5"
          style={{ borderColor: INK, background: TRACK_COLORS.meta.light, color: INK, boxShadow: `0 3px 0 ${INK}` }}
        >
          <span aria-hidden className="text-lg">
            📖
          </span>
          <span className="hidden sm:inline">Passport</span>
          <kbd className="hidden rounded border-2 px-1 text-[10px] sm:inline" style={{ borderColor: INK }}>
            P
          </kbd>
        </button>
      </div>
    </>
  );
}
