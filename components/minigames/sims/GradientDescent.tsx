'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { INK } from '@/components/ui/kit';
import type { GradientDescentConfig, LossCurve } from '@/data/sims';
import { Feedback, GameButton } from '../kit';
import type { MiniGameProps } from '../types';
import { clamp, GOLD, HintCard, RoundHeader, SimCard, Slider, Stat, trackColors } from './simKit';

interface Curve {
  f: (x: number) => number;
  df: (x: number) => number;
  lo: number;
  hi: number;
}

const CURVES: Record<LossCurve, Curve> = {
  bowl: { f: (x) => (x - 1) ** 2 + 0.5, df: (x) => 2 * (x - 1), lo: -4.5, hi: 6.5 },
  'two-valleys': { f: (x) => 0.1 * x ** 4 - x ** 2 + 0.6 * x + 3, df: (x) => 0.4 * x ** 3 - 2 * x + 0.6, lo: -4.5, hi: 4.5 },
};

/** Global minimum by a fine scan (cheap, and exact enough for a ±0.08 win zone). */
function globalMin(c: Curve) {
  let best = c.lo;
  for (let x = c.lo; x <= c.hi; x += 0.001) if (c.f(x) < c.f(best)) best = x;
  return best;
}

const WIN_ZONE = 0.08;
const RUN_MS = 420;
const W = 360;
const H = 210;
const PAD = 14;

type Outcome = 'win' | 'diverged' | 'stuck' | 'bounce' | 'crawl' | null;

