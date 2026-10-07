'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { INK } from '@/components/ui/kit';
import type { AttentionBeamsConfig, AttentionRound } from '@/data/sims';
import { starsForAccuracy } from '../complete';
import { Feedback, GameButton, ProgressDots } from '../kit';
import type { MiniGameProps } from '../types';
import { BAD, GOLD, GOOD, Illustrative, RoundHeader, SimCard, trackColors } from './simKit';

const argmax = (a: number[]) => a.indexOf(Math.max(...a));

export default function AttentionBeams({ phaseId, config, onComplete }: MiniGameProps<AttentionBeamsConfig>) {
  const colors = trackColors(phaseId);
  const { rounds, generation } = config;
  const [round, setRound] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [generating, setGenerating] = useState(false);

  const r: AttentionRound | undefined = rounds[round];
  const answer = r ? argmax(r.weights) : -1;
  const masked = (i: number) => !!r?.causal && i > r.query;

  const choose = (i: number) => {
    if (pick !== null || !r || i === r.query || masked(i)) return;
    setPick(i);
    setResults((res) => [...res, i === answer]);
  };

  const next = () => {
    setPick(null);
    if (round + 1 < rounds.length) setRound(round + 1);
    else setGenerating(true);
  };

  const correct = results.filter(Boolean).length;
  const finish = () => {
    const acc = correct / rounds.length;
    onComplete({ score: Math.round(acc * 100), stars: starsForAccuracy(acc) });
  };

  if (generating) return <Generation generation={generation} color={colors.light} correct={correct} total={rounds.length} onFinish={finish} />;
  if (!r) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <RoundHeader round={round + 1} total={rounds.length} title={r.causal ? 'Causal mask: no peeking ahead' : 'Who does it attend to?'} color={colors.light} />
      <ProgressDots results={results} total={rounds.length} current={round} />
      <p className="w-full text-sm font-semibold">
        Tap the word that <span className="rounded-md px-1 font-extrabold" style={{ background: GOLD }}>{r.tokens[r.query]}</span> pays the most attention to.
        {r.causal && ' Like in GPT, tokens after it are hidden.'}
      </p>

      <SimCard>
        <div className="flex flex-wrap justify-center gap-1.5 py-1" role="group" aria-label="Sentence">
          {r.tokens.map((t, i) => {
            const isQuery = i === r.query;
            const isMasked = masked(i);
            const isPick = pick === i;
            const isAnswer = pick !== null && i === answer;
            return (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                disabled={isQuery || isMasked || pick !== null}
                aria-label={isMasked ? `${t} (masked: future token)` : isQuery ? `${t} (highlighted token)` : t}
                className="min-h-11 rounded-xl border-[3px] px-2.5 text-base font-extrabold transition-transform active:translate-y-0.5 disabled:cursor-default"
                style={{
                  borderColor: isMasked ? `${INK}30` : INK,
                  background: isQuery ? GOLD : isAnswer ? '#7fd99a' : isPick ? '#ff9f9f' : isMasked ? '#eeeaf4' : 'white',
                  color: isMasked ? `${INK}55` : INK,
                  boxShadow: isQuery || isMasked || pick !== null ? 'none' : `0 3px 0 ${INK}`,
                  outline: isQuery ? `3px dashed ${INK}` : undefined,
                  outlineOffset: 2,
                }}
              >
                {isMasked ? '🔒' : t}
              </button>
            );
          })}
        </div>
      </SimCard>

      {pick !== null && (
        <>
          <SimCard title={`Attention from “${r.tokens[r.query]}”`} aside={<Illustrative>Illustrative weights</Illustrative>}>
            <Beams round={r} pick={pick} />
          </SimCard>
          <Feedback tone={pick === answer ? 'good' : 'bad'} title={pick === answer ? `✓ Yes: “${r.tokens[answer]}”!` : `✗ It's “${r.tokens[answer]}”.`}>
            {r.explain}
          </Feedback>
          <GameButton onClick={next} color="#7fd99a">
            {round + 1 < rounds.length ? 'Next sentence ▶' : 'How is the next token made? ▶'}
          </GameButton>
        </>
      )}
    </div>
  );
}

