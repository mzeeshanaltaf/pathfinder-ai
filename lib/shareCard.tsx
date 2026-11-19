import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

/** Open Graph / Twitter card size (1.91:1). */
export const SHARE_SIZE = { width: 1200, height: 630 };

const INK = '#3d3452';

/** The logo mark (Logo.tsx without the animation), drawn at `size` px. */
function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <path d="M86 14c10 0 17 8 17 17 0 9-8 15-12 21h-10c-4-6-12-12-12-21 0-9 7-17 17-17z" fill="#82bdf2" stroke={INK} strokeWidth="3" />
      <rect x="81" y="56" width="10" height="7" rx="2" fill="#e9c79a" stroke={INK} strokeWidth="2.5" />
      <path d="M14 74h76l-10 12-14 16-12 8-10-8-16-14z" fill="#b4abc4" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M12 68c0-4 3-6 7-6h66c4 0 7 2 7 6v4c0 3-2 5-5 5H17c-3 0-5-2-5-5z" fill="#8ad466" stroke={INK} strokeWidth="3.5" />
      <path d="M52 76l0-10" stroke="#ffc078" strokeWidth="5" strokeLinecap="round" />
      <path d="M52 66l-14-6" stroke="#45b06a" strokeWidth="5" strokeLinecap="round" />
      <path d="M52 66l14-6" stroke="#4b8fd6" strokeWidth="5" strokeLinecap="round" />
      <path d="M52 28l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" fill="#ffc93c" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

interface ShareCardProps {
  /** Small line above the title (e.g. "Pathfinder AI · Roadmap"). */
  eyebrow?: string;
  title: string;
  /** Coloured line under the title. */
  tagline: string;
  body: string;
  cta: string;
  /** Tagline and button colour. */
  accent?: string;
  /** Long titles get a smaller font, a smaller logo and a wider text column, so they stay on one line. */
  compact?: boolean;
}

/** Renders a share card with the bundled Geist font (generated at build time). */
export async function shareCard({ eyebrow, title, tagline, body, cta, accent = '#8b74cf', compact = false }: ShareCardProps) {
  const geist = await readFile(join(process.cwd(), 'public/fonts/Geist-Regular.ttf'));
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: compact ? 40 : 56,
          padding: '0 48px',
          background: 'linear-gradient(180deg, #bfe0fb 0%, #e6f1fc 55%, #ece4fb 100%)',
          fontFamily: 'Geist',
          color: INK,
        }}
      >
        <Mark size={compact ? 240 : 300} />
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: compact ? 780 : 680 }}>
          {eyebrow && <div style={{ fontSize: 30, marginBottom: 14, opacity: 0.75 }}>{eyebrow}</div>}
          <div style={{ fontSize: compact ? 66 : 88, lineHeight: 1.02, letterSpacing: -2 }}>{title}</div>
          <div style={{ fontSize: 44, marginTop: 18, color: accent }}>{tagline}</div>
          <div style={{ fontSize: 30, marginTop: 26, lineHeight: 1.3, opacity: 0.8 }}>{body}</div>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              marginTop: 30,
              padding: '14px 32px',
              fontSize: 36,
              color: '#fff',
              background: accent,
              border: `4px solid ${INK}`,
              borderRadius: 999,
            }}
          >
            {cta}
          </div>
        </div>
      </div>
    ),
    { ...SHARE_SIZE, fonts: [{ name: 'Geist', data: geist, style: 'normal', weight: 400 }] },
  );
}
