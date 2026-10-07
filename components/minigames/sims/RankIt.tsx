'use client';

import { useState } from 'react';
import { INK } from '@/components/ui/kit';
import type { RankItConfig, RankResult } from '@/data/sims';
import { Feedback, GameButton, useDragDrop } from '../kit';
import type { MiniGameProps } from '../types';
import { GOOD, Meter, RoundHeader, SimCard, trackColors } from './simKit';

const RELEVANT = 2;

function metrics(grades: number[]) {
  const totalRelevant = grades.filter((g) => g >= RELEVANT).length;
  const recall3 = totalRelevant ? grades.slice(0, 3).filter((g) => g >= RELEVANT).length / totalRelevant : 0;
  const first = grades.findIndex((g) => g >= RELEVANT);
  const mrr = first === -1 ? 0 : 1 / (first + 1);
  const dcg = (gs: number[]) => gs.reduce((s, g, i) => s + (2 ** g - 1) / Math.log2(i + 2), 0);
  const ideal = dcg([...grades].sort((a, b) => b - a));
  return { recall3, mrr, ndcg: ideal ? dcg(grades) / ideal : 0 };
}

const GRADE_LABEL = ['Off-topic', '★ Related', '★★ Relevant', '★★★ Perfect'];
const GRADE_BG = ['#eeeaf4', '#fff4d6', '#d6f5df', '#9fe3b4'];

