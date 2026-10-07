'use client';

import { useMemo, useState } from 'react';
import { INK } from '@/components/ui/kit';
import type { CurveFitConfig } from '@/data/sims';
import { Feedback, GameButton } from '../kit';
import type { MiniGameProps } from '../types';
import { BAD, clamp, GOOD, Meter, RoundHeader, SimCard, Slider, trackColors, WARN } from './simKit';

type Pt = [number, number];

/** Least squares polynomial fit (normal equations); `lambda` adds a ridge penalty on all but the constant term. */
function fit(points: Pt[], degree: number, lambda = 0): number[] {
  const n = degree + 1;
  const A = Array.from({ length: n }, () => Array<number>(n + 1).fill(0));
  for (const [x, y] of points) {
    const p = Array.from({ length: n }, (_, k) => x ** k);
    for (let i = 0; i < n; i++) {
      A[i][n] += p[i] * y;
      for (let j = 0; j < n; j++) A[i][j] += p[i] * p[j];
    }
  }
  for (let i = 0; i < n; i++) A[i][i] += (i === 0 ? 0 : lambda) + 1e-9;
  // Gauss–Jordan with partial pivoting.
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = A[r][c] / A[c][c];
      for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k];
    }
  }
  return A.map((row, i) => row[n] / row[i]);
}
const evalPoly = (c: number[], x: number) => c.reduce((s, ck, k) => s + ck * x ** k, 0);
const rmse = (c: number[], pts: Pt[]) => Math.sqrt(pts.reduce((s, [x, y]) => s + (evalPoly(c, x) - y) ** 2, 0) / pts.length);

interface Model {
  coef: number[];
  train: number;
  val: number;
}

const W = 340;
const H = 220;
const Y_RANGE = 2.2;
const sx = (x: number) => 12 + ((x + 1) / 2) * (W - 24);
const sy = (y: number) => H / 2 - (y / Y_RANGE) * (H / 2 - 10);
const DEGREE_NAMES = ['flat line', 'straight line', 'parabola', 'cubic'];

