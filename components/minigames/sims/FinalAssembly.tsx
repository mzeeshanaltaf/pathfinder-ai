'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { INK, SectionTitle } from '@/components/ui/kit';
import { getPhase } from '@/data/roadmap';
import type { FinalAssemblyConfig } from '@/data/sims';
import { shuffle } from '../complete';
import { Feedback, GameButton, useDragDrop } from '../kit';
import type { MiniGameProps } from '../types';
import { GOLD, GOOD, trackColors } from './simKit';

type From = 'tray' | string;
const slotKey = (row: number, col: number) => `${row}-${col}`;

export default function FinalAssembly({ phaseId, config, onComplete }: MiniGameProps<FinalAssemblyConfig>) {
  const colors = trackColors(phaseId);
  const { layers } = config;
  const bites = useMemo(() => new Map(getPhase(phaseId).groups.flatMap((g) => g.topics.map((t) => [t.label, t.bite] as const))), [phaseId]);
  const rowOf = useMemo(() => new Map(layers.flatMap((l, r) => l.slots.map((s) => [s, r] as const))), [layers]);
  const [tiles] = useState(() => shuffle(layers.flatMap((l) => l.slots)));
  const [placed, setPlaced] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(layers.flatMap((l, r) => l.slots.map((_, c) => [slotKey(r, c), null]))),
  );
  const [locked, setLocked] = useState<Set<string>>(() => new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Bring the Summit moment into view once the platform is complete.
  useEffect(() => {
    if (solved) bannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [solved]);

  const inSlots = new Set(Object.values(placed).filter(Boolean) as string[]);
  const tray = tiles.filter((t) => !inSlots.has(t));
  const full = tray.length === 0;

  const place = (tile: string, key: string, from: From) => {
    if (locked.has(key) || solved) return;
    setPlaced((p) => {
      const next = { ...p };
      const displaced = next[key];
      if (from !== 'tray') next[from] = displaced; // swap between slots
      next[key] = tile;
      return next;
    });
    setSelected(null);
    setWrong([]);
  };
  const remove = (key: string) => {
    if (locked.has(key) || solved) return;
    setPlaced((p) => ({ ...p, [key]: null }));
    setWrong([]);
  };

  const { bind, ghost, over } = useDragDrop<{ tile: string; from: From }>({
    onTap: ({ tile, from }) => {
      if (from === 'tray') setSelected((s) => (s === tile ? null : tile));
      else remove(from);
    },
    onDrop: ({ tile, from }, target) => {
      if (target?.startsWith('slot-')) place(tile, target.slice(5), from);
      else if (target === 'tray' && from !== 'tray') remove(from);
    },
  });

  const check = () => {
    const n = attempts + 1;
    setAttempts(n);
    const bad: string[] = [];
    const nextLocked = new Set(locked);
    const next = { ...placed };
    for (const [key, tile] of Object.entries(placed)) {
      if (!tile) continue;
      if (rowOf.get(tile) === Number(key.split('-')[0])) nextLocked.add(key);
      else {
        bad.push(tile);
        next[key] = null;
      }
    }
    setLocked(nextLocked);
    setPlaced(next);
    setWrong(bad);
    if (bad.length === 0) setSolved(true);
  };

  const finish = () => onComplete({ score: Math.max(25, 100 - 25 * (attempts - 1)), stars: attempts <= 1 ? 3 : attempts === 2 ? 2 : 1 });

  const tileView = (tile: string, state: 'idle' | 'locked' | 'selected' = 'idle') => (
    <span
      className="flex min-h-11 w-full items-center justify-center gap-1 rounded-xl border-[3px] px-2 py-1 text-center text-[13px] leading-tight font-extrabold wrap-break-word"
      style={{
        borderColor: INK,
        background: state === 'locked' ? '#d6f5df' : state === 'selected' ? GOLD : colors.light,
        boxShadow: state === 'locked' ? 'none' : `0 3px 0 ${INK}`,
      }}
    >
      {state === 'locked' && <span aria-hidden>🔒</span>}
      {tile}
    </span>
  );

  return (
    <div className="relative flex flex-col items-center gap-3">
      {!solved && (
        <p className="w-full text-sm font-semibold">
          {selected ? (
            <>
              Now tap a slot for <b>{selected}</b>.
            </>
          ) : (
            'Drag a component into its layer, or tap it and then tap a slot.'
          )}
        </p>
      )}

      <section className="w-full" aria-label="Production AI architecture">
        {layers.map((layer, r) => (
          <Fragment key={r}>
            {r > 0 && (
              <div aria-hidden className="relative flex h-5 justify-center text-sm leading-5 font-black" style={{ color: colors.dark }}>
                ↓{solved && <span className="absolute top-0 h-2.5 w-2.5 rounded-full animate-[flow-down_1.6s_linear_infinite]" style={{ background: GOLD, border: `2px solid ${INK}`, animationDelay: `${r * 0.2}s` }} />}
              </div>
            )}
            <div className="rounded-2xl border-[3px] border-dashed p-1.5" style={{ borderColor: solved ? GOOD : `${INK}40`, background: solved ? '#f0fbf3' : '#ffffff90' }}>
              <div className="mb-1 px-1 text-[11px] font-bold opacity-70">{layer.hint}</div>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${layer.slots.length}, minmax(0, 1fr))` }}>
                {layer.slots.map((_, c) => {
                  const key = slotKey(r, c);
                  const tile = placed[key];
                  const isLocked = locked.has(key);
                  return (
                    <div key={key} data-drop={`slot-${key}`} className="min-w-0">
                      {tile ? (
                        <button
                          type="button"
                          aria-label={`${tile}${isLocked ? ' (locked)' : ', tap to remove'}`}
                          disabled={isLocked || solved}
                          className="w-full select-none"
                          {...bind({ tile, from: key }, tileView(tile), !isLocked && !solved)}
                        >
                          {tileView(tile, isLocked ? 'locked' : 'idle')}
                        </button>
                      ) : (
                        <button
                          type="button"
                          aria-label={`Empty slot in layer ${r + 1}${selected ? `: place ${selected}` : ''}`}
                          onClick={() => selected && place(selected, key, 'tray')}
                          className="flex min-h-11 w-full items-center justify-center rounded-xl border-[3px] border-dashed text-xs font-bold transition-colors"
                          style={{
                            borderColor: over === `slot-${key}` || selected ? INK : `${INK}35`,
                            background: over === `slot-${key}` ? colors.light : selected ? '#fff8e0' : 'transparent',
                            color: `${INK}70`,
                          }}
                        >
                          {selected ? 'tap to place' : `Layer ${r + 1}`}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Fragment>
        ))}
      </section>

      {!solved && (
        <section
          data-drop="tray"
          aria-label="Components"
          // Sticky, so components stay in reach while the layers scroll (drag from here to any visible slot).
          className="sticky bottom-0 z-10 max-h-[38vh] w-full overflow-y-auto rounded-2xl border-[3px] border-dashed p-2.5 shadow-[0_-6px_12px_rgb(61_52_82/0.12)]"
          style={{ borderColor: over === 'tray' ? INK : `${INK}50`, background: over === 'tray' ? colors.light : '#fffdf8' }}
        >
          <SectionTitle>Components ({tray.length})</SectionTitle>
          {tray.length === 0 ? (
            <p className="text-center text-xs font-bold opacity-60">All placed. Press Check!</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-1.5">
              {tray.map((t) => (
                <button key={t} type="button" aria-pressed={selected === t} aria-label={`${t}: tap to select`} className="max-w-full min-w-24 select-none" {...bind({ tile: t, from: 'tray' }, tileView(t))}>
                  {tileView(t, selected === t ? 'selected' : 'idle')}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {wrong.length > 0 && (
        <Feedback tone="bad" title={`${wrong.length} component${wrong.length === 1 ? '' : 's'} in the wrong layer. Correct ones are locked 🔒.`}>
          {wrong.slice(0, 3).map((t) => (
            <p key={t}>
              <b>{t}</b>: {bites.get(t)}
            </p>
          ))}
        </Feedback>
      )}

      {solved ? (
        <>
          <div
            ref={bannerRef}
            className="w-full rounded-3xl border-4 px-4 py-4 text-center animate-[drop-in_600ms_cubic-bezier(.2,1.4,.5,1)_both]"
            style={{ borderColor: INK, background: '#fff4d6', boxShadow: `0 6px 0 ${INK}` }}
          >
            <div className="text-4xl" aria-hidden>
              🏔️
            </div>
            <h3 className="mt-1 text-2xl font-black">You&apos;ve reached the Summit!</h3>
            <p className="mt-1 text-sm font-semibold">
              Frontend to monitoring: a production AI platform, assembled{attempts === 1 ? ' on the first try' : ''}. The paths meet here, on real systems.
            </p>
          </div>
          <GameButton onClick={finish} color="#7fd99a">
            Finish ▶
          </GameButton>
        </>
      ) : (
        <GameButton onClick={check} disabled={!full}>
          ✓ Check
        </GameButton>
      )}
      {ghost}
    </div>
  );
}
