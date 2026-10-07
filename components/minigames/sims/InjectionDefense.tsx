'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { INK } from '@/components/ui/kit';
import type { DefenseItem, InjectionDefenseConfig } from '@/data/sims';
import { starsForAccuracy } from '../complete';
import { Feedback, GameButton, ProgressDots } from '../kit';
import type { MiniGameProps } from '../types';
import { BAD, GOOD, trackColors, useRaf } from './simKit';

type Action = 'block' | 'allow';
type Phase = 'moving' | 'leaving' | 'why' | 'done';

const LANE_H = 300;
const CARD_H = 112;
const FLASH_MS = 850;
/** How far a card travels before it reaches the gate. */
const TRAVEL = LANE_H - CARD_H - 8;

export default function InjectionDefense({ phaseId, config, onComplete }: MiniGameProps<InjectionDefenseConfig>) {
  const colors = trackColors(phaseId);
  const { items, startSeconds, endSeconds, difficulty } = config;
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('moving');
  const [results, setResults] = useState<boolean[]>([]);
  /** The call just made; `y` = where the card was, so its exit animation starts there. */
  const [last, setLast] = useState<{ action: Action; correct: boolean; y: number } | null>(null);
  const progress = useRef(0);
  const resolved = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const press = useRef<{ x: number; y: number } | null>(null);

  const item: DefenseItem | undefined = items[index];
  const seconds = startSeconds + (endSeconds - startSeconds) * (items.length > 1 ? index / (items.length - 1) : 0);

  const resolve = (action: Action) => {
    // `resolved` guards the frames (or key presses) that land before React re-renders.
    if (phase !== 'moving' || !item || resolved.current) return;
    resolved.current = true;
    const correct = (action === 'block') === item.bad;
    setResults((r) => [...r, correct]);
    setLast({ action, correct, y: progress.current * TRAVEL });
    setPhase(correct ? 'leaving' : 'why');
  };

  const advance = () => {
    progress.current = 0;
    resolved.current = false;
    setLast(null);
    if (index + 1 >= items.length) {
      setPhase('done');
      return;
    }
    setIndex((i) => i + 1);
    setPhase('moving');
  };

  // March the card towards the gate; reaching it lets the input through.
  useRaf(phase === 'moving', (dt) => {
    progress.current = Math.min(1, progress.current + dt / seconds);
    if (cardRef.current) cardRef.current.style.transform = `translateY(${progress.current * TRAVEL}px)`;
    if (progress.current >= 1) resolve('allow');
  });

  // Correct calls flash briefly, then the next card comes.
  useEffect(() => {
    if (phase !== 'leaving') return;
    const t = window.setTimeout(advance, FLASH_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Keyboard: B / ← blocks, A / → allows.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'b' || e.key === 'B' || e.key === 'ArrowLeft') resolve('block');
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowRight') resolve('allow');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const correctCount = results.filter(Boolean).length;
  const finish = () => {
    const acc = correctCount / items.length;
    onComplete({ score: Math.round(acc * 100), stars: starsForAccuracy(acc) });
  };

  // Tap or swipe the card = block.
  const onDown = (e: ReactPointerEvent) => {
    press.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = () => {
    if (!press.current) return;
    press.current = null;
    resolve('block');
  };

  if (phase === 'done') {
    const acc = correctCount / items.length;
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="text-5xl" aria-hidden>
          {acc >= 0.9 ? '🏰' : acc >= 0.7 ? '🛡️' : '🔥'}
        </div>
        <h3 className="text-xl font-extrabold">
          {correctCount} / {items.length} calls correct
        </h3>
        <ProgressDots results={results} total={items.length} current={items.length} />
        <p className="max-w-md text-sm font-semibold">
          {difficulty === 'hard'
            ? 'Attacks rarely come from the user alone. Treat every web page, document, email and tool result as untrusted, and give agents only the access their task needs.'
            : 'Never rely on the prompt alone: validate inputs, limit what tools can do, and check who the request is really for.'}
        </p>
        <GameButton onClick={finish} color="#7fd99a">
          Finish ▶
        </GameButton>
      </div>
    );
  }

  const leaving = phase === 'leaving' || phase === 'why';
  const exitTransform =
    last?.action === 'block' ? `translate(-120%, ${last.y}px) rotate(-14deg)` : `translateY(${TRAVEL + 50}px) scale(0.6)`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full items-center justify-between gap-2">
        <ProgressDots results={results} total={items.length} current={index} />
        <span className="shrink-0 text-xs font-extrabold opacity-70">{difficulty === 'hard' ? '🔥 Hard mode' : `${index + 1} / ${items.length}`}</span>
      </div>

      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border-[3px]"
        style={{ height: LANE_H, borderColor: INK, background: `linear-gradient(#eef6ff, ${colors.light})` }}
      >
        {/* the road to the gate */}
        <div aria-hidden className="absolute inset-x-[18%] top-0 bottom-10 border-x-[3px] border-dashed" style={{ borderColor: `${INK}25` }} />
        <Fort />
        {item && (
          <div
            key={index}
            ref={leaving ? undefined : cardRef}
            className="absolute inset-x-3 top-1"
            // While moving, the rAF loop owns `transform` (React never sets it, so re-renders can't reset it).
            style={
              leaving
                ? { height: CARD_H, transform: exitTransform, transition: 'transform 450ms cubic-bezier(.4,.1,.6,1), opacity 450ms', opacity: 0 }
                : { height: CARD_H }
            }
          >
            <button
              type="button"
              aria-label={`Incoming: ${item.text}. Tap to block.`}
              onPointerDown={onDown}
              onPointerUp={onUp}
              onPointerCancel={() => (press.current = null)}
              onClick={(e) => e.detail === 0 && resolve('block')}
              disabled={phase !== 'moving'}
              className="flex h-full w-full cursor-pointer flex-col items-start gap-1 overflow-hidden rounded-2xl border-[3px] bg-white px-3 py-2 text-left select-none"
              style={{ borderColor: INK, boxShadow: `0 5px 0 ${INK}`, touchAction: 'none' }}
            >
              <span className="rounded-full border-2 px-2 text-[11px] font-black" style={{ borderColor: INK, background: '#f4f1fb' }}>
                {item.source}
              </span>
              <span className="text-sm leading-snug font-bold wrap-break-word">{item.text}</span>
            </button>
          </div>
        )}
        {phase === 'leaving' && last && (
          <div
            className="absolute inset-x-0 top-[38%] text-center text-lg font-black animate-[toast-in_200ms_ease-out]"
            style={{ color: last.action === 'block' ? BAD : GOOD }}
            role="status"
          >
            {last.action === 'block' ? `🛡 Blocked: ${item?.kind}` : '✅ Safe, let in'}
          </div>
        )}
      </div>

      {phase === 'why' && item && last ? (
        <>
          <Feedback
            tone="bad"
            title={
              last.action === 'allow'
                ? `🚨 Breach! That was ${/^[aeiou]/i.test(item.kind) ? 'an' : 'a'} ${item.kind.toLowerCase()} attack.`
                : '🙅 False alarm: that input was safe.'
            }
          >
            {item.why}
          </Feedback>
          <GameButton onClick={advance}>Continue ▶</GameButton>
        </>
      ) : (
        <div className="grid w-full max-w-md grid-cols-2 gap-2">
          <GameButton onClick={() => resolve('block')} disabled={phase !== 'moving'} color="#ff9f9f">
            🛡 Block
          </GameButton>
          <GameButton onClick={() => resolve('allow')} disabled={phase !== 'moving'} color="#7fd99a">
            ✅ Allow
          </GameButton>
        </div>
      )}
      <p className="hidden text-xs font-bold opacity-50 sm:block">Keys: B / ← block · A / → allow</p>
    </div>
  );
}

/** The gate at the bottom of the lane. */
function Fort() {
  return (
    <svg aria-hidden viewBox="0 0 200 44" className="absolute inset-x-0 bottom-0 w-full" style={{ height: 44 }} preserveAspectRatio="none">
      <path
        d="M0,44 L0,14 L14,14 L14,6 L28,6 L28,14 L42,14 L42,6 L56,6 L56,14 L72,14 L72,44 Z M128,44 L128,14 L144,14 L144,6 L158,6 L158,14 L172,14 L172,6 L186,6 L186,14 L200,14 L200,44 Z"
        fill="#d9d2ea"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M72,44 L72,22 Q100,4 128,22 L128,44" fill="#a3714a" stroke={INK} strokeWidth="3" />
    </svg>
  );
}
