// Draws the Pathfinder AI certificate on a 2D canvas (exported as a PNG download).

import { CAREER_PATH_BY_ID, PHASE_IDS, shortPathLabel } from '@/data/roadmap';
import { TRACK_COLORS } from '@/lib/palette';
import type { CertificateSummary } from '@/lib/progress';

export const CERT_W = 1600;
export const CERT_H = 1130;

const INK = '#3d3452';
const CREAM = '#fdf6e3';

export interface CertificateData extends CertificateSummary {
  name: string;
  date: Date;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, fill: string) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = INK;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

/** Byte, drawn with plain shapes (bottom centre at x, y). */
function byte(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.lineWidth = 4;
  ctx.strokeStyle = INK;
  roundRect(ctx, -22, -46, 44, 42, 21);
  ctx.fillStyle = '#f7f4ff';
  ctx.fill();
  ctx.stroke();
  roundRect(ctx, -34, -92, 68, 44, 9);
  ctx.fillStyle = TRACK_COLORS.meta.base;
  ctx.fill();
  ctx.stroke();
  roundRect(ctx, -26, -85, 52, 30, 6);
  ctx.fillStyle = '#2f2a45';
  ctx.fill();
  ctx.fillStyle = '#8ff7ff';
  for (const ex of [-11, 11]) {
    ctx.beginPath();
    ctx.ellipse(ex, -70, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(0, -92);
  ctx.lineTo(0, -106);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -110, 6, 0, Math.PI * 2);
  ctx.fillStyle = TRACK_COLORS.meta.base;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number, size: number, weight: number, family: string) {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (ctx.measureText(text).width > maxW && s > 24) {
    s -= 4;
    ctx.font = `${weight} ${s}px ${family}`;
  }
}

function chip(ctx: CanvasRenderingContext2D, cx: number, y: number, text: string, bg: string, family: string) {
  ctx.font = `800 30px ${family}`;
  const w = ctx.measureText(text).width + 56;
  roundRect(ctx, cx - w / 2, y - 28, w, 56, 28);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, y + 1);
  return w;
}

export function drawCertificate(canvas: HTMLCanvasElement, d: CertificateData, family: string) {
  canvas.width = CERT_W;
  canvas.height = CERT_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = CERT_W;
  const H = CERT_H;

  // Paper + borders.
  ctx.fillStyle = '#bfe0fb';
  ctx.fillRect(0, 0, W, H);
  roundRect(ctx, 30, 30, W - 60, H - 60, 48);
  ctx.fillStyle = CREAM;
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.setLineDash([18, 14]);
  roundRect(ctx, 62, 62, W - 124, H - 124, 34);
  ctx.lineWidth = 5;
  ctx.strokeStyle = TRACK_COLORS.meta.base;
  ctx.stroke();
  ctx.setLineDash([]);

  // Corner stars.
  for (const [x, y] of [
    [120, 120],
    [W - 120, 120],
    [120, H - 120],
    [W - 120, H - 120],
  ])
    star(ctx, x, y, 26, '#ffc93c');

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = TRACK_COLORS.meta.dark;
  ctx.font = `800 34px ${family}`;
  ctx.fillText('PATHFINDER AI', W / 2, 170);
  ctx.fillStyle = INK;
  ctx.font = `900 82px ${family}`;
  ctx.fillText('Certificate of Achievement', W / 2, 262);

  ctx.font = `600 34px ${family}`;
  ctx.fillStyle = `${INK}cc`;
  ctx.fillText('This certifies that', W / 2, 350);

  const name = d.name.trim() || 'A Pathfinder';
  fitText(ctx, name, W - 420, 104, 900, family);
  ctx.fillStyle = INK;
  ctx.fillText(name, W / 2, 470);
  const nameW = Math.min(W - 420, ctx.measureText(name).width + 80);
  ctx.fillStyle = '#ffc93c';
  roundRect(ctx, W / 2 - nameW / 2, 494, nameW, 12, 6);
  ctx.fill();

  ctx.font = `600 34px ${family}`;
  ctx.fillStyle = `${INK}cc`;
  ctx.fillText('walked the AI roadmap all the way to the Summit of Pathfinder AI.', W / 2, 568);

  // Paths completed.
  const paths: { text: string; bg: string }[] = d.paths.map((t) => ({ text: `✓ ${shortPathLabel(CAREER_PATH_BY_ID[t])}`, bg: TRACK_COLORS[t].light }));
  if (paths.length === 0) paths.push({ text: 'Common foundation + the Summit', bg: TRACK_COLORS.common.light });
  ctx.font = `800 30px ${family}`;
  const widths = paths.map((p) => ctx.measureText(p.text).width + 56);
  const total = widths.reduce((a, b) => a + b, 0) + (paths.length - 1) * 24;
  let x = W / 2 - total / 2;
  paths.forEach((p, i) => {
    chip(ctx, x + widths[i] / 2, 652, p.text, p.bg, family);
    x += widths[i] + 24;
  });

  // Stats.
  const stats: [string, string][] = [
    [`${d.badges}/${PHASE_IDS.length}`, 'badges'],
    [`${d.stars}/${PHASE_IDS.length * 3}`, 'stars'],
    [`${d.gems}`, 'Skill Gems'],
    [`${d.projects}`, 'projects built'],
  ];
  const colW = 260;
  stats.forEach(([value, label], i) => {
    const cx = W / 2 + (i - (stats.length - 1) / 2) * colW;
    roundRect(ctx, cx - 110, 712, 220, 140, 26);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.font = `900 54px ${family}`;
    ctx.fillText(value, cx, 790);
    ctx.font = `700 26px ${family}`;
    ctx.fillStyle = `${INK}b0`;
    ctx.fillText(label, cx, 830);
    // A little star beside the "stars" label.
    if (label === 'stars') star(ctx, cx - ctx.measureText(label).width / 2 - 20, 821, 12, '#ffc93c');
  });

  // Footer: date, tagline, Byte.
  ctx.textAlign = 'left';
  ctx.fillStyle = INK;
  ctx.font = `700 28px ${family}`;
  ctx.fillText(d.date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }), 150, 960);
  ctx.font = `600 22px ${family}`;
  ctx.fillStyle = `${INK}99`;
  ctx.fillText('Date', 150, 992);
  ctx.textAlign = 'right';
  ctx.fillStyle = INK;
  ctx.font = `800 30px ${family}`;
  ctx.fillText('Find your path into AI.', W - 150, 960);
  ctx.font = `600 22px ${family}`;
  ctx.fillStyle = `${INK}99`;
  ctx.fillText('Signed, Byte (your guide)', W - 150, 992);
  byte(ctx, W / 2, 1010, 1.1);
}
