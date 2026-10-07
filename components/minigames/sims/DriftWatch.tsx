'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { INK } from '@/components/ui/kit';
import type { DriftWatchConfig } from '@/data/sims';
import { hash3 } from '@/lib/random';
import { Feedback, GameButton } from '../kit';
import PipelineOrder from '../PipelineOrder';
import type { MiniGameProps } from '../types';
import { BAD, clamp, Illustrative, Meter, RoundHeader, SimCard, trackColors, useRaf, WARN } from './simKit';

/** Real seconds per simulated day. */
const DAY_S = 0.5;
/** Days for the input distribution to shift completely. */
const RAMP = 14;
/** Labels (and so measured accuracy) arrive this many days late. */
const LABEL_LAG = 6;
const BASE_ACC = 92;
const ACC_DROP = 14;
const BASELINE = [0.06, 0.16, 0.24, 0.2, 0.14, 0.1, 0.06, 0.04];
const SHIFTED = [0.02, 0.05, 0.09, 0.13, 0.17, 0.2, 0.18, 0.16];

const RETRAIN_STEPS = ['Collect fresh labelled data', 'Train model v2', 'Evaluate v2 vs v1', 'Register v2', 'Deploy v2'];

type Stage = 'monitor' | 'retraining' | 'summary' | 'loop';
type Timing = 'perfect' | 'late' | 'missed';

