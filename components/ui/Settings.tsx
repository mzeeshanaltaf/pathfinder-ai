'use client';

import { useState, type ReactNode } from 'react';
import { BYTE_HATS, hatUnlocked } from '@/lib/progress';
import { TRACK_COLORS } from '@/lib/palette';
import { useProgress, type Settings as SettingsData } from '@/store/progress';
import { useUi } from '@/store/ui';
import ByteAvatar from './ByteAvatar';
import { INK, resumeExplore, SectionTitle } from './kit';
import Sheet, { PillButton } from './Sheet';

export default function Settings() {
  const open = useUi((s) => s.mode === 'menu' && s.menu === 'settings');
  if (!open) return null;
  return <SettingsCard />;
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 py-2">
      <div className="min-w-0">
        <div className="text-sm font-extrabold">{label}</div>
        {hint && <div className="text-xs font-semibold opacity-60">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="relative h-9 w-16 shrink-0 rounded-full border-[3px] transition-colors"
      style={{ borderColor: INK, background: on ? '#7fd99a' : '#ece8f5' }}
    >
      <span
        className="absolute top-0.5 h-6 w-6 rounded-full border-[3px] bg-white transition-[left]"
        style={{ borderColor: INK, left: on ? 'calc(100% - 28px)' : '2px' }}
      />
    </button>
  );
}

const QUALITY: { id: SettingsData['quality']; label: string }[] = [
  { id: 'auto', label: 'Auto' },
  { id: 'low', label: 'Low' },
  { id: 'high', label: 'High' },
];

function SettingsCard() {
  const s = useProgress((st) => st.settings);
  const set = useProgress((st) => st.setSetting);
  const best = useProgress((st) => st.streak.best);
  const hat = useProgress((st) => st.byteHat);
  const name = useProgress((st) => st.playerName);
  const tier = useUi((st) => st.perfTier);
  const [confirming, setConfirming] = useState(false);

  const reset = () => {
    useProgress.getState().resetProgress();
    // Reload so the world, player and every overlay start fresh from the cleared save.
    window.location.reload();
  };

  return (
    <Sheet label="Settings" title="Settings" icon={<span className="text-2xl" aria-hidden>⚙️</span>} onClose={resumeExplore} footer={<PillButton onClick={resumeExplore} color="#7fd99a" className="flex-1">Done</PillButton>}>
      <section className="divide-y-2 divide-dashed divide-[#3d3452]/15">
        <Row label="Sound" hint="Footsteps, gem chimes, fanfares, wind (M)">
          <Toggle on={!s.muted} onChange={(v) => set('muted', !v)} label="Sound" />
        </Row>
        <Row label="Look sensitivity" hint="Mouse and touch drag">
          <label className="flex w-full items-center gap-3 sm:w-56">
            <input
              type="range"
              min={0.3}
              max={2.5}
              step={0.05}
              value={s.sensitivity}
              onChange={(e) => set('sensitivity', Number(e.target.value))}
              className="sim-range"
              style={{ '--pct': `${((s.sensitivity - 0.3) / 2.2) * 100}%`, '--fill': TRACK_COLORS.meta.base } as React.CSSProperties}
              aria-label="Look sensitivity"
            />
            <span className="w-10 text-right text-sm font-extrabold tabular-nums">{s.sensitivity.toFixed(2)}×</span>
          </label>
        </Row>
        <Row label="Invert Y" hint="Push up to look down">
          <Toggle on={s.invertY} onChange={(v) => set('invertY', v)} label="Invert Y" />
        </Row>
        <Row label="Graphics quality" hint={s.quality === 'auto' ? `Auto adjusts to your device (now: ${tier === 0 ? 'low' : tier === 1 ? 'medium' : 'high'})` : 'Low: no shadows, fewer clouds and flowers'}>
          <div className="flex overflow-hidden rounded-full border-[3px]" style={{ borderColor: INK }} role="radiogroup" aria-label="Graphics quality">
            {QUALITY.map((q) => (
              <button
                key={q.id}
                type="button"
                role="radio"
                aria-checked={s.quality === q.id}
                onClick={() => set('quality', q.id)}
                className="min-h-9 px-3 text-sm font-extrabold"
                style={{ background: s.quality === q.id ? TRACK_COLORS.meta.base : 'white' }}
              >
                {q.label}
              </button>
            ))}
          </div>
        </Row>
      </section>

      <section className="mt-4">
        <SectionTitle>Byte&apos;s hat</SectionTitle>
        <p className="mb-2 text-xs font-semibold opacity-70">Daily streaks unlock hats: 3, 7 and 30 days in a row. Your best: {best} {best === 1 ? 'day' : 'days'}.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BYTE_HATS.map((h) => {
            const unlocked = hatUnlocked(h, best);
            const selected = hat === h.id;
            return (
              <button
                key={h.id}
                type="button"
                disabled={!unlocked}
                onClick={() => useProgress.getState().setByteHat(h.id)}
                aria-pressed={selected}
                className="flex flex-col items-center gap-1 rounded-2xl border-[3px] px-1 py-2 text-xs font-extrabold disabled:opacity-50"
                style={{ borderColor: selected ? INK : `${INK}40`, background: selected ? TRACK_COLORS.meta.light : 'white' }}
              >
                <ByteAvatar size={44} hat={h.color} />
                {h.label}
                {!unlocked && <span className="text-[10px] font-bold">🔒 {h.days}-day streak</span>}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-4">
        <SectionTitle>Name for your certificate</SectionTitle>
        <input
          type="text"
          value={name}
          maxLength={40}
          onChange={(e) => useProgress.getState().setPlayerName(e.target.value)}
          placeholder="Your name"
          className="min-h-11 w-full rounded-2xl border-[3px] bg-white px-3 text-base font-bold outline-none focus:ring-4 focus:ring-[#b9a3ee]/50"
          style={{ borderColor: INK }}
          aria-label="Name for your certificate"
        />
        <p className="mt-1 text-xs font-semibold opacity-60">Stored only on this device.</p>
      </section>

      <section className="mt-5 rounded-2xl border-[3px] border-dashed p-3" style={{ borderColor: '#e66a5c' }}>
        <SectionTitle>Danger zone</SectionTitle>
        {confirming ? (
          <div className="flex flex-col gap-2" role="alertdialog" aria-label="Confirm reset">
            <p className="text-sm font-bold">
              Erase all gems, badges, projects, achievements, your streak and your name? Settings are kept. This can&apos;t be undone.
            </p>
            <div className="flex flex-wrap gap-2">
              <PillButton onClick={() => setConfirming(false)} className="flex-1">
                Cancel
              </PillButton>
              <PillButton onClick={reset} color="#ff9b8f" className="flex-1">
                Yes, reset everything
              </PillButton>
            </div>
          </div>
        ) : (
          <PillButton onClick={() => setConfirming(true)} color="#ffe0dc">
            Reset progress…
          </PillButton>
        )}
      </section>
    </Sheet>
  );
}
