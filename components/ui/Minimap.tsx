'use client';

import { useEffect, useRef } from 'react';
import { playerPose } from '@/components/player/playerState';
import { BRIDGES, ISLAND_BY_ID, ISLAND_TRACK, ISLANDS } from '@/data/world';
import { TRACK_COLORS } from '@/lib/palette';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';
import { INK } from './kit';

// Top-down view: world X → map x, world Z → map y (so "north" on the map is −Z, towards the Summit).
const PAD = 14;
const minX = Math.min(...ISLANDS.map((i) => i.position[0] - i.radius)) - PAD;
const maxX = Math.max(...ISLANDS.map((i) => i.position[0] + i.radius)) + PAD;
const minZ = Math.min(...ISLANDS.map((i) => i.position[2] - i.radius)) - PAD;
const maxZ = Math.max(...ISLANDS.map((i) => i.position[2] + i.radius)) + PAD;
const VIEW_W = maxX - minX;
const VIEW_H = maxZ - minZ;

/** Small top-down map of the islands, bridges and the player's position + heading. */
export default function Minimap() {
  const visited = useProgress((s) => s.visited);
  const current = useUi((s) => s.currentIsland);
  const show = useUi((s) => s.worldReady && s.mode === 'explore');
  const playerRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!show) return;
    let raf = 0;
    const tick = () => {
      // Arrow points up at yaw 0 (looking −Z); SVG rotation is clockwise, yaw is counter-clockwise.
      playerRef.current?.setAttribute(
        'transform',
        `translate(${playerPose.x.toFixed(1)} ${playerPose.z.toFixed(1)}) rotate(${((-playerPose.yaw * 180) / Math.PI).toFixed(1)})`,
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="pointer-events-none fixed z-20 rounded-2xl border-[3px] bg-sky-100/85 p-1"
      style={{
        right: 'max(10px, env(safe-area-inset-right))',
        top: 'calc(max(10px, env(safe-area-inset-top)) + 64px)',
        borderColor: INK,
        boxShadow: `0 3px 0 ${INK}`,
      }}
      aria-hidden
    >
      <svg viewBox={`${minX} ${minZ} ${VIEW_W} ${VIEW_H}`} className="block h-32.5 w-auto sm:h-47.5"
        style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
      >
        {BRIDGES.map((b) => {
          const a = ISLAND_BY_ID[b.from].position;
          const c = ISLAND_BY_ID[b.to].position;
          return <line key={`${b.from}-${b.to}`} x1={a[0]} y1={a[2]} x2={c[0]} y2={c[2]} stroke="#b08560" strokeWidth={4} strokeLinecap="round" />;
        })}
        {ISLANDS.map((i) => {
          const colors = TRACK_COLORS[ISLAND_TRACK[i.id]];
          const seen = !!visited[i.id];
          return (
            <circle
              key={i.id}
              cx={i.position[0]}
              cy={i.position[2]}
              r={i.radius}
              fill={seen ? colors.base : '#ffffff'}
              fillOpacity={seen ? 1 : 0.55}
              stroke={current === i.id ? INK : colors.dark}
              strokeWidth={current === i.id ? 5 : 3.5}
            />
          );
        })}
        <g ref={playerRef}>
          <circle r={13} fill="#ffffff" stroke={INK} strokeWidth={3} />
          <path d="M0 -21 L10 6 L0 0 L-10 6 Z" fill="#ff5d8f" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}
