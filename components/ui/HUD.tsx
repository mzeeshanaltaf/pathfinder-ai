'use client';

import { useEffect, useState } from 'react';
import { getPhase } from '@/data/roadmap';
import { TRACK_COLORS } from '@/lib/palette';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';
import { isCoarsePointer } from '@/lib/device';
import { toggleControlsHint } from './ControlsHint';
import { INK, TrackBadge, useTotals } from './kit';

export function openPassport() {
  useUi.getState().openPassport();
}

export function toggleMute() {
  const p = useProgress.getState();
  p.setSetting('muted', !p.settings.muted);
}

/**
 * Global overlay keys: P toggles the Passport, M toggles sound, H toggles the controls hint.
 * Esc goes back one level: island guide → Passport (when opened from it), else closes the panel,
 * game or menu; while exploring it closes the gem card.
 */
function useOverlayKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const ui = useUi.getState();
      if (e.code === 'KeyP') {
        if (ui.mode === 'explore' || ui.mode === 'panel') openPassport();
        else if (ui.mode === 'passport') ui.closeOverlay();
      } else if (e.code === 'KeyM') {
        toggleMute();
      } else if (e.code === 'KeyH') {
        if (ui.mode === 'explore') toggleControlsHint();
      } else if (e.code === 'Escape') {
        if (ui.mode === 'panel' && ui.panelFrom === 'passport') ui.backToPassport();
        else if (ui.mode === 'panel' || ui.mode === 'passport' || ui.mode === 'minigame') ui.closeOverlay();
        else if (ui.mode === 'menu' && ui.menu !== 'onboarding') ui.closeOverlay();
        else if (ui.mode === 'explore' && ui.gemCard) ui.closeGemCard();
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

function RoundButton({ onClick, label, children, tint = 'white' }: { onClick: () => void; label: string; children: React.ReactNode; tint?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      title={label}
      className="flex h-11 min-w-11 items-center justify-center gap-1 rounded-2xl border-[3px] px-2 text-sm font-extrabold active:translate-y-0.5"
      style={{ borderColor: INK, background: tint, color: INK, boxShadow: `0 3px 0 ${INK}` }}
    >
      {children}
    </button>
  );
}

export default function HUD() {
  useOverlayKeys();
  const island = useUi((s) => s.currentIsland);
  const mode = useUi((s) => s.mode);
  const ready = useUi((s) => s.worldReady);
  const streak = useProgress((s) => s.streak.count);
  const muted = useProgress((s) => s.settings.muted);
  const { gems, gemTotal, badges, badgeTotal } = useTotals();
  const [touch] = useState(isCoarsePointer);
  if (!ready || mode !== 'explore') return null;

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
              <div className="truncate text-xs font-bold opacity-70 sm:text-sm">{phase.subtitle}</div>
              <TrackBadge track={phase.track} className="mt-1 max-w-full truncate" />
            </>
          ) : (
            <div className="text-sm font-bold opacity-70">Between islands</div>
          )}
        </Pill>
      </div>

      {/* Top-right: progress, streak, sound, settings, Passport */}
      <div
        className="fixed z-25 flex items-start gap-1.5"
        style={{ right: 'max(10px, env(safe-area-inset-right))', top: 'max(10px, env(safe-area-inset-top))' }}
      >
        <Pill className="pointer-events-none flex flex-col items-end gap-0.5 text-xs font-extrabold sm:flex-row sm:items-center sm:gap-3 sm:text-sm">
          <span title="Skill Gems collected">
            💎 {gems}
            <span className="hidden opacity-50 sm:inline">/{gemTotal}</span>
          </span>
          <span title="Badges earned">
            🏅 {badges}
            <span className="hidden opacity-50 sm:inline">/{badgeTotal}</span>
          </span>
          <span title={`${streak}-day streak`} aria-label={`${streak}-day streak`}>
            <span className={streak > 1 ? 'inline-block animate-[flame_1.2s_ease-in-out_infinite]' : ''}>🔥</span> {streak}
          </span>
        </Pill>
        <div className="flex flex-col gap-1.5 sm:flex-row">
          <RoundButton onClick={toggleMute} label={muted ? 'Sound off (M)' : 'Sound on (M)'}>
            <span aria-hidden className="text-lg">
              {muted ? '🔇' : '🔊'}
            </span>
          </RoundButton>
          <RoundButton onClick={() => useUi.getState().openMenu('settings')} label="Settings">
            <span aria-hidden className="text-lg">
              ⚙️
            </span>
          </RoundButton>
          {!touch && (
            <RoundButton onClick={toggleControlsHint} label="Show controls (H)">
              <span aria-hidden className="text-lg">
                ⌨
              </span>
            </RoundButton>
          )}
        </div>
        {/* Phones stack these two (like sound / settings) so the row never reaches the island pill. */}
        <div className="flex flex-col gap-1.5 sm:flex-row-reverse">
          <RoundButton onClick={openPassport} label="Open Skill Passport (P)" tint={TRACK_COLORS.meta.light}>
            <span aria-hidden className="text-lg">
              📖
            </span>
            <span className="hidden sm:inline">Passport</span>
            <kbd className="hidden rounded border-2 px-1 text-[10px] sm:inline" style={{ borderColor: INK }}>
              P
            </kbd>
          </RoundButton>
          <RoundButton onClick={() => useUi.getState().openPassport('roadmap')} label="Full roadmap" tint={TRACK_COLORS.meta.light}>
            <span aria-hidden className="text-lg">
              📜
            </span>
          </RoundButton>
        </div>
      </div>
    </>
  );
}
