'use client';

import { useMemo, useRef, useState } from 'react';
import { INK } from '@/components/ui/kit';
import type { BatchingConfig } from '@/data/sims';
import { mulberry32 } from '@/lib/random';
import { Feedback, GameButton } from '../kit';
import type { MiniGameProps } from '../types';
import { BAD, GOLD, GOOD, Illustrative, Meter, Segmented, SimCard, Stat, trackColors, useRaf } from './simKit';

/** Real seconds to play back the whole simulated rush hour. */
const PLAYBACK_S = 6.5;
/** Unserved requests count as this much later than the end of the run. */
const UNSERVED_PENALTY_MS = 2000;

interface Batch {
  gpu: number;
  start: number;
  end: number;
  size: number;
}
interface Run {
  gpus: number;
  batch: number;
  wait: number;
  arrivals: number[];
  done: number[];
  dispatched: number[];
  batches: Batch[];
  final: Metrics;
}
interface Metrics {
  throughput: number;
  offered: number;
  servedPct: number;
  p95: number;
  util: number;
  costPer1k: number;
}

function arrivals({ traffic }: BatchingConfig) {
  const { seconds, seed, peakRps } = traffic;
  const D = seconds * 1000;
  const rate = (t: number) => {
    const u = t / D;
    return u < 0.6 ? 8 + (peakRps - 8) * (u / 0.6) : peakRps - (peakRps - 30) * ((u - 0.6) / 0.4);
  };
  const r = mulberry32(seed);
  const out: number[] = [];
  let t = 0;
  for (;;) {
    t += -Math.log(1 - r()) * (1000 / rate(t));
    if (t >= D) return out;
    out.push(t);
  }
}

/** Dynamic batching: a free GPU takes up to `batch` queued requests once the queue is full enough or the oldest has waited `wait` ms. */
function simulate(cfg: BatchingConfig, arr: number[], gpus: number, batch: number, wait: number): Run {
  const D = cfg.traffic.seconds * 1000;
  const { base, perItem } = cfg.batchMs;
  const n = arr.length;
  const done = Array<number>(n).fill(Infinity);
  const dispatched = Array<number>(n).fill(Infinity);
  const busy = Array<number>(gpus).fill(0);
  const batches: Batch[] = [];
  let head = 0;
  let next = 0;
  for (let t = 0; t <= D; t++) {
    while (next < n && arr[next] <= t) next++;
    for (let g = 0; g < gpus; g++) {
      const queued = next - head;
      if (t < busy[g] || queued === 0 || (queued < batch && t - arr[head] < wait)) continue;
      const size = Math.min(batch, queued);
      const end = t + base + perItem * size;
      for (let k = head; k < head + size; k++) {
        dispatched[k] = t;
        done[k] = end;
      }
      batches.push({ gpu: g, start: t, end, size });
      busy[g] = end;
      head += size;
    }
  }
  const lat = arr.map((a, k) => (Number.isFinite(done[k]) ? done[k] - a : D - a + UNSERVED_PENALTY_MS)).sort((a, b) => a - b);
  const served = done.filter(Number.isFinite).length;
  const work = batches.reduce((s, b) => s + perItem * b.size, 0);
  const final: Metrics = {
    throughput: served / cfg.traffic.seconds,
    offered: n / cfg.traffic.seconds,
    servedPct: served / n,
    p95: lat[Math.floor(lat.length * 0.95)] ?? 0,
    util: work / (gpus * D),
    costPer1k: ((gpus * cfg.gpuHourly) / 3600) * cfg.traffic.seconds * (1000 / Math.max(1, served)),
  };
  return { gpus, batch, wait, arrivals: arr, done, dispatched, batches, final };
}

/** Metrics as seen so far at simulated time t (waiting requests count with their current wait). */
function liveMetrics(run: Run, t: number, perItem: number) {
  const lat: number[] = [];
  let served = 0;
  let queued = 0;
  for (let k = 0; k < run.arrivals.length && run.arrivals[k] <= t; k++) {
    if (run.done[k] <= t) {
      served++;
      lat.push(run.done[k] - run.arrivals[k]);
    } else lat.push(t - run.arrivals[k]);
    if (run.dispatched[k] > t) queued++;
  }
  lat.sort((a, b) => a - b);
  let work = 0;
  const lanes: number[] = Array(run.gpus).fill(0);
  for (const b of run.batches) {
    if (b.start > t) break;
    work += perItem * b.size * Math.min(1, (t - b.start) / (b.end - b.start));
    if (b.end > t) lanes[b.gpu] = b.size;
  }
  return {
    p95: lat.length ? lat[Math.floor(lat.length * 0.95)] : 0,
    throughput: t > 0 ? served / (t / 1000) : 0,
    util: t > 0 ? work / (run.gpus * t) : 0,
    queued,
    lanes,
  };
}

