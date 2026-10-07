// Light procedural sound effects via the Web Audio API (nothing to download).
// The context is created on the first user gesture (browser autoplay rules) and
// the master gain follows `settings.muted`.

import { useProgress } from '@/store/progress';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let initialised = false;
let lastStep = 0;

const MASTER = 0.7;

function applyMute() {
  if (!ctx || !master) return;
  const muted = useProgress.getState().settings.muted;
  master.gain.setTargetAtTime(muted ? 0 : MASTER, ctx.currentTime, 0.05);
}

function unlock() {
  if (ctx) {
    if (ctx.state === 'suspended' && !document.hidden) void ctx.resume();
    return;
  }
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  // 2 s of white noise, reused by footsteps, wind and fireworks.
  noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  startWind();
  applyMute();
}

/** Call once on the client: unlock on the first gesture, follow mute, pause with the tab, click on buttons. */
export function initAudio() {
  if (initialised || typeof window === 'undefined') return;
  initialised = true;
  const gesture = () => unlock();
  window.addEventListener('pointerdown', gesture, true);
  window.addEventListener('keydown', gesture, true);
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) void ctx.suspend();
    else void ctx.resume();
  });
  // UI click for every button press (capture, so stopPropagation in handlers doesn't hide it).
  document.addEventListener(
    'click',
    (e) => {
      if ((e.target as Element | null)?.closest?.('button')) sfx.click();
    },
    true,
  );
  let muted = useProgress.getState().settings.muted;
  useProgress.subscribe((s) => {
    if (s.settings.muted !== muted) {
      muted = s.settings.muted;
      applyMute();
    }
  });
}

const ready = () => !!ctx && !!master && ctx.state === 'running' && !useProgress.getState().settings.muted;

function tone(freq: number, start: number, dur: number, { type = 'sine' as OscillatorType, gain = 0.2, glide = 0 } = {}) {
  const c = ctx!;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (glide) osc.frequency.exponentialRampToValueAtTime(freq * glide, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(master!);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function noiseBurst(start: number, dur: number, { freq = 800, q = 1, gain = 0.2, type = 'bandpass' as BiquadFilterType, sweepTo = 0 } = {}) {
  const c = ctx!;
  const src = c.createBufferSource();
  src.buffer = noise;
  src.playbackRate.value = 0.8 + Math.random() * 0.4;
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(freq, start);
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, start + dur);
  f.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(f).connect(g).connect(master!);
  src.start(start, Math.random() * 1.5);
  src.stop(start + dur + 0.02);
}

/** Looping filtered noise with a slow swell: a soft high-altitude breeze. */
function startWind() {
  const c = ctx!;
  const src = c.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 420;
  const g = c.createGain();
  g.gain.value = 0.035;
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.09;
  const depth = c.createGain();
  depth.gain.value = 0.022;
  lfo.connect(depth).connect(g.gain);
  src.connect(lp).connect(g).connect(master!);
  src.start();
  lfo.start();
}

export const sfx = {
  /** Soft grass/plank tick. Rate-limited, so it is safe to call from the frame loop. */
  footstep(sprint = false) {
    if (!ready()) return;
    const now = ctx!.currentTime;
    if (now - lastStep < 0.12) return;
    lastStep = now;
    noiseBurst(now, sprint ? 0.06 : 0.075, { freq: 500 + Math.random() * 500, q: 1.4, gain: 0.09 });
  },
  gem() {
    if (!ready()) return;
    const t = ctx!.currentTime;
    tone(1318.5, t, 0.18, { type: 'triangle', gain: 0.14 });
    tone(1975.5, t + 0.07, 0.32, { type: 'sine', gain: 0.12 });
  },
  badge() {
    if (!ready()) return;
    const t = ctx!.currentTime + 0.05;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, t + i * 0.11, 0.28, { type: 'triangle', gain: 0.16 }));
    [523.25, 659.25, 783.99].forEach((f) => tone(f * 2, t + 0.5, 0.7, { type: 'sine', gain: 0.08 }));
  },
  achievement() {
    if (!ready()) return;
    const t = ctx!.currentTime;
    tone(880, t, 0.14, { type: 'square', gain: 0.05 });
    tone(1174.7, t + 0.09, 0.3, { type: 'triangle', gain: 0.12 });
  },
  click() {
    if (!ready()) return;
    tone(720, ctx!.currentTime, 0.05, { type: 'sine', gain: 0.07, glide: 1.4 });
  },
  whoosh() {
    if (!ready()) return;
    noiseBurst(ctx!.currentTime, 0.9, { freq: 300, q: 0.7, gain: 0.12, sweepTo: 1400 });
  },
  firework() {
    if (!ready()) return;
    const t = ctx!.currentTime;
    tone(300 + Math.random() * 200, t, 0.5, { type: 'sine', gain: 0.05, glide: 3 });
    noiseBurst(t + 0.45, 0.6, { freq: 2400, q: 0.5, gain: 0.16, type: 'lowpass', sweepTo: 300 });
  },
};