export default function DriftWatch({ phaseId, config, onComplete }: MiniGameProps<DriftWatchConfig>) {
  const colors = trackColors(phaseId);
  const { days, slo, psiAlert, feature, bins, pipeline } = config;
  // Drift starts on a random day, so the player has to watch rather than memorise.
  const [onset] = useState(() => 16 + Math.floor(Math.random() * 11));
  const [seed] = useState(() => Math.random() * 1000);
  const [day, setDay] = useState(0);
  const [alertDay, setAlertDay] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [stage, setStage] = useState<Stage>('monitor');
  const [wasted, setWasted] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const [timing, setTiming] = useState<{ kind: Timing; day: number } | null>(null);
  const [retrainStep, setRetrainStep] = useState(0);
  const dayF = useRef(0);

  const drift = (d: number) => clamp((d - onset) / RAMP, 0, 1);
  const noise = (d: number, k: number) => hash3(d, k, seed) - 0.5;

  const live = (d: number) => {
    const p = drift(d);
    const raw = BASELINE.map((b, i) => Math.max(0.005, (1 - p) * b + p * SHIFTED[i] + noise(d, i) * 0.02));
    const sum = raw.reduce((a, b) => a + b, 0);
    return raw.map((v) => v / sum);
  };
  const psiAt = (d: number) => live(d).reduce((s, a, i) => s + (a - BASELINE[i]) * Math.log(a / BASELINE[i]), 0);
  const accAt = (d: number) => BASE_ACC - ACC_DROP * drift(d - LABEL_LAG) + noise(d, 99) * 1.2;

  const history = useMemo(() => Array.from({ length: day + 1 }, (_, d) => accAt(d)), [day]); // eslint-disable-line react-hooks/exhaustive-deps
  const breachDay = history.findIndex((a) => a < slo);
  const hist = live(day);
  const psi = psiAt(day);
  const acc = history[day];
  // The alert latches once raised (like a real monitor), so day-to-day noise can't make it flicker.
  const alert = alertDay !== null;

  useRaf(stage === 'monitor' && !paused, (dt) => {
    dayF.current = Math.min(days, dayF.current + dt / DAY_S);
    const d = Math.floor(dayF.current);
    if (d === day) return;
    setDay(d);
    if (alertDay === null && psiAt(d) >= psiAlert) setAlertDay(d);
  });

  // Nobody pressed the button: the season ends and retraining happens far too late.
  useEffect(() => {
    if (stage !== 'monitor' || day < days) return;
    const t = window.setTimeout(() => {
      setTiming({ kind: 'missed', day });
      setStage('retraining');
    }, 0);
    return () => window.clearTimeout(t);
  }, [day, days, stage]);

  const trigger = () => {
    if (stage !== 'monitor') return;
    if (!alert && breachDay === -1) {
      setWasted((w) => w + 1);
      setNote(`Too early: the incoming data still matches the training data (PSI ${psi.toFixed(2)} < ${psiAlert}). Retraining now burns compute and changes nothing.`);
      return;
    }
    setNote(null);
    setTiming({ kind: breachDay === -1 ? 'perfect' : 'late', day });
    setStage('retraining');
  };

  useEffect(() => {
    if (stage !== 'retraining') return;
    const t = window.setTimeout(() => {
      if (retrainStep >= RETRAIN_STEPS.length) setStage('summary');
      else setRetrainStep((n) => n + 1);
    }, 450);
    return () => window.clearTimeout(t);
  }, [stage, retrainStep]);

  const daysBelow = timing && breachDay !== -1 ? timing.day - breachDay : 0;
  const stage1Stars: 1 | 2 | 3 =
    timing?.kind === 'perfect' ? (wasted === 0 ? 3 : 2) : timing?.kind === 'late' ? (daysBelow <= 4 && wasted === 0 ? 2 : 1) : 1;

  const finish = (loopStars: 1 | 2 | 3) => {
    const total = stage1Stars + loopStars;
    onComplete({ score: Math.round((100 * total) / 6), stars: Math.round(total / 2) as 1 | 2 | 3 });
  };

  if (stage === 'loop') {
    return (
      <div className="flex flex-col items-center gap-3">
        <RoundHeader round={2} total={2} title="Rebuild the retraining loop" color={colors.light} />
        <p className="w-full text-sm font-semibold">Put the model lifecycle in order. The last step feeds back into the first.</p>
        <PipelineOrder phaseId={phaseId} config={pipeline} onComplete={(r) => finish(r.stars)} onExit={() => {}} />
      </div>
    );
  }

  // Chart geometry.
  const W = 320;
  const H = 120;
  const ax = (d: number) => 8 + (d / days) * (W - 16);
  const ay = (a: number) => H - 8 - ((clamp(a, 76, 96) - 76) / 20) * (H - 16);
  const accLine = history.map((a, d) => `${ax(d).toFixed(1)},${ay(a).toFixed(1)}`).join(' ');

  return (
    <div className="flex flex-col items-center gap-3">
      <RoundHeader round={1} total={2} title="Live model dashboard" color={colors.light} />
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-extrabold tabular-nums">
          📅 Day {day} / {days}
        </span>
        <span className="flex items-center gap-2">
          {alert && stage === 'monitor' && (
            <span className="rounded-full border-2 px-2 py-0.5 text-xs font-black text-white animate-[pulse-dot_900ms_ease-in-out_infinite]" style={{ borderColor: INK, background: BAD }}>
              🚨 Drift alert
            </span>
          )}
          <Illustrative>Simulated data</Illustrative>
        </span>
      </div>

      <SimCard title="Accuracy (measured from late-arriving labels)" aside={<span className="text-sm font-black tabular-nums" style={{ color: acc < slo ? BAD : INK }}>{acc.toFixed(1)}%</span>}>
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label={`Accuracy ${acc.toFixed(1)} percent, target ${slo}`}>
          <rect width={W} height={H} rx="10" fill="#f7f5fc" />
          <rect x="0" y={ay(slo)} width={W} height={H - ay(slo)} fill="#ffe1e1" opacity="0.6" />
          <line x1="0" x2={W} y1={ay(slo)} y2={ay(slo)} stroke={BAD} strokeWidth="2" strokeDasharray="6 4" />
          <text x={W - 6} y={ay(slo) - 4} textAnchor="end" fontSize="10" fontWeight="800" fill={BAD}>
            target {slo}%
          </text>
          {stage !== 'monitor' && (
            <g>
              <line x1={ax(onset)} x2={ax(onset)} y1="4" y2={H - 4} stroke={WARN} strokeWidth="2.5" strokeDasharray="3 3" />
              <text x={ax(onset) + 4} y="14" fontSize="10" fontWeight="800" fill={INK}>
                drift began
              </text>
            </g>
          )}
          {timing && <line x1={ax(timing.day)} x2={ax(timing.day)} y1="4" y2={H - 4} stroke={INK} strokeWidth="3" />}
          <polyline points={accLine} fill="none" stroke={colors.dark} strokeWidth="3" strokeLinejoin="round" />
          <circle cx={ax(day)} cy={ay(acc)} r="4.5" fill="white" stroke={INK} strokeWidth="2.5" />
        </svg>
      </SimCard>

      <SimCard title={`Input distribution · ${feature}`}>
        <div className="flex h-24 items-end gap-1.5" aria-label="Live distribution compared with the training baseline">
          {hist.map((v, i) => (
            <div key={i} className="relative flex h-full flex-1 flex-col justify-end">
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 rounded-t-md border-2 border-dashed"
                style={{ height: `${(BASELINE[i] / 0.26) * 100}%`, borderColor: `${INK}70` }}
              />
              <div className="rounded-t-md border-2 transition-[height] duration-300" style={{ height: `${(v / 0.26) * 100}%`, borderColor: INK, background: alert ? '#ffb3a8' : colors.base, opacity: 0.85 }} />
            </div>
          ))}
        </div>
        <div className="mt-0.5 flex gap-1.5 text-center text-[10px] font-bold">
          {bins.map((b) => (
            <span key={b} className="flex-1">
              {b}
            </span>
          ))}
        </div>
        <p className="mt-1 text-[11px] font-bold opacity-70">Filled = live traffic · dashed = what the model was trained on</p>
        <div className="mt-2">
          <Meter label={`Drift score (PSI) · alert at ${psiAlert}`} value={psi / (psiAlert * 2.5)} display={psi.toFixed(2)} threshold={1 / 2.5} good="low" />
        </div>
      </SimCard>

      {stage === 'monitor' && (
        <>
          {note && !alert && <Feedback tone="bad" title="💸 Wasted retraining run">{note}</Feedback>}
          <div className="flex flex-wrap justify-center gap-2">
            <GameButton onClick={trigger} color={alert ? '#ff9f9f' : '#ffd66e'}>
              🔁 Trigger retraining
            </GameButton>
            <GameButton onClick={() => setPaused((p) => !p)} color="white">
              {paused ? '▶ Resume' : '⏸ Pause'}
            </GameButton>
          </div>
          <p className="w-full text-center text-xs font-bold opacity-60">
            Accuracy is only known once labels arrive, days later. The input distribution changes first.
          </p>
        </>
      )}

      {stage === 'retraining' && (
        <SimCard title="Retraining…">
          <ol className="flex flex-col gap-1 text-sm font-bold">
            {RETRAIN_STEPS.map((s, i) => (
              <li key={s} style={{ opacity: i < retrainStep ? 1 : 0.35 }}>
                {i < retrainStep ? '✅' : '⏳'} {s}
              </li>
            ))}
          </ol>
        </SimCard>
      )}

      {stage === 'summary' && timing && (
        <>
          <Feedback
            tone={timing.kind === 'perfect' ? 'good' : 'bad'}
            title={
              timing.kind === 'perfect'
                ? `✓ Right on time: day ${timing.day}, before accuracy fell below ${slo}%.${wasted ? ` (${wasted} wasted run${wasted === 1 ? '' : 's'})` : ''}`
                : timing.kind === 'late'
                  ? `⏰ A bit late: accuracy had been below ${slo}% for ${daysBelow} day${daysBelow === 1 ? '' : 's'}.`
                  : `✗ Too late: nobody retrained, and accuracy stayed below ${slo}%.`
            }
          >
            Drift began on day {onset}. The drift score (PSI) flagged it days before the late-arriving labels showed the accuracy drop. Watch the inputs,
            not just the accuracy.
          </Feedback>
          <GameButton onClick={() => setStage('loop')} color="#7fd99a">
            Next: rebuild the loop ▶
          </GameButton>
        </>
      )}
    </div>
  );
}
