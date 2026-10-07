'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { INK } from '@/components/ui/kit';
import type { LabeledPoint, PerceptronConfig } from '@/data/sims';
import { Feedback, GameButton } from '../kit';
import type { MiniGameProps } from '../types';
import { BAD, clamp, Meter, RoundHeader, SimCard, Slider, starsFromPoints, trackColors } from './simKit';

const S = 300;
const LIM = 1.15;
const sx = (x: number) => ((x + LIM) / (2 * LIM)) * S;
const sy = (y: number) => S - ((y + LIM) / (2 * LIM)) * S;
const ORANGE = '#ffa940';
const BLUE = '#4b8fd6';
const ORANGE_BG = '#ffe7c7';
const BLUE_BG = '#d8e9fb';

type Weights = [number, number, number];
const predict = ([w1, w2, b]: Weights, x: number, y: number) => (w1 * x + w2 * y + b >= 0 ? 1 : 0);
const accuracy = (w: Weights, pts: LabeledPoint[]) => pts.filter(([x, y, c]) => predict(w, x, y) === c).length / pts.length;

/** Clip a convex polygon to the half-plane w1·x + w2·y + b ≥ 0 (sign = 1) or ≤ 0 (sign = −1). */
function clipHalf(poly: [number, number][], [w1, w2, b]: Weights, sign: 1 | -1): [number, number][] {
  const f = (p: [number, number]) => sign * (w1 * p[0] + w2 * p[1] + b);
  const out: [number, number][] = [];
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length];
    const fp = f(p);
    const fq = f(q);
    if (fp >= 0) out.push(p);
    if ((fp >= 0) !== (fq >= 0)) {
      const t = fp / (fp - fq);
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
  });
  return out;
}
const SQUARE: [number, number][] = [
  [-LIM, -LIM],
  [LIM, -LIM],
  [LIM, LIM],
  [-LIM, LIM],
];
const toPoints = (poly: [number, number][]) => poly.map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ');

type Stage = 'play' | 'solved' | 'xor' | 'reveal';
/** Perceptron-rule updates shown in the XOR auto-train demo. */
const TRAIN_UPDATES = 60;

