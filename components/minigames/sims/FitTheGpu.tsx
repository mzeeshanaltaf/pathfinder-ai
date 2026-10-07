'use client';

import { useState } from 'react';
import { INK } from '@/components/ui/kit';
import type { FitTheGpuConfig, FtMethod, GpuScenario, Precision } from '@/data/sims';
import { Feedback, GameButton } from '../kit';
import type { MiniGameProps } from '../types';
import { BAD, clamp, Illustrative, Meter, RoundHeader, Segmented, SimCard, starsFromPoints, trackColors } from './simKit';

// Illustrative memory model (GB per billion parameters) and quality scores.
const BYTES: Record<Precision, number> = { fp16: 2, int8: 1, int4: 0.5 };
const PRECISION_QUALITY: Record<Precision, number> = { fp16: 1, int8: 0.99, int4: 0.96 };
const METHOD_QUALITY: Record<FtMethod, number> = { full: 100, lora: 97, qlora: 97 };
const METHOD_LABEL: Record<FtMethod, string> = { full: 'Full fine-tuning', lora: 'LoRA', qlora: 'QLoRA' };
const PRECISION_LABEL: Record<Precision, string> = { fp16: 'FP16', int8: 'INT8', int4: '4-bit' };

interface Segment {
  label: string;
  gb: number;
  color: string;
}

function plan(s: GpuScenario, method: FtMethod, precision: Precision) {
  const P = s.paramsB;
  const segs: Segment[] = [{ label: `Weights (${PRECISION_LABEL[precision]})`, gb: P * BYTES[precision], color: '#82bdf2' }];
  if (s.task === 'finetune') {
    if (method === 'full') {
      segs.push({ label: 'Gradients', gb: P * 2, color: '#ffc078' });
      segs.push({ label: 'Optimizer states (Adam)', gb: P * 8, color: '#ff9eb8' });
    } else {
      segs.push({ label: 'Adapters + optimizer', gb: P * 0.1, color: '#7fd99a' });
    }
    segs.push({ label: 'Activations', gb: s.extraGB, color: '#b9a3ee' });
  } else {
    segs.push({ label: 'KV cache + runtime', gb: s.extraGB, color: '#b9a3ee' });
  }
  const total = segs.reduce((a, b) => a + b.gb, 0);
  const quality = (s.task === 'finetune' ? METHOD_QUALITY[method] : 100) * PRECISION_QUALITY[precision];
  return { segs, total, quality, fits: total <= s.gpuGB, good: quality >= s.minQuality };
}

/** Every valid choice for a scenario. */
function options(s: GpuScenario): [FtMethod, Precision][] {
  return s.task === 'finetune'
    ? [
        ['full', 'fp16'],
        ['lora', 'fp16'],
        ['lora', 'int8'],
        ['qlora', 'int4'],
      ]
    : [
        ['full', 'fp16'],
        ['full', 'int8'],
        ['full', 'int4'],
      ];
}

const describe = (s: GpuScenario, m: FtMethod, p: Precision) =>
  s.task === 'finetune' ? (m === 'qlora' ? 'QLoRA (4-bit)' : `${METHOD_LABEL[m]} on ${PRECISION_LABEL[p]}`) : `${PRECISION_LABEL[p]} weights`;

type Verdict = { tone: 'good' | 'bad'; title: string; text: string; solved: boolean };

