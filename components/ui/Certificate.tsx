'use client';

import { useEffect, useRef, useState } from 'react';
import { CERT_H, CERT_W, drawCertificate } from '@/lib/certificate';
import { TRACK_COLORS } from '@/lib/palette';
import { certificateSummary } from '@/lib/progress';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';
import { INK, resumeExplore, SectionTitle } from './kit';
import Sheet, { PillButton } from './Sheet';

const FILE_NAME = 'pathfinder-ai-certificate.png';

/** The certificate: type a name, preview it, download a PNG or print it. Unlocks with the Summit badge. */
export default function Certificate() {
  const open = useUi((s) => s.mode === 'menu' && s.menu === 'certificate');
  if (!open) return null;
  return <CertificateCard />;
}

function CertificateCard() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const name = useProgress((s) => s.playerName);
  const unlocked = useProgress((s) => !!s.badges.summit);
  // Recompute the summary when anything it shows changes.
  const key = useProgress((s) => JSON.stringify(certificateSummary(s)));
  const [date] = useState(() => new Date());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const c = canvas.current;
    if (!c || !unlocked) return;
    const family = getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif';
    const draw = () => drawCertificate(c, { ...certificateSummary(useProgress.getState()), name, date }, family);
    draw();
    // Redraw once web fonts are ready (the first draw may use a fallback font).
    void document.fonts?.ready.then(draw);
  }, [name, key, date, unlocked]);

  const download = () => {
    const c = canvas.current;
    if (!c) return;
    setBusy(true);
    c.toBlob((blob) => {
      setBusy(false);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = FILE_NAME;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    }, 'image/png');
  };

  const print = () => {
    const c = canvas.current;
    if (!c) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.title = 'Pathfinder AI certificate';
    const img = w.document.createElement('img');
    img.src = c.toDataURL('image/png');
    img.style.width = '100%';
    img.alt = 'Pathfinder AI certificate';
    img.onload = () => {
      w.focus();
      w.print();
    };
    w.document.body.style.margin = '0';
    w.document.body.appendChild(img);
  };

  return (
    <Sheet
      label="Certificate"
      title="Your certificate"
      icon={<span className="text-2xl" aria-hidden>🎓</span>}
      onClose={resumeExplore}
      width="max-w-2xl"
      footer={
        unlocked ? (
          <>
            <PillButton onClick={print} className="flex-1">
              🖨 Print
            </PillButton>
            <PillButton onClick={download} color="#7fd99a" className="flex-1" disabled={busy}>
              ⬇ Download PNG
            </PillButton>
          </>
        ) : (
          <PillButton onClick={resumeExplore} className="flex-1">
            Back to exploring
          </PillButton>
        )
      }
    >
      {unlocked ? (
        <div className="flex flex-col gap-3">
          <label className="block">
            <SectionTitle>Name on the certificate</SectionTitle>
            <input
              type="text"
              value={name}
              maxLength={40}
              onChange={(e) => useProgress.getState().setPlayerName(e.target.value)}
              placeholder="Type your name"
              className="min-h-11 w-full rounded-2xl border-[3px] bg-white px-3 text-base font-bold outline-none focus:ring-4 focus:ring-[#b9a3ee]/50"
              style={{ borderColor: INK }}
              autoFocus
            />
            <span className="mt-1 block text-xs font-semibold opacity-60">Stored only on this device.</span>
          </label>
          <canvas
            ref={canvas}
            width={CERT_W}
            height={CERT_H}
            className="h-auto w-full rounded-xl border-[3px]"
            style={{ borderColor: INK }}
            role="img"
            aria-label={`Certificate for ${name.trim() || 'A Pathfinder'}`}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="text-5xl" aria-hidden>
            🔒
          </span>
          <p className="max-w-sm text-sm font-bold">
            Your certificate unlocks at the Summit. Earn the Summit&apos;s Challenge badge (assemble the production AI system) and it&apos;s yours to download.
          </p>
          <p className="text-xs font-semibold opacity-60" style={{ color: TRACK_COLORS.meta.dark }}>
            Every island is open: follow the compass, or fly there by balloon.
          </p>
        </div>
      )}
    </Sheet>
  );
}
