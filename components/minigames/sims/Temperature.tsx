'use client';

import { useMemo, useState } from 'react';
import { INK } from '@/components/ui/kit';
import type { TemperatureConfig } from '@/data/sims';
import { Feedback, GameButton } from '../kit';
import type { MiniGameProps } from '../types';
import { GOOD, Illustrative, SimCard, Slider, trackColors } from './simKit';

type Task = 'deterministic' | 'creative' | 'oddity';
const TASKS: { id: Task; label: string }[] = [
  { id: 'deterministic', label: 'Make it deterministic: the same word every time' },
  { id: 'creative', label: 'Creative but sane: 3+ different words, and nothing weird can appear' },
  { id: 'oddity', label: 'Cause a hallucination-like oddity: get a weird word' },
];

/** Temperature-scaled softmax, then top-p (nucleus) filtering. */
function distribution(logits: number[], temperature: number, topP: number) {
  const n = logits.length;
  let raw: number[];
  if (temperature <= 0) {
    const best = logits.indexOf(Math.max(...logits));
    raw = logits.map((_, i) => (i === best ? 1 : 0));
  } else {
    const scaled = logits.map((l) => l / temperature);
    const m = Math.max(...scaled);
    const e = scaled.map((s) => Math.exp(s - m));
    const sum = e.reduce((a, b) => a + b, 0);
    raw = e.map((v) => v / sum);
  }
  const order = [...Array(n).keys()].sort((a, b) => raw[b] - raw[a]);
  const kept = Array<boolean>(n).fill(false);
  let cum = 0;
  for (const i of order) {
    if (raw[i] <= 0) break;
    kept[i] = true;
    cum += raw[i];
    if (cum >= topP - 1e-9) break;
  }
  const keptSum = raw.reduce((s, p, i) => s + (kept[i] ? p : 0), 0);
  const final = raw.map((p, i) => (kept[i] ? p / keptSum : 0));
  return { raw, kept, final };
}

function sample(probs: number[]) {
  let r = Math.random();
  for (let i = 0; i < probs.length; i++) {
    r -= probs[i];
    if (r <= 0) return i;
  }
  // Floating-point leftovers: fall back to the last token that can be picked.
  for (let i = probs.length - 1; i >= 0; i--) if (probs[i] > 0) return i;
  return 0;
}

const pct = (p: number) => (p >= 0.995 ? '100%' : p < 0.001 ? (p > 0 ? '<0.1%' : '0%') : `${(p * 100).toFixed(p < 0.1 ? 1 : 0)}%`);