export default function Perceptron({ phaseId, config, onComplete }: MiniGameProps<PerceptronConfig>) {
  const colors = trackColors(phaseId);
  const { rounds, xor, parSeconds } = config;
  const [round, setRound] = useState(0);
  const [stage, setStage] = useState<Stage>('play');
  const [w, setW] = useState<Weights>([0, 1, 0]);
  const [elapsed, setElapsed] = useState(0);
  const [guess, setGuess] = useState<'yes' | 'no' | null>(null);
  const [training, setTraining] = useState<{ step: number; best: number } | null>(null);
  const roundStart = useRef(0);

  const isTraining = !!training && training.step < TRAIN_UPDATES;
  const isXor = round >= rounds.length;
  const points = isXor ? xor : rounds[round].points;
  const acc = accuracy(w, points);

  useEffect(() => {
    roundStart.current = performance.now();
  }, [round]);

  const setOne = (k: 0 | 1 | 2, v: number) => {
    if (stage !== 'play' && stage !== 'xor') return;
    const next = [...w] as Weights;
    next[k] = v;
    setW(next);
    if (!isXor && accuracy(next, points) === 1) {
      setElapsed((e) => e + (performance.now() - roundStart.current) / 1000);
      setStage('solved');
    }
  };

  const nextRound = () => {
    const r = round + 1;
    setRound(r);
    setStage(r >= rounds.length ? 'xor' : 'play');
  };

  // The perceptron learning rule on XOR: it never settles, which is the point.
  const trainRef = useRef({ w, i: 0 });
  useEffect(() => {
    if (!training || training.step >= TRAIN_UPDATES) return;
    const t = window.setTimeout(() => {
      const s = trainRef.current;
      // Visit points in a fixed scrambled order so the line visibly swings around.
      const [x, y, c] = xor[(s.i * 5) % xor.length];
      const target = c === 1 ? 1 : -1;
      const out = predict(s.w, x, y) === 1 ? 1 : -1;
      if (out !== target) {
        const lr = 0.35;
        s.w = [clamp(s.w[0] + lr * target * x, -2, 2), clamp(s.w[1] + lr * target * y, -2, 2), clamp(s.w[2] + lr * target, -1.5, 1.5)];
      }
      s.i++;
      setW(s.w);
      setTraining({ step: training.step + 1, best: Math.max(training.best, accuracy(s.w, xor)) });
    }, 70);
    return () => window.clearTimeout(t);
  }, [training, xor]);

  const startTraining = () => {
    trainRef.current = { w, i: 0 };
    setTraining({ step: 0, best: accuracy(w, xor) });
  };

  const answer = (g: 'yes' | 'no') => {
    setGuess(g);
    setTraining(null);
    setStage('reveal');
  };

  const finish = () => {
    const timePoints = elapsed <= parSeconds ? 2 : elapsed <= parSeconds * 2 ? 1 : 0;
    const points = timePoints + (guess === 'no' ? 1 : 0);
    onComplete({ score: Math.round((100 * points) / 3), stars: starsFromPoints(points) });
  };

  // Regions and line for the current weights.
  const geom = useMemo(() => {
    const pos = clipHalf(SQUARE, w, 1);
    const neg = clipHalf(SQUARE, w, -1);
    const [w1, w2, b] = w;
    let line: [number, number][] | null = null;
    if (Math.abs(w1) > 1e-6 || Math.abs(w2) > 1e-6) {
      // Two points on the line, extended past the plot.
      const d: [number, number] = [-w2, w1];
      const n2 = w1 * w1 + w2 * w2;
      const p0: [number, number] = [(-b * w1) / n2, (-b * w2) / n2];
      const len = 4 / Math.hypot(d[0], d[1]);
      line = [
        [p0[0] - d[0] * len, p0[1] - d[1] * len],
        [p0[0] + d[0] * len, p0[1] + d[1] * len],
      ];
    }
    return { pos, neg, line };
  }, [w]);

  const revealing = stage === 'reveal';

  return (
    <div className="flex flex-col items-center gap-3">
      <RoundHeader
        round={round + 1}
        total={rounds.length + 1}
        title={isXor ? 'The tricky garden (XOR)' : rounds[round].title}
        color={colors.light}
      />
      <p className="w-full text-sm font-semibold">
        {isXor
          ? revealing
            ? 'One line can never do it. Two neurons can, with a third combining them.'
            : 'Orange sits in two opposite corners, blue in the other two. Try to separate them with one line…'
          : 'Move the sliders until every orange point is on the orange side and every blue point is on the blue side.'}
      </p>

      <SimCard>
        <svg viewBox={`0 0 ${S} ${S}`} className="mx-auto block w-full max-w-85" role="img" aria-label={`Decision line, accuracy ${Math.round(acc * 100)}%`}>
          <defs>
            <clipPath id="pc-clip">
              <rect width={S} height={S} rx="14" />
            </clipPath>
          </defs>
          <g clipPath="url(#pc-clip)">
            {revealing ? (
              <>
                <rect width={S} height={S} fill={ORANGE_BG} />
                <polygon points={toPoints(clipHalf(clipHalf(SQUARE, [1, -1, 0.55], 1), [-1, 1, 0.55], 1))} fill={BLUE_BG} />
                {[0.55, -0.55].map((c) => (
                  <line key={c} x1={sx(-2)} y1={sy(-2 + c)} x2={sx(2)} y2={sy(2 + c)} stroke={INK} strokeWidth="4" strokeDasharray="10 6" />
                ))}
              </>
            ) : (
              <>
                <rect width={S} height={S} fill={BLUE_BG} />
                {geom.pos.length > 2 && <polygon points={toPoints(geom.pos)} fill={ORANGE_BG} />}
                {geom.line && (
                  <line
                    x1={sx(geom.line[0][0])}
                    y1={sy(geom.line[0][1])}
                    x2={sx(geom.line[1][0])}
                    y2={sy(geom.line[1][1])}
                    stroke={INK}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                )}
              </>
            )}
            <line x1={sx(0)} x2={sx(0)} y1="0" y2={S} stroke={INK} strokeOpacity="0.1" strokeWidth="2" />
            <line y1={sy(0)} y2={sy(0)} x1="0" x2={S} stroke={INK} strokeOpacity="0.1" strokeWidth="2" />
            {points.map(([x, y, c], i) => {
              const wrong = !revealing && predict(w, x, y) !== c;
              const cx = sx(x);
              const cy = sy(y);
              return (
                <g key={i}>
                  {wrong && <circle cx={cx} cy={cy} r="14" fill="none" stroke={BAD} strokeWidth="3" strokeDasharray="4 3" />}
                  {c === 1 ? (
                    <circle cx={cx} cy={cy} r="8.5" fill={ORANGE} stroke={INK} strokeWidth="3" />
                  ) : (
                    <rect x={cx - 7.5} y={cy - 7.5} width="15" height="15" rx="3" fill={BLUE} stroke={INK} strokeWidth="3" transform={`rotate(45 ${cx} ${cy})`} />
                  )}
                </g>
              );
            })}
          </g>
        </svg>
        <div className="mt-2">
          <Meter
            label={revealing ? 'Accuracy with a hidden layer' : 'Accuracy'}
            value={revealing ? 1 : acc}
            display={`${Math.round((revealing ? 1 : acc) * 100)}%`}
            threshold={1}
          />
        </div>
      </SimCard>

      {!revealing && (
        <div className="grid w-full gap-1">
          <Slider label="w1 (weight on x)" value={w[0]} min={-2} max={2} step={0.1} onChange={(v) => setOne(0, v)} display={w[0].toFixed(1)} color={colors.base} disabled={stage === 'solved' || isTraining} />
          <Slider label="w2 (weight on y)" value={w[1]} min={-2} max={2} step={0.1} onChange={(v) => setOne(1, v)} display={w[1].toFixed(1)} color={colors.base} disabled={stage === 'solved' || isTraining} />
          <Slider label="b (bias)" value={w[2]} min={-1.5} max={1.5} step={0.05} onChange={(v) => setOne(2, v)} display={w[2].toFixed(2)} color={colors.base} disabled={stage === 'solved' || isTraining} />
          <p className="text-center text-xs font-bold tabular-nums opacity-70">
            orange if {w[0].toFixed(1)}·x + {w[1].toFixed(1)}·y + {w[2].toFixed(2)} ≥ 0
          </p>
        </div>
      )}

      {stage === 'solved' && (
        <>
          <Feedback tone="good" title="✓ Separated! 100% accuracy.">
            {round === 0
              ? 'The weights tilt the line and the bias shifts it. That weighted sum plus a threshold is a whole perceptron.'
              : 'Any data you can split with one straight line, a single perceptron can learn.'}
          </Feedback>
          <GameButton onClick={nextRound} color="#7fd99a">
            Next garden ▶
          </GameButton>
        </>
      )}

      {stage === 'xor' && (
        <>
          <GameButton onClick={startTraining} disabled={isTraining} color="#c6e0fa">
            {isTraining ? `Training… update ${training?.step}` : training ? '🤖 Train it again' : '🤖 Let the perceptron train itself'}
          </GameButton>
          {training && (
            <p className="text-xs font-bold">
              {isTraining
                ? `Best accuracy so far: ${Math.round(training.best * 100)}%`
                : `Done: ${TRAIN_UPDATES} updates, and it never got past ${Math.round(training.best * 100)}%.`}
            </p>
          )}
          <SimCard title="Your call">
            <p className="mb-2 text-sm font-bold">Can any single straight line separate this garden?</p>
            <div className="grid grid-cols-2 gap-2">
              <GameButton onClick={() => answer('yes')} color="white">
                Yes, keep trying
              </GameButton>
              <GameButton onClick={() => answer('no')} color="white">
                No, impossible
              </GameButton>
            </div>
          </SimCard>
        </>
      )}

      {revealing && (
        <>
          <Feedback tone={guess === 'no' ? 'good' : 'bad'} title={guess === 'no' ? '✓ Right: no single line can.' : '✗ It is actually impossible.'}>
            This is the XOR problem. Any one line leaves at least a quarter of the points on the wrong side. But two neurons can each draw a line,
            and a third neuron combines them: “blue between the lines, orange outside”. That middle layer is a <b>hidden layer</b>.
          </Feedback>
          <HiddenLayerDiagram />
          <Feedback tone="info" title="That's why deep learning exists.">
            Stack layers of neurons (with non-linear activations between them) and a network can carve out curved, complex boundaries that no single
            line could.
          </Feedback>
          <GameButton onClick={finish} color="#7fd99a">
            Finish ▶
          </GameButton>
        </>
      )}
    </div>
  );
}

