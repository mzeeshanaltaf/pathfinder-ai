'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { INK } from '@/components/ui/kit';
import type { ChunkRetrieveConfig } from '@/data/sims';
import { Feedback, GameButton } from '../kit';
import type { MiniGameProps } from '../types';
import { BAD, GOOD, Illustrative, RoundHeader, SimCard, trackColors } from './simKit';

type Stage = 'chunk' | 'retrieve' | 'answer';

/** Chunk quality by the check on which the chunking was right (revealed = 0). */
const QUALITY = [1, 0.6, 0.3];
const MAX_CHECKS = 3;

export default function ChunkRetrieve({ phaseId, config, onComplete }: MiniGameProps<ChunkRetrieveConfig>) {
  const colors = trackColors(phaseId);
  const { sentences, topics, minChunk, maxChunk, query, topK, answer, docTitle } = config;
  const gaps = sentences.length - 1;
  const [stage, setStage] = useState<Stage>('chunk');
  /** cuts[i] = a chunk boundary after sentence i. */
  const [cuts, setCuts] = useState<boolean[]>(() => Array(gaps).fill(false));
  const [checks, setChecks] = useState(0);
  const [chunkQuality, setChunkQuality] = useState<number | null>(null);
  const [problems, setProblems] = useState<Map<number, string> | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [retrieved, setRetrieved] = useState(false);
  const [shownParts, setShownParts] = useState(0);

  const topicIds = useMemo(() => [...new Set(sentences.map((s) => s.topic))], [sentences]);
  const idealCuts = useMemo(() => sentences.slice(0, -1).map((s, i) => s.topic !== sentences[i + 1].topic), [sentences]);
  const ranked = useMemo(() => [...topicIds].sort((a, b) => topics[b].score - topics[a].score), [topicIds, topics]);
  const topSet = new Set(ranked.slice(0, topK));

  /** Current chunks as [start, end] sentence index ranges (inclusive). */
  const chunks = useMemo(() => {
    const out: [number, number][] = [];
    let start = 0;
    cuts.forEach((c, i) => {
      if (c) {
        out.push([start, i]);
        start = i + 1;
      }
    });
    out.push([start, sentences.length - 1]);
    return out;
  }, [cuts, sentences.length]);

  const toggleCut = (i: number) => {
    if (chunkQuality !== null) return;
    setCuts((c) => c.map((v, k) => (k === i ? !v : v)));
    setProblems(null);
  };

  const checkChunks = () => {
    const found = new Map<number, string>();
    chunks.forEach(([a, b], k) => {
      const size = b - a + 1;
      const names = [...new Set(sentences.slice(a, b + 1).map((s) => topics[s.topic].name))];
      if (names.length > 1) found.set(k, `Mixes topics (${names.join(' + ')}). Retrieval would drag in unrelated text.`);
      else if (size < minChunk) found.set(k, 'Too small: one sentence on its own loses its context.');
      else if (size > maxChunk) found.set(k, 'Too big for one chunk.');
    });
    const n = checks + 1;
    setChecks(n);
    setProblems(found);
    if (found.size === 0) setChunkQuality(QUALITY[n - 1] ?? 0.3);
  };

  const reveal = () => {
    setCuts(idealCuts);
    setProblems(new Map());
    setChunkQuality(0);
  };

  const togglePick = (id: string) => {
    if (retrieved) return;
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < topK ? [...p, id] : p));
  };

  const hits = picked.filter((id) => topSet.has(id)).length;
  const precision = hits / topK;

  // Assemble the answer part by part.
  useEffect(() => {
    if (stage !== 'answer' || shownParts >= answer.length) return;
    const t = window.setTimeout(() => setShownParts((n) => n + 1), shownParts === 0 ? 400 : 900);
    return () => window.clearTimeout(t);
  }, [stage, shownParts, answer.length]);

  const finish = () => {
    const q = 0.5 * (chunkQuality ?? 0) + 0.5 * precision;
    onComplete({ score: Math.round(q * 100), stars: q >= 0.9 ? 3 : q >= 0.6 ? 2 : 1 });
  };

  const cited = answer.map((p) => p.cite).filter((c, i, a) => a.indexOf(c) === i);
  const sourceNumber = (topic: string) => cited.filter((c) => picked.includes(c)).indexOf(topic) + 1;

  return (
    <div className="flex flex-col items-center gap-3">
      <RoundHeader
        round={stage === 'chunk' ? 1 : stage === 'retrieve' ? 2 : 3}
        total={3}
        title={stage === 'chunk' ? 'Cut the document into chunks' : stage === 'retrieve' ? 'Retrieve the top 3 chunks' : 'Answer + citations'}
        color={colors.light}
      />

      {stage === 'chunk' && (
        <>
          <p className="w-full text-sm font-semibold">
            Tap a <b>✂ gap</b> between two sentences to cut there (tap again to join). A good chunk holds one topic and {minChunk}–{maxChunk}{' '}
            sentences.
          </p>
          <SimCard title={`📄 ${docTitle}`} aside={<span className="text-xs font-extrabold">{chunks.length} chunk{chunks.length === 1 ? '' : 's'}</span>}>
            <div className="flex flex-col">
              {chunks.map(([a, b], k) => {
                const problem = problems?.get(k);
                const ok = problems && !problem;
                return (
                  <Fragment key={`${a}-${b}`}>
                    {k > 0 && <GapButton index={a - 1} cut onToggle={toggleCut} disabled={chunkQuality !== null} />}
                    <div
                      className={`rounded-xl border-[3px] px-2.5 py-1.5 ${problem ? 'animate-[shake_400ms_ease-in-out]' : ''}`}
                      style={{
                        borderColor: problem ? BAD : ok ? GOOD : INK,
                        background: k % 2 === 0 ? colors.light : '#fffaf0',
                      }}
                    >
                      {sentences.slice(a, b + 1).map((s, j) => (
                        <Fragment key={a + j}>
                          {j > 0 && <GapButton index={a + j - 1} cut={false} onToggle={toggleCut} disabled={chunkQuality !== null} />}
                          <p className="text-sm leading-snug font-semibold">{s.text}</p>
                        </Fragment>
                      ))}
                      {problem && <p className="mt-1 text-xs font-extrabold" style={{ color: BAD }}>✗ {problem}</p>}
                      {ok && <p className="mt-1 text-xs font-extrabold" style={{ color: GOOD }}>✓ {topics[sentences[a].topic].name}</p>}
                    </div>
                  </Fragment>
                );
              })}
            </div>
          </SimCard>
          {chunkQuality !== null ? (
            <>
              <Feedback tone={chunkQuality > 0 ? 'good' : 'info'} title={chunkQuality > 0 ? `✓ Clean chunks${checks === 1 ? ', first try!' : '!'}` : 'Here is a good chunking.'}>
                Each chunk covers one topic, so it can be found on its own and still makes sense when it reaches the LLM.
              </Feedback>
              <GameButton onClick={() => setStage('retrieve')} color="#7fd99a">
                Next: a question arrives ▶
              </GameButton>
            </>
          ) : (
            <div className="flex flex-wrap justify-center gap-2">
              <GameButton onClick={checkChunks}>✓ Check chunks</GameButton>
              {checks >= MAX_CHECKS && (
                <GameButton onClick={reveal} color="white">
                  Show me
                </GameButton>
              )}
            </div>
          )}
        </>
      )}

      {stage === 'retrieve' && (
        <>
          <div className="w-full rounded-2xl border-[3px] px-3 py-2 text-sm font-bold" style={{ borderColor: INK, background: '#fff4d6' }}>
            💬 {query}
          </div>
          <p className="w-full text-sm font-semibold">
            The query and every chunk are turned into embeddings. Which {topK} chunks are most similar? Tap to pick {topK}.
          </p>
          <div className="flex w-full flex-col gap-2">
            {(retrieved ? ranked : topicIds).map((id) => {
              const on = picked.includes(id);
              const isTop = topSet.has(id);
              const text = sentences.filter((s) => s.topic === id).map((s) => s.text).join(' ');
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => togglePick(id)}
                  disabled={retrieved}
                  className="w-full rounded-2xl border-[3px] px-3 py-2 text-left transition-transform active:translate-y-0.5 disabled:cursor-default"
                  style={{
                    borderColor: retrieved && on ? (isTop ? GOOD : BAD) : INK,
                    background: on ? colors.light : 'white',
                    boxShadow: on ? `inset 0 3px 0 ${INK}25` : `0 3px 0 ${INK}`,
                  }}
                >
                  <span className="flex items-center justify-between gap-2 text-xs font-black tracking-wide uppercase">
                    <span>
                      {on ? '☑' : '☐'} {topics[id].name}
                    </span>
                    {retrieved && (
                      <span className="flex items-center gap-1.5 normal-case">
                        {isTop && <span title="One of the true top 3">⭐</span>}
                        <span className="tabular-nums">similarity {topics[id].score.toFixed(2)}</span>
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug font-semibold">{text}</span>
                  {retrieved && (
                    <span className="mt-1 block h-2 overflow-hidden rounded-full border-2 bg-white" style={{ borderColor: INK }}>
                      <span className="block h-full" style={{ width: `${topics[id].score * 100}%`, background: isTop ? GOOD : '#c8c2d6' }} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {retrieved ? (
            <>
              <div className="flex w-full justify-end">
                <Illustrative>Illustrative similarity scores</Illustrative>
              </div>
              <Feedback tone={hits === topK ? 'good' : 'bad'} title={`Retrieval precision: ${hits} / ${topK}`}>
                {hits === topK
                  ? 'Spot on: you retrieved exactly the chunks the vector search ranks highest (⭐).'
                  : `The ⭐ chunks are the true top ${topK}. Missing one means the LLM lacks the facts for part of the answer.`}
              </Feedback>
              <GameButton onClick={() => setStage('answer')} color="#7fd99a">
                Generate the answer ▶
              </GameButton>
            </>
          ) : (
            <GameButton onClick={() => setRetrieved(true)} disabled={picked.length !== topK}>
              🔍 Retrieve ({picked.length}/{topK})
            </GameButton>
          )}
        </>
      )}

      {stage === 'answer' && (
        <>
          <SimCard title="🤖 Answer">
            <p className="text-[15px] leading-relaxed font-semibold" aria-live="polite">
              {answer.slice(0, shownParts).map((part, i) => {
                const have = picked.includes(part.cite);
                const sep = i === 0 ? '' : i === answer.length - 1 ? ', and ' : ', ';
                return (
                  <span key={i} className="animate-[toast-in_300ms_ease-out]">
                    {sep}
                    {have ? (
                      <>
                        {i === 0 ? part.text[0].toUpperCase() + part.text.slice(1) : part.text}{' '}
                        <sup className="rounded-md border-2 px-1 text-[11px] font-black" style={{ borderColor: INK, background: colors.light }}>
                          {sourceNumber(part.cite)}
                        </sup>
                      </>
                    ) : (
                      <span className="rounded-md px-1" style={{ background: '#ffe1e1', color: BAD }}>
                        ⚠ [no retrieved source for {topics[part.cite].name.toLowerCase()}]
                      </span>
                    )}
                  </span>
                );
              })}
              {shownParts >= answer.length && '.'}
              {shownParts < answer.length && <span className="animate-[pulse-dot_900ms_ease-in-out_infinite]"> ▍</span>}
            </p>
            {shownParts >= answer.length && (
              <div className="mt-2 border-t-2 border-dashed pt-2 text-xs font-bold" style={{ borderColor: `${INK}30` }}>
                Sources:{' '}
                {cited
                  .filter((c) => picked.includes(c))
                  .map((c) => `[${sourceNumber(c)}] ${docTitle} › ${topics[c].name}`)
                  .join('  ·  ') || 'none'}
              </div>
            )}
          </SimCard>
          {shownParts >= answer.length && (
            <>
              <Feedback
                tone={hits === topK ? 'good' : 'info'}
                title={hits === topK ? 'Every claim has a citation.' : 'Missing context means a gap in the answer.'}
              >
                {hits === topK
                  ? 'Citations let users check each fact against the source. Good chunks + precise retrieval = a grounded answer.'
                  : 'Without the right chunk, the LLM either leaves a gap or, worse, guesses. That is where hallucinations come from.'}
              </Feedback>
              <GameButton onClick={finish} color="#7fd99a">
                Finish ▶
              </GameButton>
            </>
          )}
        </>
      )}
    </div>
  );
}

function GapButton({ index, cut, onToggle, disabled }: { index: number; cut: boolean; onToggle: (i: number) => void; disabled: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={cut}
      aria-label={cut ? `Join sentences ${index + 1} and ${index + 2}` : `Cut between sentences ${index + 1} and ${index + 2}`}
      onClick={() => onToggle(index)}
      disabled={disabled}
      className="group relative flex h-8 w-full items-center justify-center disabled:cursor-default"
    >
      <span
        className="absolute inset-x-1 top-1/2 border-t-[3px]"
        style={{ borderColor: cut ? INK : `${INK}25`, borderStyle: cut ? 'solid' : 'dashed' }}
        aria-hidden
      />
      <span
        className="relative rounded-full border-2 px-2 text-xs font-black transition-transform group-active:scale-90"
        style={{ borderColor: cut ? INK : `${INK}40`, background: cut ? '#ffd66e' : 'white', opacity: disabled && !cut ? 0 : 1 }}
        aria-hidden
      >
        ✂{cut ? ' cut' : ''}
      </span>
    </button>
  );
}