export default function GradientDescent({ phaseId, config, onComplete }: MiniGameProps<GradientDescentConfig>) {
  const colors = trackColors(phaseId);
  const { rounds, learningRates, maxSteps, par } = config;
  const [round, setRound] = useState(0);
  const [lrIndex, setLrIndex] = useState(2);
  const [path, setPath] = useState<number[]>([rounds[0].start]);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [running, setRunning] = useState(false);
  const [totalSteps, setTotalSteps] = useState(0);

  const r = rounds[round];
  const curve = CURVES[r.curve];
  const xMin = useMemo(() => globalMin(curve), [curve]);
  const lr = learningRates[lrIndex];
  const x = path[path.length - 1];
  const steps = path.length - 1;
  const inProgress = steps > 0 && outcome === null;
  const done = outcome !== null;

  // Chart scales: x over the curve's domain; y from just under the minimum to a bit above the
  // start (or any ridge between valleys). The steep outer walls are clipped.
  const { yLo, yHi } = useMemo(() => {
    const lo = curve.f(xMin) - 1;
    let peak = curve.f(r.start);
    for (let t = curve.lo + 0.05; t < curve.hi; t += 0.05) if (curve.df(t - 0.05) > 0 && curve.df(t) <= 0) peak = Math.max(peak, curve.f(t));
    return { yLo: lo, yHi: peak + (peak - lo) * 0.25 };
  }, [curve, xMin, r.start]);
  const sx = (v: number) => PAD + ((v - curve.lo) / (curve.hi - curve.lo)) * (W - 2 * PAD);
  const sy = (v: number) => H - PAD - ((v - yLo) / (yHi - yLo)) * (H - 2 * PAD);

  const ground = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 140; i++) {
      const t = curve.lo + ((curve.hi - curve.lo) * i) / 140;
      pts.push(`${sx(t).toFixed(1)},${clamp(sy(curve.f(t)), -40, H + 40).toFixed(1)}`);
    }
    return pts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve, yLo, yHi]);

  const step = () => {
    if (done) return;
    const next = x - lr * curve.df(x);
    const nextPath = [...path, next];
    const n = nextPath.length - 1;
    setPath(nextPath);
    setTotalSteps((t) => t + 1);
    let o: Outcome = null;
    if (!Number.isFinite(next) || next < curve.lo || next > curve.hi) o = 'diverged';
    else if (Math.abs(next - xMin) < WIN_ZONE) o = 'win';
    else if (n >= 3 && Math.abs(next - x) < 0.015) o = 'stuck';
    else if (n >= maxSteps) {
      const signs = nextPath.slice(-4).map((p) => Math.sign(p - xMin));
      o = signs.some((s, i) => i > 0 && s !== signs[i - 1]) ? 'bounce' : 'crawl';
    }
    if (o) {
      setOutcome(o);
      setRunning(false);
    }
  };

  // Run: keep stepping on a timer until the attempt ends.
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  });
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => stepRef.current(), RUN_MS);
    return () => window.clearInterval(t);
  }, [running]);

  const reset = () => {
    setRunning(false);
    setOutcome(null);
    setPath([r.start]);
  };

  const nextRound = () => {
    if (round + 1 < rounds.length) {
      setRound(round + 1);
      setOutcome(null);
      setRunning(false);
      setPath([rounds[round + 1].start]);
      return;
    }
    const stars = totalSteps <= par.three ? 3 : totalSteps <= par.two ? 2 : 1;
    onComplete({ score: clamp(115 - totalSteps * 3, 10, 100), stars });
  };

  const slope = curve.df(clamp(x, curve.lo, curve.hi));
  const ballX = clamp(x, curve.lo, curve.hi);
  const ballY = outcome === 'diverged' ? yHi : clamp(curve.f(ballX), yLo, yHi);
  const fmt = (v: number) => (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(2));

  const feedback: Record<Exclude<Outcome, null>, { tone: 'good' | 'bad'; title: string; text: string }> = {
    win: {
      tone: 'good',
      title: `⛳ Reached the bottom in ${steps} step${steps === 1 ? '' : 's'}!`,
      text:
        round === 0
          ? 'In a smooth bowl, a bigger (but not too big) learning rate gets there fastest.'
          : 'You stayed in the deep valley. Real training uses tricks like learning-rate schedules to balance speed and stability.',
    },
    diverged: {
      tone: 'bad',
      title: '💨 The ball flew off the mountain!',
      text: 'Each step overshot further than the last: the learning rate is far too big, so training diverges. Reset and pick a smaller one.',
    },
    stuck: {
      tone: 'bad',
      title: '🙃 Stuck in a shallow valley (a local minimum).',
      text: 'The slope here is almost zero, so gradient descent stops, even though a deeper valley exists. A big step hopped over the ridge. Try a smaller learning rate.',
    },
    bounce: {
      tone: 'bad',
      title: '↔️ Out of steps: it kept bouncing from side to side.',
      text: 'The learning rate is too big: every step jumps across the valley instead of down into it. Reset and try a smaller one.',
    },
    crawl: {
      tone: 'bad',
      title: '🐌 Out of steps: the ball is crawling.',
      text: 'The learning rate is too small. Each step is tiny, so training would take forever. Reset and try a bigger one.',
    },
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <RoundHeader round={round + 1} total={rounds.length} title={r.title} color={colors.light} />
      <p className="w-full text-sm font-semibold">{r.intro}</p>

      <SimCard
        title="Loss landscape"
        aside={
          <span className="text-xs font-extrabold tabular-nums">
            Step {steps} / {maxSteps}
          </span>
        }
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label={`Loss curve with the ball at x = ${fmt(x)}`}>
          <defs>
            <clipPath id="gd-clip">
              <rect x="0" y="0" width={W} height={H} rx="12" />
            </clipPath>
          </defs>
          <g clipPath="url(#gd-clip)">
            <rect x="0" y="0" width={W} height={H} fill="#eef6ff" />
            <polygon points={`0,${H + 40} 0,-40 ${ground.join(' ')} ${W},-40 ${W},${H + 40}`} fill={colors.light} />
            <polyline points={ground.join(' ')} fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
            {/* goal: the global minimum */}
            <g transform={`translate(${sx(xMin)}, ${sy(curve.f(xMin))})`}>
              <line x1="0" y1="0" x2="0" y2="-30" stroke={INK} strokeWidth="2.5" />
              <path d="M0,-30 L16,-24 L0,-18 Z" fill="#7fd99a" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            </g>
            {/* trail of earlier positions with the jumps between them */}
            {path.slice(0, -1).map((p, i) => {
              const q = path[i + 1];
              if (q < curve.lo || q > curve.hi || p < curve.lo || p > curve.hi) return null;
              const x1 = sx(p);
              const y1 = sy(curve.f(p));
              const x2 = sx(q);
              const y2 = sy(curve.f(q));
              const lift = Math.min(60, Math.abs(x2 - x1) * 0.35 + 8);
              return (
                <g key={i}>
                  <path
                    d={`M${x1},${y1} Q${(x1 + x2) / 2},${Math.min(y1, y2) - lift} ${x2},${y2}`}
                    fill="none"
                    stroke={INK}
                    strokeOpacity="0.45"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  <circle cx={x1} cy={y1} r="3.5" fill="white" stroke={INK} strokeWidth="2" />
                </g>
              );
            })}
            <g
              style={{
                transform: `translate(${sx(ballX)}px, ${sy(ballY) - 10}px)`,
                transition: `transform ${Math.min(RUN_MS - 60, 320)}ms cubic-bezier(.3,.7,.4,1)`,
              }}
            >
              <circle r="10" fill={GOLD} stroke={INK} strokeWidth="3" />
              <circle r="3" cx="-3" cy="-3" fill="white" opacity="0.8" />
            </g>
          </g>
        </svg>
        <p className="mt-1 text-center text-xs font-bold tabular-nums">
          slope here = {fmt(slope)} → next step = −{lr} × {fmt(slope)} = {fmt(-lr * slope)}
        </p>
      </SimCard>

      <div className="w-full">
        <Slider
          label="Learning rate (step size)"
          value={lrIndex}
          min={0}
          max={learningRates.length - 1}
          step={1}
          onChange={setLrIndex}
          display={lr}
          color={colors.base}
          disabled={inProgress || running}
        />
        {(inProgress || running) && <p className="text-xs font-bold opacity-60">Reset the ball to change the learning rate.</p>}
      </div>

      {outcome && (
        <Feedback tone={feedback[outcome].tone} title={feedback[outcome].title}>
          {feedback[outcome].text}
        </Feedback>
      )}

      <div className="flex w-full flex-wrap justify-center gap-2">
        {outcome === 'win' ? (
          <GameButton onClick={nextRound} color="#7fd99a">
            {round + 1 < rounds.length ? 'Next round ▶' : 'Finish ▶'}
          </GameButton>
        ) : (
          <>
            <GameButton onClick={step} disabled={done || running}>
              Step ›
            </GameButton>
            <GameButton onClick={() => setRunning(true)} disabled={done || running} color="#c6e0fa">
              Run ▶▶
            </GameButton>
            <GameButton onClick={reset} disabled={steps === 0} color="white">
              ↺ Reset
            </GameButton>
          </>
        )}
      </div>

      <div className="grid w-full grid-cols-2 gap-2">
        <Stat label="Steps used (all tries)" value={totalSteps} tone={totalSteps <= par.three ? 'good' : 'info'} />
        <Stat label="Par" value={`★★★ ≤ ${par.three}`} />
      </div>

      <HintCard title="Hint: where does the slope come from? (the chain rule)">
        In a real network the loss depends on each weight through many layers. Backpropagation uses the chain rule to get each
        weight&apos;s slope, multiplying the local slopes along the way: dLoss/dw = dLoss/dy × dy/dw. Then every weight takes
        exactly the kind of step you&apos;re taking here: w ← w − learning rate × slope.
      </HintCard>
    </div>
  );
}
