'use client';

import { useState } from 'react';
import { getPhase } from '@/data/roadmap';
import type { QuizConfig, QuizOutcome } from '@/data/minigames';
import { INK } from '@/components/ui/kit';
import { TRACK_COLORS } from '@/lib/palette';
import { shuffle, starsForAccuracy } from './complete';
import { Feedback, GameButton, ProgressDots } from './kit';
import type { MiniGameProps } from './types';

function pickOutcome(outcomes: QuizOutcome[], total: number): QuizOutcome {
  return (
    outcomes.find((o) => (o.min === undefined || total >= o.min) && (o.max === undefined || total <= o.max)) ??
    outcomes[outcomes.length - 1]
  );
}

/**
 * Multiple choice with instant feedback + explanation.
 * `personality` mode has no right answers: option weights add up to an outcome.
 */
export default function Quiz({ phaseId, config, onComplete }: MiniGameProps<QuizConfig>) {
  const personality = config.mode === 'personality';
  const colors = TRACK_COLORS[getPhase(phaseId).track];
  const [questions] = useState(() => config.questions.map((q) => ({ ...q, options: shuffle(q.options) })));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [weight, setWeight] = useState(0);
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null);

  const q = questions[index];
  const answered = picked !== null;
  const isLast = index === questions.length - 1;

  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    setResults((r) => [...r, personality || !!q.options[i].correct]);
    setWeight((w) => w + (q.options[i].weight ?? 0));
  };

  const next = () => {
    if (!isLast) {
      setIndex((i) => i + 1);
      setPicked(null);
      return;
    }
    if (personality) {
      setOutcome(pickOutcome(config.outcomes ?? [], weight));
      return;
    }
    const acc = results.filter(Boolean).length / questions.length;
    onComplete({ score: Math.round(acc * 100), stars: starsForAccuracy(acc) });
  };

  if (outcome) {
    const c = TRACK_COLORS[outcome.track];
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-xs font-extrabold tracking-wider uppercase opacity-60">Your path</p>
        <div
          className="w-full max-w-md rounded-3xl border-4 px-4 py-5 animate-[stamp-in_500ms_cubic-bezier(.2,1.4,.5,1)]"
          style={{ borderColor: INK, background: c.light, boxShadow: `0 6px 0 ${INK}` }}
        >
          <h3 className="text-2xl leading-tight font-extrabold">{outcome.title}</h3>
          <p className="mt-2 text-sm font-semibold">{outcome.text}</p>
        </div>
        <p className="max-w-md text-sm font-semibold">
          Whatever you got: you don&apos;t have to choose now. Every path shares the same foundation, and you can explore every island.
        </p>
        <GameButton onClick={() => onComplete({ score: 100, stars: 3 })} color="#7fd99a">
          Finish ▶
        </GameButton>
      </div>
    );
  }

  const correctIndex = q.options.findIndex((o) => o.correct);
  const gotIt = answered && (personality || picked === correctIndex);

  return (
    <div className="flex flex-col items-center gap-4">
      <ProgressDots results={personality ? results.map(() => true) : results} total={questions.length} current={index} />
      <h3 key={index} className="max-w-md text-center text-lg leading-snug font-extrabold animate-[toast-in_250ms_ease-out]">
        {q.q}
      </h3>
      <ul className="flex w-full max-w-md flex-col gap-2">
        {q.options.map((o, i) => {
          const isPicked = picked === i;
          let bg = 'white';
          if (answered) {
            if (personality) bg = isPicked ? colors.base : 'white';
            else if (o.correct) bg = '#7fd99a';
            else if (isPicked) bg = '#ff9f9f';
          }
          return (
            <li key={`${index}-${i}`}>
              <button
                type="button"
                onClick={() => choose(i)}
                disabled={answered}
                aria-pressed={isPicked}
                className="flex min-h-12 w-full items-center gap-2 rounded-2xl border-[3px] px-3 py-2 text-left text-sm font-bold transition-transform active:translate-y-0.5 disabled:cursor-default"
                style={{
                  borderColor: INK,
                  background: bg,
                  color: INK,
                  boxShadow: `0 3px 0 ${INK}`,
                  opacity: answered && !isPicked && !(o.correct && !personality) ? 0.6 : 1,
                }}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black"
                  style={{ borderColor: INK, background: colors.light }}
                  aria-hidden
                >
                  {answered && !personality ? (o.correct ? '✓' : isPicked ? '✗' : String.fromCharCode(65 + i)) : String.fromCharCode(65 + i)}
                </span>
                <span className="min-w-0 flex-1">{o.text}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {answered && (
        <>
          <Feedback tone={personality ? 'info' : gotIt ? 'good' : 'bad'} title={personality ? 'Good to know' : gotIt ? '✓ Correct!' : '✗ Not quite.'}>
            {q.explain}
          </Feedback>
          <GameButton onClick={next} color={gotIt ? '#7fd99a' : '#ffd66e'}>
            {isLast ? (personality ? 'See my path ▶' : 'Finish ▶') : 'Next ▶'}
          </GameButton>
        </>
      )}
    </div>
  );
}