export default function Temperature({ phaseId, config, onComplete }: MiniGameProps<TemperatureConfig>) {
  const colors = trackColors(phaseId);
  const { prefix, tokens, batches } = config;
  const [temperature, setTemperature] = useState(1);
  const [topP, setTopP] = useState(1);
  const [left, setLeft] = useState(batches);
  const [samples, setSamples] = useState<number[] | null>(null);
  const [done, setDone] = useState<Set<Task>>(() => new Set());
  const [notes, setNotes] = useState<{ tone: 'good' | 'info'; text: string }[]>([]);

  const logits = useMemo(() => tokens.map((t) => t.logit), [tokens]);
  const dist = useMemo(() => distribution(logits, temperature, topP), [logits, temperature, topP]);
  const finished = done.size === TASKS.length || left === 0;

  const sampleTen = () => {
    if (finished) return;
    const s = Array.from({ length: 10 }, () => sample(dist.final));
    setSamples(s);
    setLeft((n) => n - 1);
    const next = new Set(done);
    const out: { tone: 'good' | 'info'; text: string }[] = [];
    const distinct = new Set(s).size;
    const oddSeen = s.filter((i) => tokens[i].odd);
    const oddPossible = tokens.map((t, i) => (t.odd && dist.final[i] > 0 ? i : -1)).filter((i) => i >= 0);
    const keptCount = dist.kept.filter(Boolean).length;

    if (keptCount === 1 && !done.has('deterministic')) {
      next.add('deterministic');
      out.push({
        tone: 'good',
        text: `✓ Deterministic! Only “${tokens[s[0]].text}” is left, so the model picks it every time. Great for extraction, classification and tests.`,
      });
    }
    if (oddSeen.length && !done.has('oddity')) {
      next.add('oddity');
      out.push({
        tone: 'good',
        text: `✓ Oddity! “${tokens[oddSeen[0]].text}”?! High temperature flattens the distribution, so unlikely tokens get picked. That's how odd, hallucination-like text sneaks in.`,
      });
    }
    if (!done.has('creative')) {
      if (distinct >= 3 && oddPossible.length === 0) {
        next.add('creative');
        out.push({
          tone: 'good',
          text: `✓ Creative but sane: ${distinct} different words, and top-p has cut off the weird tail completely.`,
        });
      } else if (distinct >= 3 && oddPossible.length > 0 && !oddSeen.length) {
        const worst = oddPossible.sort((a, b) => dist.final[b] - dist.final[a])[0];
        out.push({
          tone: 'info',
          text: `Varied, but not guaranteed sane: “${tokens[worst].text}” still has a ${pct(dist.final[worst])} chance. Lower top-p to cut off the weird tail.`,
        });
      } else if (distinct < 3 && keptCount > 1) {
        out.push({ tone: 'info', text: `Only ${distinct} different word${distinct === 1 ? '' : 's'}. For creativity, raise the temperature a little.` });
      }
    }
    if (!out.length) out.push({ tone: 'info', text: 'No new task this time. Adjust the sliders and sample again.' });
    setDone(next);
    setNotes(out);
  };

  const finish = () => {
    const n = done.size;
    onComplete({ score: Math.round((100 * n) / TASKS.length), stars: (Math.max(1, n) as 1 | 2 | 3) });
  };

  const last = samples ? tokens[samples[samples.length - 1]].text : null;

  return (
    <div className="flex flex-col items-center gap-3">
      <SimCard title="Next-token probabilities" aside={<Illustrative>Illustrative probabilities</Illustrative>}>
        <p className="mb-2 text-sm font-bold">
          “{prefix} <span className="rounded-md px-1" style={{ background: last ? colors.light : '#f1eef8' }}>{last ?? '___'}</span>”
        </p>
        <ul className="flex flex-col gap-1" aria-label="Probability of each next token">
          {tokens.map((t, i) => {
            const cut = !dist.kept[i];
            const shown = cut ? dist.raw[i] : dist.final[i];
            return (
              <li key={t.text} className="flex items-center gap-2 text-sm font-bold">
                <span className={`w-20 shrink-0 truncate text-right ${cut ? 'line-through opacity-40' : ''}`}>{t.text}</span>
                <span className="relative h-5 min-w-0 flex-1 overflow-hidden rounded-md border-2 bg-white" style={{ borderColor: cut ? `${INK}30` : INK }}>
                  <span
                    className="absolute inset-y-0 left-0 transition-[width] duration-300 ease-out"
                    style={{
                      width: `${Math.max(shown > 0 ? 2 : 0, shown * 100)}%`,
                      background: cut ? `repeating-linear-gradient(45deg, ${INK}20 0 4px, transparent 4px 8px)` : t.odd ? '#ff9eb8' : colors.base,
                    }}
                  />
                </span>
                <span className={`w-12 shrink-0 text-right text-xs tabular-nums ${cut ? 'opacity-40' : ''}`}>{cut ? 'cut' : pct(dist.final[i])}</span>
              </li>
            );
          })}
        </ul>
      </SimCard>

      <div className="flex w-full flex-col gap-1">
        <Slider
          label="Temperature"
          value={temperature}
          min={0}
          max={2}
          step={0.05}
          onChange={setTemperature}
          display={temperature === 0 ? '0 · greedy' : temperature.toFixed(2)}
          color={colors.base}
          disabled={finished}
        />
        <Slider
          label="Top-p (nucleus)"
          value={topP}
          min={0.05}
          max={1}
          step={0.05}
          onChange={setTopP}
          display={topP.toFixed(2)}
          color={colors.base}
          disabled={finished}
        />
      </div>

      <GameButton onClick={sampleTen} disabled={finished} color="#c6e0fa">
        🎲 Sample ×10 <span className="text-sm opacity-70">({left} left)</span>
      </GameButton>

      {samples && (
        <SimCard title="The model wrote…">
          <div className="flex flex-wrap gap-1.5" aria-label="Sampled words">
            {samples.map((i, k) => (
              <span
                key={k}
                className="rounded-full border-2 px-2 py-0.5 text-sm font-extrabold animate-[drop-in_300ms_ease-out_both]"
                style={{ borderColor: INK, background: tokens[i].odd ? '#ffd0dd' : colors.light, animationDelay: `${k * 40}ms` }}
              >
                {tokens[i].text}
              </span>
            ))}
          </div>
        </SimCard>
      )}

      {notes.map((n) => (
        <Feedback key={n.text} tone={n.tone} title={n.text} />
      ))}

      <SimCard title={`Tasks · ${done.size} / ${TASKS.length}`}>
        <ul className="flex flex-col gap-1.5">
          {TASKS.map((t) => (
            <li key={t.id} className="flex items-start gap-2 text-sm font-bold">
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 text-xs"
                style={{ borderColor: INK, background: done.has(t.id) ? GOOD : 'white', color: 'white' }}
                aria-hidden
              >
                {done.has(t.id) ? '✓' : ''}
              </span>
              <span className={done.has(t.id) ? 'opacity-60' : ''}>
                {t.label}
                <span className="sr-only">{done.has(t.id) ? ' (done)' : ' (to do)'}</span>
              </span>
            </li>
          ))}
        </ul>
      </SimCard>

      {finished ? (
        <GameButton onClick={finish} color="#7fd99a">
          Finish ▶
        </GameButton>
      ) : (
        done.size > 0 && (
          <button type="button" onClick={finish} className="text-xs font-extrabold underline underline-offset-2 opacity-70">
            Finish now with {done.size} star{done.size === 1 ? '' : 's'}
          </button>
        )
      )}
    </div>
  );
}