function HiddenLayerDiagram() {
  const node = (x: number, y: number, label: string, fill: string) => (
    <g>
      <circle cx={x} cy={y} r="17" fill={fill} stroke={INK} strokeWidth="3" />
      <text x={x} y={y + 5} textAnchor="middle" fontSize="13" fontWeight="800" fill={INK}>
        {label}
      </text>
    </g>
  );
  const edges: [number, number, number, number][] = [
    [40, 40, 140, 40],
    [40, 40, 140, 110],
    [40, 110, 140, 40],
    [40, 110, 140, 110],
    [140, 40, 240, 75],
    [140, 110, 240, 75],
  ];
  return (
    <svg viewBox="0 0 280 150" className="mx-auto block w-full max-w-75" role="img" aria-label="Network: inputs x and y, two hidden neurons, one output">
      {edges.map(([a, b, c, d], i) => (
        <line key={i} x1={a} y1={b} x2={c} y2={d} stroke={INK} strokeWidth="3" strokeOpacity="0.6" className="animate-[toast-in_400ms_ease-out_both]" style={{ animationDelay: `${i * 120}ms` }} />
      ))}
      {node(40, 40, 'x', 'white')}
      {node(40, 110, 'y', 'white')}
      {node(140, 40, 'h1', '#ffd66e')}
      {node(140, 110, 'h2', '#ffd66e')}
      {node(240, 75, 'out', ORANGE_BG)}
      <text x="140" y="146" textAnchor="middle" fontSize="11" fontWeight="800" fill={INK}>
        hidden layer
      </text>
    </svg>
  );
}
