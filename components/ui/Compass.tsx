'use client';

import { useEffect, useRef } from 'react';
import { playerPose } from '@/components/player/playerState';
import { getPhase } from '@/data/roadmap';
import { ISLAND_BY_ID } from '@/data/world';
import { TRACK_COLORS } from '@/lib/palette';
import { suggestedNext } from '@/lib/progress';
import { challengePosition } from '@/lib/worldLayout';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';
import { INK } from './kit';

/**
 * HUD compass: an arrow towards the suggested next island, with its distance. Once the player
 * stands on that island it points at the island's Challenge pedestal instead (earning the badge
 * is what moves the suggestion on).
 */
export default function Compass() {
  const show = useUi((s) => s.worldReady && s.mode === 'explore');
  const target = useProgress((s) => suggestedNext(s));
  const here = useUi((s) => s.currentIsland);
  const arrow = useRef<SVGSVGElement>(null);
  const dist = useRef<HTMLSpanElement>(null);
  const onTarget = !!target && here === target;

  useEffect(() => {
    if (!show || !target) return;
    const def = ISLAND_BY_ID[target];
    const [tx, , tz] = onTarget ? challengePosition(def) : def.position;
    let raf = 0;
    let lastText = '';
    const tick = () => {
      const dx = tx - playerPose.x;
      const dz = tz - playerPose.z;
      // Same convention as the player's yaw: 0 = looking towards −Z, positive = turned left.
      const bearing = Math.atan2(-dx, -dz);
      const rel = bearing - playerPose.yaw;
      arrow.current?.style.setProperty('transform', `rotate(${(-rel * 180) / Math.PI}deg)`);
      const text = `${Math.round(Math.hypot(dx, dz))} m`;
      if (text !== lastText && dist.current) {
        dist.current.textContent = text;
        lastText = text;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [show, target, onTarget]);

  if (!show || !target) return null;
  const phase = getPhase(target);
  const c = TRACK_COLORS[phase.track];

  return (
    <div
      className="hud-compass pointer-events-none fixed z-25 flex max-w-[calc(50vw-12px)] items-center gap-2 rounded-2xl border-[3px] bg-white/95 py-1 pr-3 pl-1.5 sm:max-w-xs"
      style={{ borderColor: INK, color: INK, boxShadow: `0 3px 0 ${INK}` }}
      role="status"
      aria-label={`Suggested next: ${phase.title}`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2" style={{ borderColor: INK, background: c.light }}>
        <svg ref={arrow} width="22" height="22" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 2 L19 20 L12 15.5 L5 20 Z" fill="#ff5d8f" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block text-[10px] font-extrabold whitespace-nowrap opacity-60">
          <span className="tracking-wide uppercase">{onTarget ? 'The Challenge' : 'Next stop'}</span> · <span ref={dist} className="tabular-nums" />
        </span>
        <span className="block truncate text-sm font-extrabold">
          {onTarget ? '★ ' : ''}
          {phase.title}
        </span>
      </span>
    </div>
  );
}