export default function FitTheGpu({ phaseId, config, onComplete }: MiniGameProps<FitTheGpuConfig>) {
  const colors = trackColors(phaseId);
  const { scenarios } = config;
  const [index, setIndex] = useState(0);
  const [method, setMethod] = useState<FtMethod>('full');
  const [precision, setPrecision] = useState<Precision>('fp16');
  const [tries, setTries] = useState(0);
  const [points, setPoints] = useState(0);
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  const s = scenarios[index];
  const p = plan(s, method, precision);
  const solved = !!verdict?.solved;

  const pickMethod = (m: FtMethod) => {
    setMethod(m);
    // Full fine-tuning trains FP16 weights; QLoRA is LoRA on a 4-bit base.
    if (m === 'full') setPrecision('fp16');
    else if (m === 'qlora') setPrecision('int4');
    else if (precision === 'int4') setPrecision('fp16');
    setVerdict(null);
  };
  const pickPrecision = (pr: Precision) => {
    setPrecision(pr);
    setVerdict(null);
  };

  const launch = () => {
    const n = tries + 1;
    setTries(n);
    if (!p.fits) {
      setVerdict({
        tone: 'bad',
        title: `💥 CUDA out of memory! Needs ${p.total.toFixed(1)} GB, the GPU has ${s.gpuGB} GB.`,
        text:
          s.task === 'finetune' && method === 'full'
            ? 'Full fine-tuning stores gradients and optimizer states for every weight: several times the model itself. Try LoRA.'
            : 'The weights alone are too big at this precision. Quantize them to fewer bits.',
        solved: false,
      });
      return;
    }
    if (!p.good) {
      setVerdict({
        tone: 'bad',
        title: `📉 It fits, but quality ${p.quality.toFixed(1)} is below the ${s.minQuality} this job needs.`,
        text: 'Fewer bits save memory but cost a little accuracy. Find a setting that fits with less quality loss.',
        solved: false,
      });
      return;
    }
    const valid = options(s)
      .map(([m, pr]) => ({ m, pr, r: plan(s, m, pr) }))
      .filter((o) => o.r.fits && o.r.good)
      .sort((a, b) => b.r.quality - a.r.quality);
    const best = valid[0];
    const optimal = p.quality >= best.r.quality - 1e-9;
    if (optimal && n === 1) setPoints((x) => x + 1);
    setVerdict({
      tone: 'good',
      title: optimal ? '🚀 Launched! The best quality that still fits.' : '🚀 Launched! It works…',
      text: optimal
        ? s.task === 'finetune'
          ? method === 'qlora'
            ? 'QLoRA trains small adapters on a 4-bit base, so even big models fit on one GPU.'
            : 'LoRA freezes the model and trains small adapter matrices, so the optimizer only tracks a tiny fraction of the parameters.'
          : 'INT8 halves the weights with almost no quality loss. 4-bit would fit too, but drops below the quality bar.'
        : `…but ${describe(s, best.m, best.pr)} would also fit, with higher quality (${best.r.quality.toFixed(1)}).`,
      solved: true,
    });
  };

  const next = () => {
    if (index + 1 >= scenarios.length) {
      onComplete({ score: Math.round((100 * points) / scenarios.length), stars: starsFromPoints(points) });
      return;
    }
    setIndex(index + 1);
    setTries(0);
    setVerdict(null);
    setMethod('full');
    setPrecision('fp16');
  };

  const scale = Math.max(s.gpuGB * 1.3, p.total);
  const over = Math.max(0, p.total - s.gpuGB);

  return (
    <div className="flex flex-col items-center gap-3">
      <RoundHeader round={index + 1} total={scenarios.length} title={s.title} color={colors.light} />
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 flex-1 text-sm font-semibold">{s.story}</p>
        <Illustrative />
      </div>

      <SimCard
        title={`GPU memory · ${s.gpuGB} GB`}
        aside={
          <span className="text-sm font-black tabular-nums" style={{ color: p.fits ? INK : BAD }}>
            {p.total.toFixed(1)} GB {p.fits ? '✓' : '✗'}
          </span>
        }
      >
        <div className="relative h-10 w-full overflow-hidden rounded-xl border-[3px] bg-white" style={{ borderColor: INK }} aria-label={`Uses ${p.total.toFixed(1)} of ${s.gpuGB} GB`}>
          <div className="flex h-full">
            {p.segs.map((g) => (
              <div
                key={g.label}
                className="h-full border-r-2 transition-[width] duration-300 last:border-r-0"
                style={{ width: `${(g.gb / scale) * 100}%`, background: g.color, borderColor: `${INK}60` }}
              />
            ))}
          </div>
          {over > 0 && (
            <div
              aria-hidden
              className="absolute inset-y-0 right-0"
              style={{
                left: `${(s.gpuGB / scale) * 100}%`,
                background: `repeating-linear-gradient(45deg, ${BAD}55 0 6px, transparent 6px 12px)`,
              }}
            />
          )}
          <div aria-hidden className="absolute inset-y-0 w-1" style={{ left: `calc(${(s.gpuGB / scale) * 100}% - 2px)`, background: INK }} />
        </div>
        <ul className="mt-2 grid grid-cols-1 gap-x-3 gap-y-0.5 text-xs font-bold sm:grid-cols-2">
          {p.segs.map((g) => (
            <li key={g.label} className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="h-3 w-3 shrink-0 rounded-sm border-2" style={{ borderColor: INK, background: g.color }} />
                <span className="truncate">{g.label}</span>
              </span>
              <span className="tabular-nums">{g.gb.toFixed(1)} GB</span>
            </li>
          ))}
        </ul>
        {over > 0 && <p className="mt-1 text-xs font-extrabold" style={{ color: BAD }}>Over by {over.toFixed(1)} GB</p>}
        <div className="mt-3">
          <Meter
            label={`Quality (needs ${s.minQuality}+)`}
            value={clamp((p.quality - 85) / 15, 0, 1)}
            display={p.quality.toFixed(1)}
            threshold={(s.minQuality - 85) / 15}
          />
        </div>
      </SimCard>

      {s.task === 'finetune' && (
        <Segmented<FtMethod>
          label="Fine-tuning method"
          value={method}
          onChange={pickMethod}
          color={colors.base}
          options={[
            { value: 'full', label: 'Full FT', disabled: solved },
            { value: 'lora', label: 'LoRA', disabled: solved },
            { value: 'qlora', label: 'QLoRA', disabled: solved },
          ]}
        />
      )}
      <Segmented<Precision>
        label={s.task === 'finetune' ? 'Base-model precision' : 'Weight precision (quantization)'}
        value={precision}
        onChange={pickPrecision}
        color={colors.base}
        options={(['fp16', 'int8', 'int4'] as Precision[]).map((pr) => ({
          value: pr,
          label: PRECISION_LABEL[pr],
          disabled:
            solved ||
            (s.task === 'finetune' && ((method === 'full' && pr !== 'fp16') || (method === 'qlora' && pr !== 'int4') || (method === 'lora' && pr === 'int4'))),
        }))}
      />
      {s.task === 'finetune' && (
        <p className="w-full text-xs font-bold opacity-70">
          {method === 'full'
            ? 'Full fine-tuning updates every weight, so it trains in FP16.'
            : method === 'qlora'
              ? 'QLoRA = LoRA on top of a 4-bit quantized base model.'
              : 'LoRA can sit on an FP16 or INT8 base. (On a 4-bit base it becomes QLoRA.)'}
        </p>
      )}

      {verdict && (
        <Feedback tone={verdict.tone} title={verdict.title}>
          {verdict.text}
        </Feedback>
      )}

      {solved ? (
        <GameButton onClick={next} color="#7fd99a">
          {index + 1 < scenarios.length ? 'Next job ▶' : 'Finish ▶'}
        </GameButton>
      ) : (
        <GameButton onClick={launch}>🚀 Launch</GameButton>
      )}
      <p className="text-xs font-bold opacity-60">
        Stars so far: {points} · a star for each job launched first time with the best quality that fits
      </p>
    </div>
  );
}