export default function RankIt({ phaseId, config, onComplete }: MiniGameProps<RankItConfig>) {
  const colors = trackColors(phaseId);
  const { rounds, ndcgTarget } = config;
  const [round, setRound] = useState(0);
  const [order, setOrder] = useState<number[]>(() => rounds[0].results.map((_, i) => i));
  const [submitted, setSubmitted] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const r = rounds[round];
  const ranked: RankResult[] = order.map((i) => r.results[i]);
  const m = metrics(ranked.map((x) => x.grade));

  const move = (from: number, to: number) => {
    if (submitted || to < 0 || to >= order.length || from === to) return;
    setOrder((o) => {
      const next = [...o];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    setMoves((n) => n + 1);
  };

  const { bind, ghost, over } = useDragDrop<number>({
    onTap: () => {},
    onDrop: (from, target) => {
      if (target?.startsWith('rank-')) move(from, Number(target.slice(5)));
    },
  });

  const submit = () => {
    setSubmitted(true);
    setScores((s) => [...s, m.ndcg]);
  };

  const next = () => {
    if (round + 1 < rounds.length) {
      setRound(round + 1);
      setOrder(rounds[round + 1].results.map((_, i) => i));
      setSubmitted(false);
      return;
    }
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    onComplete({ score: Math.round(avg * 100), stars: avg >= 0.97 ? 3 : avg >= 0.9 ? 2 : 1 });
  };

  const card = (res: RankResult, rank: number, handle = false) => (
    <div
      className="flex w-full items-stretch gap-2 rounded-2xl border-[3px] bg-white py-1.5 pr-1.5 pl-1"
      style={{ borderColor: INK, boxShadow: handle ? 'none' : `0 3px 0 ${INK}` }}
    >
      <span className="flex w-7 shrink-0 items-center justify-center text-lg font-black" aria-hidden>
        {rank + 1}
      </span>
      <span className="min-w-0 flex-1 py-0.5">
        <span className="block text-sm leading-tight font-extrabold">{res.title}</span>
        <span className="mt-0.5 block text-xs leading-snug font-semibold opacity-80">{res.snippet}</span>
        {submitted && (
          <span className="mt-1 inline-block rounded-full border-2 px-2 text-[11px] font-black" style={{ borderColor: INK, background: GRADE_BG[res.grade] }}>
            {GRADE_LABEL[res.grade]}
          </span>
        )}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <RoundHeader round={round + 1} total={rounds.length} title="Be the reranker" color={colors.light} />
      <div className="w-full rounded-2xl border-[3px] px-3 py-2 text-sm font-bold" style={{ borderColor: INK, background: '#fff4d6' }}>
        🔎 {r.query}
      </div>

      <SimCard title="Live retrieval metrics">
        <div className="flex flex-col gap-1.5">
          <Meter label="Recall@3 (relevant ones in the top 3)" value={m.recall3} display={`${Math.round(m.recall3 * 100)}%`} color={colors.base} />
          <Meter label="MRR (how high the first relevant one is)" value={m.mrr} display={m.mrr.toFixed(2)} color={colors.base} />
          <Meter label={`NDCG (whole ranking, graded) · submit at ${ndcgTarget.toFixed(2)}`} value={m.ndcg} display={m.ndcg.toFixed(2)} threshold={ndcgTarget} />
        </div>
      </SimCard>

      <p className="w-full text-xs font-bold opacity-70">
        {submitted ? 'Hidden relevance grades revealed.' : 'Drag a passage by its ⠿ handle, or use the arrows. Best answers on top!'}
      </p>
      <ol className="flex w-full flex-col gap-2" aria-label="Ranked results">
        {ranked.map((res, i) => (
          <li
            key={res.title}
            data-drop={`rank-${i}`}
            className="flex items-stretch gap-1.5 rounded-2xl transition-transform"
            style={{ outline: over === `rank-${i}` ? `3px dashed ${INK}` : undefined, outlineOffset: 2 }}
          >
            {!submitted && (
              <span
                role="button"
                tabIndex={-1}
                aria-label={`Drag ${res.title}`}
                className="flex w-9 shrink-0 cursor-grab items-center justify-center rounded-xl border-[3px] text-lg font-black select-none"
                style={{ borderColor: INK, background: colors.light }}
                {...bind(i, card(res, i, true))}
              >
                ⠿
              </span>
            )}
            <div className="min-w-0 flex-1">{card(res, i)}</div>
            {!submitted && (
              <span className="flex shrink-0 flex-col gap-1">
                <ArrowButton label={`Move ${res.title} up`} onClick={() => move(i, i - 1)} disabled={i === 0}>
                  ▲
                </ArrowButton>
                <ArrowButton label={`Move ${res.title} down`} onClick={() => move(i, i + 1)} disabled={i === ranked.length - 1}>
                  ▼
                </ArrowButton>
              </span>
            )}
          </li>
        ))}
      </ol>
      {ghost}

      {submitted ? (
        <>
          <Feedback tone={m.ndcg >= 0.97 ? 'good' : 'info'} title={`NDCG ${m.ndcg.toFixed(2)}${m.ndcg >= 0.999 ? ': a perfect ranking!' : ''}`}>
            {r.lesson}
          </Feedback>
          <GameButton onClick={next} color="#7fd99a">
            {round + 1 < rounds.length ? 'Next query ▶' : 'Finish ▶'}
          </GameButton>
        </>
      ) : (
        <GameButton onClick={submit} disabled={m.ndcg < ndcgTarget} color={m.ndcg >= ndcgTarget ? '#7fd99a' : '#ffd66e'}>
          {m.ndcg >= ndcgTarget ? '✓ Submit ranking' : `Reach NDCG ${ndcgTarget.toFixed(2)} to submit`}
        </GameButton>
      )}
      <p className="text-xs font-bold opacity-60">
        Moves: {moves} · ★★★ for an average NDCG of 0.97+ <span style={{ color: GOOD }}>{scores.length ? `· so far ${scores.map((s) => s.toFixed(2)).join(', ')}` : ''}</span>
      </p>
    </div>
  );
}

function ArrowButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled: boolean; children: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-[calc(50%-2px)] min-h-9 w-9 items-center justify-center rounded-xl border-[3px] bg-white text-xs font-black active:translate-y-0.5 disabled:opacity-25"
      style={{ borderColor: INK }}
    >
      {children}
    </button>
  );
}
