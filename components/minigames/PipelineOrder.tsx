'use client';

import { Fragment, useRef, useState } from 'react';
import { getPhase } from '@/data/roadmap';
import type { PipelineOrderConfig } from '@/data/minigames';
import { INK, SectionTitle } from '@/components/ui/kit';
import { TRACK_COLORS } from '@/lib/palette';
import { shuffle } from './complete';
import { Feedback, GameButton, useDragDrop } from './kit';
import type { MiniGameProps } from './types';

interface Card {
  id: number;
  text: string;
}

/** Where a dragged card came from: a slot index, or the tray. */
type From = number | 'tray';

const label = (text: string) => text.split(' | ').join(' · ');

function starsForAttempts(tries: number): 1 | 2 | 3 {
  return tries <= 1 ? 3 : tries === 2 ? 2 : 1;
}

/** Arrange shuffled step cards into the right order. Stars by attempts. */
export default function PipelineOrder({ phaseId, config, onComplete }: MiniGameProps<PipelineOrderConfig>) {
  const { steps, distractors = [], distractorWhy = {}, loop = false, explain } = config;
  const n = steps.length;
  const colors = TRACK_COLORS[getPhase(phaseId).track];

  const [cards] = useState<Card[]>(() => {
    const texts = [...steps, ...distractors];
    let order = shuffle(texts);
    // Never hand out the answer in tray order.
    for (let i = 0; i < 5 && order.slice(0, n).every((t, k) => t === steps[k]); i++) order = shuffle(texts);
    return order.map((text, id) => ({ id, text }));
  });
  const [slots, setSlots] = useState<(number | null)[]>(() => Array(n).fill(null));
  const [locked, setLocked] = useState<boolean[]>(() => Array(n).fill(false));
  const [attempts, setAttempts] = useState(0);
  const [wrong, setWrong] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ tone: 'good' | 'bad' | 'info'; title: string; lines: string[] } | null>(null);
  const [solved, setSolved] = useState(false);
  /** Loop mode: which step slot 0 maps to, fixed once anything has locked. */
  const offset = useRef<number | null>(null);

  const tray = cards.filter((c) => !slots.includes(c.id));
  const full = slots.every((s) => s !== null);
  const editable = (i: number) => !locked[i] && !solved;

  const place = (cardId: number, to: number, from: From) => {
    if (!editable(to) || (from !== 'tray' && !editable(from))) return;
    setSlots((prev) => {
      const next = [...prev];
      const displaced = next[to];
      if (from !== 'tray') next[from] = displaced; // swap (the displaced card moves to the old slot)
      next[to] = cardId; // from the tray, a displaced card simply returns to the tray
      return next;
    });
    setWrong([]);
  };

  const takeOut = (from: number) => {
    if (!editable(from)) return;
    setSlots((prev) => prev.map((s, i) => (i === from ? null : s)));
    setWrong([]);
  };

  const { bind, ghost, over } = useDragDrop<{ cardId: number; from: From }>({
    onTap: ({ cardId, from }) => {
      if (from !== 'tray') return takeOut(from);
      const empty = slots.findIndex((s, i) => s === null && editable(i));
      if (empty === -1) {
        setFeedback({ tone: 'info', title: 'Every slot is full.', lines: ['Tap a placed card to send it back to the tray.'] });
        return;
      }
      place(cardId, empty, 'tray');
    },
    onDrop: ({ cardId, from }, target) => {
      if (target?.startsWith('slot-')) place(cardId, Number(target.slice(5)), from);
      else if (target === 'tray' && from !== 'tray') takeOut(from);
    },
  });

  const check = () => {
    if (!full || solved) return;
    const texts = slots.map((id) => cards[id!].text);
    const off = offset.current ?? (loop ? Math.max(0, steps.indexOf(texts[0])) : 0);
    const ok = texts.map((t, i) => t === steps[(i + off) % n]);
    const tries = attempts + 1;
    setAttempts(tries);

    if (ok.every(Boolean)) {
      setLocked(Array(n).fill(true));
      setSolved(true);
      setWrong([]);
      setFeedback({
        tone: 'good',
        title: tries === 1 ? 'Perfect, first try! 🎉' : `Solved in ${tries} tries!`,
        lines: [explain],
      });
      return;
    }

    const nextLocked = locked.map((l, i) => l || ok[i]);
    if (nextLocked.some(Boolean)) offset.current = off;
    setLocked(nextLocked);
    setSlots(slots.map((id, i) => (ok[i] ? id : null)));
    setWrong(ok.flatMap((good, i) => (good ? [] : [i])));
    const right = ok.filter(Boolean).length;
    const misplacedDistractors = texts.filter((t) => distractors.includes(t));
    setFeedback({
      tone: 'bad',
      title: `${right} of ${n} in the right place.`,
      lines: [
        ...misplacedDistractors.map((t) => `“${t}” doesn't belong: ${distractorWhy[t]}`),
        right > 0 ? 'Correct steps are locked 🔒. The rest went back to the tray.' : 'The cards went back to the tray. Try again!',
      ],
    });
  };

  const finish = () => onComplete({ score: Math.max(25, 100 - 25 * (attempts - 1)), stars: starsForAttempts(attempts) });

  const cardView = (text: string, state: 'idle' | 'locked' | 'ghost' = 'idle') => (
    <span
      className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border-[3px] px-3 py-1.5 text-center text-sm font-bold wrap-break-word"
      style={{
        borderColor: INK,
        background: state === 'locked' ? '#d6f5df' : colors.light,
        color: INK,
        boxShadow: state === 'locked' ? 'none' : `0 3px 0 ${INK}`,
      }}
    >
      {state === 'locked' && <span aria-hidden>🔒</span>}
      {label(text)}
    </span>
  );

  const firstText = slots[0] !== null ? cards[slots[0]].text : steps[0];

  return (
    <div className="flex flex-col items-center gap-4">
      <section className="w-full max-w-sm" aria-label="Your pipeline">
        <SectionTitle>Your pipeline · {attempts === 0 ? 'first try' : `${attempts} ${attempts === 1 ? 'try' : 'tries'} so far`}</SectionTitle>
        <ol className="flex flex-col items-center">
          {slots.map((id, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <li aria-hidden className="text-sm leading-4 font-black" style={{ color: colors.dark }}>
                  ↓
                </li>
              )}
              <li
                data-drop={`slot-${i}`}
                className={`flex w-full rounded-xl ${wrong.includes(i) ? 'animate-[shake_400ms_ease-in-out]' : ''}`}
              >
                {id !== null ? (
                  <button
                    type="button"
                    aria-label={`Step ${i + 1}: ${label(cards[id].text)}${locked[i] ? ' (locked)' : ', tap to remove'}`}
                    disabled={!editable(i)}
                    className="w-full select-none"
                    {...bind({ cardId: id, from: i }, cardView(cards[id].text), editable(i))}
                  >
                    {cardView(cards[id].text, locked[i] ? 'locked' : 'idle')}
                  </button>
                ) : (
                  <span
                    className="flex min-h-10 w-full items-center justify-center rounded-xl border-[3px] border-dashed text-xs font-bold transition-colors"
                    style={{
                      borderColor: over === `slot-${i}` ? INK : wrong.includes(i) ? '#e5584f' : `${INK}40`,
                      background: over === `slot-${i}` ? colors.light : 'transparent',
                      color: `${INK}80`,
                    }}
                  >
                    Step {i + 1}
                  </span>
                )}
              </li>
            </Fragment>
          ))}
          {loop && (
            <li className="mt-1 text-sm font-black" style={{ color: colors.dark }}>
              ↻ back to {label(firstText)}
            </li>
          )}
        </ol>
      </section>

      {!solved && (
        <section
          data-drop="tray"
          aria-label="Card tray"
          className="w-full rounded-2xl border-[3px] border-dashed p-3 transition-colors"
          style={{ borderColor: over === 'tray' ? INK : `${INK}30`, background: over === 'tray' ? colors.light : '#ffffff80' }}
        >
          <SectionTitle>Cards ({tray.length})</SectionTitle>
          {tray.length === 0 ? (
            <p className="text-center text-xs font-bold opacity-60">All cards placed. Press Check!</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-2">
              {tray.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-label={`${label(c.text)}: tap to place`}
                  className="max-w-full min-w-24 select-none"
                  {...bind({ cardId: c.id, from: 'tray' }, cardView(c.text))}
                >
                  {cardView(c.text)}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {feedback && (
        <Feedback tone={feedback.tone} title={feedback.title}>
          {feedback.lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </Feedback>
      )}

      {solved ? (
        <GameButton onClick={finish} color="#7fd99a">
          Finish ▶
        </GameButton>
      ) : (
        <GameButton onClick={check} disabled={!full}>
          ✓ Check
        </GameButton>
      )}
      {ghost}
    </div>
  );
}