/** bertviz-style view: the query token on the left, every token on the right, beam width = weight. */
function Beams({ round, pick }: { round: AttentionRound; pick: number }) {
  const ROW = 28;
  const W = 320;
  const H = round.tokens.length * ROW + 8;
  const qy = H / 2;
  const answer = argmax(round.weights);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full max-w-90" role="img" aria-label="Attention beams">
      {round.tokens.map((_, i) => {
        const w = round.weights[i];
        if (round.causal && i > round.query) return null;
        const y = 4 + i * ROW + ROW / 2;
        const d = `M92,${qy} C150,${qy} 150,${y} 196,${y}`;
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={i === answer ? '#45b06a' : '#82bdf2'}
            strokeOpacity={0.35 + w}
            strokeWidth={1.5 + w * 22}
            strokeLinecap="round"
            strokeDasharray="400"
            className="animate-[beam-in_700ms_ease-out_both]"
            style={{ '--len': '400', animationDelay: `${i * 50}ms` } as CSSProperties}
          />
        );
      })}
      <rect x="6" y={qy - 15} width="86" height="30" rx="9" fill={GOLD} stroke={INK} strokeWidth="3" />
      <text x="49" y={qy + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill={INK}>
        {round.tokens[round.query]}
      </text>
      {round.tokens.map((t, i) => {
        const y = 4 + i * ROW + ROW / 2;
        const isMasked = round.causal && i > round.query;
        return (
          <g key={i} opacity={isMasked ? 0.35 : 1}>
            <rect
              x="196"
              y={y - 11}
              width="76"
              height="22"
              rx="7"
              fill={i === answer ? '#d6f5df' : i === pick ? '#ffe1e1' : 'white'}
              stroke={i === pick && i !== answer ? BAD : INK}
              strokeWidth="2.5"
            />
            <text x="234" y={y + 4.5} textAnchor="middle" fontSize="12" fontWeight="800" fill={INK}>
              {isMasked ? 'masked' : t}
            </text>
            <text x="278" y={y + 4.5} fontSize="11" fontWeight="800" fill={i === answer ? GOOD : INK}>
              {isMasked ? '' : `${Math.round(round.weights[i] * 100)}%`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const PHASES = ['① Attention: each token gathers context from the earlier ones', '② Feed forward → probabilities for the next token', '③ Pick a token and append it'];
const PHASE_MS = 1100;

/** The closing autoregressive loop: attend → predict → append, repeated. */
function Generation({
  generation,
  color,
  correct,
  total,
  onFinish,
}: {
  generation: AttentionBeamsConfig['generation'];
  color: string;
  correct: number;
  total: number;
  onFinish: () => void;
}) {
  const { prompt, steps } = generation;
  // tick counts phases: step = floor(tick / 3), phase = tick % 3
  const [tick, setTick] = useState(0);
  const totalTicks = steps.length * PHASES.length;
  const done = tick >= totalTicks;
  const step = Math.min(steps.length - 1, Math.floor(tick / PHASES.length));
  const phase = tick % PHASES.length;
  const appended = steps.slice(0, Math.floor(tick / PHASES.length) + (phase === 2 && !done ? 1 : 0)).map((s) => s.pick);

  useEffect(() => {
    if (done) return;
    const t = window.setTimeout(() => setTick((n) => n + 1), PHASE_MS);
    return () => window.clearTimeout(t);
  }, [tick, done]);

  return (
    <div className="flex flex-col items-center gap-3">
      <h3 className="w-full text-base font-extrabold">How an LLM generates the next token</h3>
      <p className="w-full text-sm font-semibold">
        You got {correct} of {total} attention rounds. Now watch a decoder write, one token at a time.
      </p>
      <SimCard>
        <div className="flex min-h-12 flex-wrap items-center gap-1.5" aria-live="polite">
          {[...prompt, ...appended].map((t, i) => (
            <span
              key={i}
              className={`rounded-lg border-2 px-2 py-0.5 text-sm font-extrabold ${i >= prompt.length ? 'animate-[drop-in_350ms_cubic-bezier(.2,1.4,.5,1)]' : ''}`}
              style={{
                borderColor: INK,
                background: i >= prompt.length ? '#d6f5df' : !done && phase === 0 ? color : 'white',
                transition: 'background 300ms',
              }}
            >
              {t}
            </span>
          ))}
          {!done && <span className="h-6 w-10 rounded-lg border-2 border-dashed animate-[pulse-dot_900ms_ease-in-out_infinite]" style={{ borderColor: INK }} aria-hidden />}
        </div>
      </SimCard>

      {!done ? (
        <SimCard title={`Token ${step + 1} of ${steps.length}`} aside={<Illustrative>Illustrative probabilities</Illustrative>}>
          <ol className="flex flex-col gap-1">
            {PHASES.map((p, i) => (
              <li key={p} className="text-sm font-bold transition-opacity" style={{ opacity: i === phase ? 1 : 0.35 }}>
                {i === phase ? '▶ ' : ''}
                {p}
              </li>
            ))}
          </ol>
          {phase >= 1 && (
            <ul className="mt-2 flex flex-col gap-1">
              {steps[step].candidates.map(([t, p]) => (
                <li key={t} className="flex items-center gap-2 text-sm font-bold">
                  <span className="w-20 shrink-0 text-right">{t}</span>
                  <span className="h-4 min-w-0 flex-1 overflow-hidden rounded-md border-2 bg-white" style={{ borderColor: INK }}>
                    <span className="block h-full transition-[width] duration-500" style={{ width: `${p * 100}%`, background: t === steps[step].pick && phase === 2 ? '#7fd99a' : '#82bdf2' }} />
                  </span>
                  <span className="w-9 shrink-0 text-right text-xs tabular-nums">{Math.round(p * 100)}%</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-center text-xs font-extrabold opacity-70">↻ The new token is fed back in, and the loop repeats.</p>
        </SimCard>
      ) : (
        <Feedback tone="good" title="That's autoregressive generation.">
          Every new token is predicted from all the tokens before it (thanks to causal attention), appended, and fed back in, over and over until an end
          token or a length limit. No magic, and not &ldquo;the API does it&rdquo;.
        </Feedback>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        {!done && (
          <GameButton onClick={() => setTick(totalTicks)} color="white">
            Skip ⏭
          </GameButton>
        )}
        {done && (
          <GameButton onClick={() => setTick(0)} color="white">
            ↻ Replay
          </GameButton>
        )}
        <GameButton onClick={onFinish} color="#7fd99a" disabled={!done}>
          Finish ▶
        </GameButton>
      </div>
    </div>
  );
}
