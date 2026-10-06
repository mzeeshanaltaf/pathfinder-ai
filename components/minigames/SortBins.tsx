'use client';

import { useEffect, useRef, useState } from 'react';
import { getPhase } from '@/data/roadmap';
import type { SortBinsConfig } from '@/data/minigames';
import { INK } from '@/components/ui/kit';
import { TRACK_COLORS } from '@/lib/palette';
import { shuffle, starsForAccuracy } from './complete';
import { Feedback, GameButton, ProgressDots, useDragDrop } from './kit';
import type { MiniGameProps } from './types';

/** Correct answers move on by themselves after this long (wrong ones wait for "Next"). */
const AUTO_NEXT_MS = 2600;

/** Sort cards into 2–4 bins, one at a time. Stars by accuracy; every answer explains itself. */
export default function SortBins({ phaseId, config, onComplete }: MiniGameProps<SortBinsConfig>) {
  const { bins, timed = false, seconds = 15 } = config;
  const colors = TRACK_COLORS[getPhase(phaseId).track];
  const [items] = useState(() => shuffle(config.items));
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  /** Bin picked for the current card (null = timed out); undefined while still choosing. */
  const [picked, setPicked] = useState<string | null | undefined>(undefined);
  const timerBar = useRef<HTMLDivElement>(null);

  const item = items[index];
  const answered = picked !== undefined;
  const isLast = index === items.length - 1;

  const choose = (bin: string | null) => {
    if (answered) return;
    setPicked(bin);
    setResults((r) => [...r, bin === item.bin]);
  };

  const next = () => {
    if (!answered) return;
    if (isLast) {
      const acc = results.filter(Boolean).length / items.length;
      onComplete({ score: Math.round(acc * 100), stars: starsForAccuracy(acc) });
      return;
    }
    setIndex((i) => i + 1);
    setPicked(undefined);
  };

  // Timer: drives the bar directly (no re-render per frame); timing out counts as wrong.
  useEffect(() => {
    if (!timed || answered) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const left = Math.max(0, 1 - (now - start) / (seconds * 1000));
      if (timerBar.current) timerBar.current.style.transform = `scaleX(${left})`;
      if (left <= 0) {
        setPicked(null);
        setResults((r) => [...r, false]);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [timed, answered, index, seconds]);

  // Correct answers auto-advance after a moment (except the last, so the finish isn't rushed).
  const correct = answered && picked === item.bin;
  useEffect(() => {
    if (!correct || isLast) return;
    const t = window.setTimeout(next, AUTO_NEXT_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correct, index]);

  const { bind, ghost, over } = useDragDrop<number>({
    onTap: () => {},
    onDrop: (_, target) => {
      if (target?.startsWith('bin-')) choose(target.slice(4));
    },
  });

  const binLabel = (id: string) => bins.find((b) => b.id === id)?.label ?? id;

  const card = (
    <span
      className="flex min-h-24 w-full items-center justify-center rounded-2xl border-[3px] px-4 py-3 text-center text-base leading-snug font-bold"
      style={{ borderColor: INK, background: 'white', color: INK, boxShadow: `0 5px 0 ${INK}` }}
    >
      {item.text}
    </span>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <ProgressDots results={results} total={items.length} current={index} />

      <div className="w-full max-w-md">
        {answered ? (
          <div className="opacity-60">{card}</div>
        ) : (
          <div
            key={index}
            role="group"
            aria-label={`Card ${index + 1}: ${item.text}`}
            className="animate-[drop-in_350ms_cubic-bezier(.2,1.4,.5,1)] cursor-grab select-none"
            {...bind(index, card)}
          >
            {card}
          </div>
        )}
        {timed && !answered && (
          <div className="mt-2 h-2 overflow-hidden rounded-full border-2 bg-white" style={{ borderColor: INK }} aria-hidden>
            <div ref={timerBar} className="h-full origin-left rounded-full" style={{ background: colors.dark }} />
          </div>
        )}
      </div>

      <div className="grid w-full max-w-md grid-cols-2 gap-2">
        {bins.map((b) => {
          const isAnswer = answered && b.id === item.bin;
          const isWrongPick = answered && b.id === picked && picked !== item.bin;
          return (
            <button
              key={b.id}
              type="button"
              data-drop={`bin-${b.id}`}
              onClick={() => choose(b.id)}
              disabled={answered}
              className="flex min-h-16 items-center justify-center rounded-2xl border-[3px] px-2 py-2 text-center text-sm font-extrabold transition-transform active:translate-y-0.5 disabled:cursor-default"
              style={{
                borderColor: INK,
                background: isAnswer ? '#7fd99a' : isWrongPick ? '#ff9f9f' : over === `bin-${b.id}` ? colors.base : colors.light,
                color: INK,
                boxShadow: `0 4px 0 ${INK}`,
                transform: over === `bin-${b.id}` ? 'scale(1.04)' : undefined,
              }}
            >
              {b.label}
            </button>
          );
        })}
      </div>

      {answered && (
        <>
          <Feedback
            tone={correct ? 'good' : 'bad'}
            title={correct ? '✓ Correct!' : picked === null ? `⏰ Time's up! It goes in ${binLabel(item.bin)}.` : `✗ Not quite. It goes in ${binLabel(item.bin)}.`}
          >
            {item.why}
          </Feedback>
          <GameButton onClick={next} color={correct ? '#7fd99a' : '#ffd66e'}>
            {isLast ? 'Finish ▶' : 'Next ▶'}
          </GameButton>
        </>
      )}
      {ghost}
    </div>
  );
}