function runStars(run: Run, sla: number): 0 | 1 | 2 | 3 {
  const f = run.final;
  if (f.p95 > sla || f.servedPct < 0.98) return 0;
  return run.gpus === 1 ? 3 : run.gpus === 2 ? 2 : 1;
}

export default function Batching({ phaseId, config, onComplete }: MiniGameProps<BatchingConfig>) {
  const colors = trackColors(phaseId);
  const { slaMs, batchSizes, maxWaitsMs, maxGpus, lanes, batchMs, traffic } = config;
  const arr = useMemo(() => arrivals(config), [config]);
  const [gpus, setGpus] = useState(1);
  const [batch, setBatch] = useState(batchSizes[0]);
  const [wait, setWait] = useState(maxWaitsMs[0]);
  const [run, setRun] = useState<Run | null>(null);
  const [simT, setSimT] = useState(0);
  const [history, setHistory] = useState<{ run: Run; stars: number }[]>([]);
  const playT = useRef(0);
  const lastUi = useRef(0);
  const recorded = useRef(false);

  const D = traffic.seconds * 1000;
  const playing = !!run && simT < D;

  useRaf(playing, (dt, now) => {
    playT.current = Math.min(D, playT.current + (dt / PLAYBACK_S) * D);
    // ~12 UI updates per second is plenty for the gauges.
    if (now - lastUi.current > 80 || playT.current >= D) {
      lastUi.current = now;
      setSimT(playT.current);
      if (playT.current >= D && run && !recorded.current) {
        recorded.current = true;
        setHistory((h) => [...h, { run, stars: runStars(run, slaMs) }]);
      }
    }
  });

  const start = () => {
    const r = simulate(config, arr, gpus, batch, wait);
    playT.current = 0;
    recorded.current = false;
    setSimT(0);
    setRun(r);
  };

  const live = run ? liveMetrics(run, simT, batchMs.perItem) : null;
  const finished = !!run && !playing;
  const shown = finished && run ? { ...run.final, lanes: Array(run.gpus).fill(0), queued: 0 } : live;
  const lastStars = finished && run ? runStars(run, slaMs) : 0;
  const best = history.reduce((b, h) => Math.max(b, h.stars), 0);

  const finish = () => {
    const stars = Math.max(1, best) as 1 | 2 | 3;
    onComplete({ score: [10, 60, 80, 100][best], stars });
  };

  const rateNow = (() => {
    const u = simT / D;
    return u < 0.6 ? 8 + (traffic.peakRps - 8) * (u / 0.6) : traffic.peakRps - (traffic.peakRps - 30) * ((u - 0.6) / 0.4);
  })();

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 flex-1 text-sm font-semibold">
          Goal: serve every request with <b>p95 latency under {slaMs} ms</b>, on as few GPUs as possible.
        </p>
        <Illustrative />
      </div>

      <SimCard
        title={run ? `Rush hour · ${(simT / 1000).toFixed(1)} s / ${traffic.seconds} s` : 'Rush hour'}
        aside={run && <span className="text-xs font-extrabold tabular-nums">{Math.round(rateNow)} req/s arriving</span>}
      >
        {/* time bar */}
        <div className="mb-2 h-2 w-full overflow-hidden rounded-full border-2 bg-white" style={{ borderColor: INK }} aria-hidden>
          <div className="h-full" style={{ width: `${(simT / D) * 100}%`, background: colors.base }} />
        </div>
        <div className="mb-2 flex min-h-7 flex-wrap items-center gap-1" aria-label={`Queue: ${shown?.queued ?? 0} waiting`}>
          <span className="mr-1 text-xs font-extrabold">Queue</span>
          {Array.from({ length: Math.min(36, shown?.queued ?? 0) }, (_, i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: INK, background: GOLD }} />
          ))}
          {(shown?.queued ?? 0) > 36 && <span className="text-xs font-black" style={{ color: BAD }}>+{(shown?.queued ?? 0) - 36}</span>}
          {(shown?.queued ?? 0) === 0 && <span className="text-xs font-bold opacity-50">empty</span>}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: maxGpus }, (_, g) => {
            const active = g < (run?.gpus ?? gpus);
            const lit = shown?.lanes[g] ?? 0;
            return (
              <div
                key={g}
                className="rounded-xl border-[3px] p-1.5"
                style={{ borderColor: active ? INK : `${INK}25`, background: active ? '#f4f1fb' : 'transparent', opacity: active ? 1 : 0.5 }}
              >
                <div className="mb-1 flex items-center justify-between text-[10px] font-black">
                  <span>GPU {g + 1}</span>
                  <span className="tabular-nums">{active ? (lit ? `batch ${lit}` : 'idle') : 'not rented'}</span>
                </div>
                <div className="grid grid-cols-8 gap-0.5" aria-hidden>
                  {Array.from({ length: lanes }, (_, i) => (
                    <span key={i} className="aspect-square rounded-[3px]" style={{ background: active && i < lit ? colors.dark : '#ffffff', outline: `1px solid ${INK}30` }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {shown && (
          <div className="mt-3 flex flex-col gap-1.5">
            <Meter label={`p95 latency (SLA ${slaMs} ms)`} value={Math.min(1, shown.p95 / (slaMs * 2))} display={`${Math.round(shown.p95)} ms`} threshold={0.5} good="low" />
            <Meter
              label="Throughput"
              value={Math.min(1, shown.throughput / (traffic.peakRps * 0.75))}
              display={`${shown.throughput.toFixed(1)} req/s`}
              color={colors.base}
            />
            <Meter label="GPU utilisation (useful work)" value={shown.util} display={`${Math.round(shown.util * 100)}%`} color="#b9a3ee" />
          </div>
        )}
      </SimCard>

      <Segmented<number> label="GPUs to rent" value={gpus} onChange={setGpus} color={colors.base} options={Array.from({ length: maxGpus }, (_, i) => ({ value: i + 1, label: `${i + 1}`, disabled: playing }))} />
      <Segmented<number> label="Max batch size" value={batch} onChange={setBatch} color={colors.base} options={batchSizes.map((b) => ({ value: b, label: `${b}`, disabled: playing }))} />
      <Segmented<number>
        label="Max wait for a batch to fill"
        value={wait}
        onChange={setWait}
        color={colors.base}
        options={maxWaitsMs.map((w) => ({ value: w, label: `${w} ms`, disabled: playing }))}
      />

      <GameButton onClick={start} disabled={playing} color="#c6e0fa">
        {playing ? 'Running…' : run ? '↻ Run again' : '▶ Run rush hour'}
      </GameButton>

      {finished && run && (
        <>
          <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Scoreboard">
            <Stat label="Latency ↓ (p95)" value={`${Math.round(run.final.p95)} ms`} tone={run.final.p95 <= slaMs ? 'good' : 'bad'} />
            <Stat label="Cost ↓ /1k req" value={`$${run.final.costPer1k.toFixed(3)}`} tone={run.gpus === 1 ? 'good' : run.gpus === 2 ? 'info' : 'bad'} />
            <Stat label="GPU util ↑" value={`${Math.round(run.final.util * 100)}%`} tone={run.final.util >= 0.3 ? 'good' : 'info'} />
            <Stat label="Throughput ↑" value={`${Math.round(run.final.servedPct * 100)}% served`} tone={run.final.servedPct >= 0.98 ? 'good' : 'bad'} />
          </div>
          <Feedback
            tone={lastStars ? 'good' : 'bad'}
            title={
              lastStars === 3
                ? '★★★ SLA met on a single GPU!'
                : lastStars
                  ? `${'★'.repeat(lastStars)} SLA met, but with ${run.gpus} GPUs.`
                  : run.final.servedPct < 0.98
                    ? '✗ The queue exploded: requests were left unserved.'
                    : `✗ p95 latency ${Math.round(run.final.p95)} ms is over the ${slaMs} ms SLA.`
            }
          >
            {lastStars === 3
              ? 'Batching lets one GPU work on many requests at once, so the same hardware handles far more traffic.'
              : lastStars
                ? 'It works, but each extra GPU costs money and sits mostly idle. Can bigger batches do it on fewer GPUs?'
                : run.final.servedPct < 0.98
                  ? 'Each batch has a fixed overhead. With small batches the GPU spends most of its time on overhead and falls behind. Try bigger batches.'
                  : run.wait >= 200
                    ? 'Waiting a long time for batches to fill adds that wait to every request. Try a shorter max wait.'
                    : 'Batches are still too small for the peak. Try a bigger max batch size.'}
          </Feedback>
        </>
      )}

      {history.length > 0 && (
        <SimCard title="Your runs">
          <ul className="flex flex-col gap-1 text-xs font-bold tabular-nums">
            {history.map((h, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-x-2">
                <span>
                  {h.run.gpus} GPU · batch {h.run.batch} · wait {h.run.wait} ms
                </span>
                <span>
                  p95 {Math.round(h.run.final.p95)} ms ·{' '}
                  <span style={{ color: h.stars ? GOOD : BAD }}>{h.stars ? '★'.repeat(h.stars) : '✗'}</span>
                </span>
              </li>
            ))}
          </ul>
        </SimCard>
      )}

      {history.length > 0 && !playing && (
        <GameButton onClick={finish} color="#7fd99a">
          Finish with {'★'.repeat(Math.max(1, best))} ▶
        </GameButton>
      )}
    </div>
  );
}