export default function CurveFit({ phaseId, config, onComplete }: MiniGameProps<CurveFitConfig>) {
  const colors = trackColors(phaseId);
  const { train, val, maxDegree, lambdas, ridgeTarget } = config;
  const [round, setRound] = useState<0 | 1>(0);
  const [degree, setDegree] = useState(1);
  const [lambdaIndex, setLambdaIndex] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([1]));
  const [misses, setMisses] = useState(0);
  const [verdict, setVerdict] = useState<{ ok: boolean; title: string; text: string } | null>(null);

  const byDegree = useMemo<Model[]>(
    () =>
      Array.from({ length: maxDegree + 1 }, (_, d) => {
        const coef = fit(train, d);
        return { coef, train: rmse(coef, train), val: rmse(coef, val) };
      }),
    [train, val, maxDegree],
  );
  const byLambda = useMemo<Model[]>(
    () =>
      lambdas.map((l) => {
        const coef = fit(train, maxDegree, l);
        return { coef, train: rmse(coef, train), val: rmse(coef, val) };
      }),
    [train, val, maxDegree, lambdas],
  );
  const bestDegree = byDegree.reduce((b, m, d) => (m.val < byDegree[b].val ? d : b), 0);
  const bestLambda = byLambda.reduce((b, m, i) => (m.val < byLambda[b].val ? i : b), 0);

  const model = round === 0 ? byDegree[degree] : byLambda[lambdaIndex];
  const fitLabel =
    round === 0
      ? byDegree[degree].val ** 2 < 2 * byDegree[bestDegree].val ** 2
        ? 'good'
        : degree < bestDegree
          ? 'under'
          : 'over'
      : model.val <= ridgeTarget
        ? 'good'
        : lambdaIndex < bestLambda
          ? 'over'
          : 'under';
  const LABELS = {
    under: { text: 'Underfitting', color: WARN, note: 'Too simple: it misses the pattern, so both errors are high.' },
    good: { text: 'Good fit', color: GOOD, note: 'Follows the pattern, not the noise.' },
    over: { text: 'Overfitting', color: BAD, note: 'Chases the noise: training error is tiny but validation error is high.' },
  } as const;

  const curvePts = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 120; i++) {
      const x = -1 + (2 * i) / 120;
      pts.push(`${sx(x).toFixed(1)},${clamp(sy(evalPoly(model.coef, x)), -30, H + 30).toFixed(1)}`);
    }
    return pts.join(' ');
  }, [model]);

  const chooseDegree = (d: number) => {
    setDegree(d);
    setVisited((v) => new Set(v).add(d));
    setVerdict(null);
  };

  const lockIn = () => {
    if (round === 0) {
      const ok = degree === bestDegree;
      if (!ok) setMisses((m) => m + 1);
      setVerdict(
        ok
          ? {
              ok,
              title: `✓ Degree ${degree} has the lowest validation error!`,
              text: 'Higher degrees keep lowering the training error, but they start fitting noise, and the validation error rises again. That U-shape is the bias/variance trade-off.',
            }
          : {
              ok,
              title: `✗ Degree ${degree} isn't the lowest validation error.`,
              text:
                degree < bestDegree
                  ? 'This model is too simple (high bias): it underfits. Try a higher degree and watch the hollow validation points.'
                  : byDegree[degree].val ** 2 < 2 * byDegree[bestDegree].val ** 2
                    ? 'Close! A simpler degree does slightly better on validation data. When two fit equally well, prefer the simpler model.'
                    : 'Training error is low, but validation error went up: this model memorises the noise (high variance). Try a lower degree.',
            },
      );
    } else {
      const ok = model.val <= ridgeTarget;
      if (!ok) setMisses((m) => m + 1);
      setVerdict(
        ok
          ? {
              ok,
              title: '✓ Tamed! Same degree 9, far less wiggle.',
              text: 'Regularisation penalises large weights, so even a very flexible model stays smooth and generalises better.',
            }
          : {
              ok,
              title: '✗ Validation error is still above the target.',
              text:
                lambdaIndex < bestLambda
                  ? 'Too little regularisation: the curve still chases the noise. Turn it up.'
                  : 'Too much regularisation: the curve is flattened and now underfits. Turn it down a bit.',
            },
      );
    }
  };

  const next = () => {
    if (round === 0) {
      setRound(1);
      setVerdict(null);
      return;
    }
    const stars = misses === 0 ? 3 : misses === 1 ? 2 : 1;
    onComplete({ score: Math.max(25, 100 - misses * 25), stars });
  };

  const label = LABELS[fitLabel];
  const valMax = 1;

  return (
    <div className="flex flex-col items-center gap-3">
      <RoundHeader
        round={round + 1}
        total={2}
        title={round === 0 ? 'Pick the right degree' : 'Tame degree 9 with regularisation'}
        color={colors.light}
      />
      <p className="w-full text-sm font-semibold">
        {round === 0
          ? 'Move the degree slider. Find the degree with the lowest validation error, then lock it in.'
          : 'Degree 9 overfits badly. Keep the degree, but raise the regularisation strength until the validation error drops below the target line.'}
      </p>

      <SimCard
        title="Data and fitted curve"
        aside={
          <span
            className="rounded-full border-[3px] px-2 py-0.5 text-xs font-black text-white"
            style={{ borderColor: INK, background: label.color }}
            aria-live="polite"
          >
            {label.text}
          </span>
        }
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label={`Fitted curve: ${label.text}`}>
          <defs>
            <clipPath id="cf-clip">
              <rect x="0" y="0" width={W} height={H} rx="12" />
            </clipPath>
          </defs>
          <g clipPath="url(#cf-clip)">
            <rect width={W} height={H} fill="#f6fbf2" />
            <line x1="0" x2={W} y1={sy(0)} y2={sy(0)} stroke={INK} strokeOpacity="0.12" strokeWidth="2" />
            <polyline points={curvePts} fill="none" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
            {train.map(([x, y], i) => (
              <circle key={`t${i}`} cx={sx(x)} cy={sy(y)} r="6" fill={colors.dark} stroke={INK} strokeWidth="2.5" />
            ))}
            {val.map(([x, y], i) => (
              <circle key={`v${i}`} cx={sx(x)} cy={sy(y)} r="5.5" fill="white" stroke={INK} strokeWidth="2.5" strokeDasharray="3 2" />
            ))}
          </g>
        </svg>
        <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs font-bold">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full border-2" style={{ borderColor: INK, background: colors.dark }} /> training
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full border-2 border-dashed bg-white" style={{ borderColor: INK }} /> validation
            (held out)
          </span>
        </div>
        <p className="mt-1 text-center text-xs font-semibold opacity-80">{label.note}</p>
      </SimCard>

      <SimCard title="Error (RMSE, lower is better)">
        <div className="flex flex-col gap-2">
          <Meter label="Training error" value={model.train / valMax} display={model.train.toFixed(3)} color={colors.base} />
          <Meter
            label="Validation error"
            value={model.val / valMax}
            display={model.val.toFixed(3)}
            color={round === 1 ? undefined : '#ffd66e'}
            threshold={round === 1 ? ridgeTarget / valMax : undefined}
            good="low"
          />
        </div>
        {round === 0 && (
          <div className="mt-3">
            <div className="mb-1 text-[11px] font-extrabold opacity-70">Validation error by degree (the ones you&apos;ve tried)</div>
            <div className="flex h-16 items-end gap-1" aria-hidden>
              {byDegree.map((m, d) => (
                <div key={d} className="flex flex-1 flex-col items-center gap-0.5">
                  <div
                    className="w-full rounded-t-md border-2 border-b-0 transition-[height]"
                    style={{
                      height: visited.has(d) ? `${clamp(m.val / valMax, 0.04, 1) * 48}px` : '4px',
                      borderColor: visited.has(d) ? INK : `${INK}30`,
                      background: d === degree ? '#ffd66e' : visited.has(d) ? 'white' : 'transparent',
                    }}
                  />
                  <span className="text-[10px] leading-none font-bold">{d}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </SimCard>

      {round === 0 ? (
        <Slider
          label="Polynomial degree"
          value={degree}
          min={0}
          max={maxDegree}
          step={1}
          onChange={chooseDegree}
          display={`${degree}${DEGREE_NAMES[degree] ? ` · ${DEGREE_NAMES[degree]}` : ''}`}
          color={colors.base}
          disabled={!!verdict?.ok}
        />
      ) : (
        <Slider
          label="Regularisation strength (λ)"
          value={lambdaIndex}
          min={0}
          max={lambdas.length - 1}
          step={1}
          onChange={(i) => {
            setLambdaIndex(i);
            setVerdict(null);
          }}
          display={lambdas[lambdaIndex] === 0 ? 'off' : lambdas[lambdaIndex]}
          color={colors.base}
          disabled={!!verdict?.ok}
        />
      )}

      {verdict && (
        <Feedback tone={verdict.ok ? 'good' : 'bad'} title={verdict.title}>
          {verdict.text}
        </Feedback>
      )}

      {verdict?.ok ? (
        <GameButton onClick={next} color="#7fd99a">
          {round === 0 ? 'Next round ▶' : 'Finish ▶'}
        </GameButton>
      ) : (
        <GameButton onClick={lockIn} disabled={!!verdict}>
          🔒 Lock in {round === 0 ? `degree ${degree}` : 'this strength'}
        </GameButton>
      )}
    </div>
  );
}
