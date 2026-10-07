import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const alt = 'Pathfinder AI: find your path into AI. Walk AI career roadmaps across a world of floating islands.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const INK = '#3d3452';

/** Social share card, generated at build time. */
export default async function Image() {
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
          gap: 56,
          background: 'linear-gradient(180deg, #bfe0fb 0%, #e6f1fc 55%, #ece4fb 100%)',
          fontFamily: 'Geist',
          color: INK,
        }}
      >
        <svg width="300" height="300" viewBox="0 0 120 120">
          <path d="M86 14c10 0 17 8 17 17 0 9-8 15-12 21h-10c-4-6-12-12-12-21 0-9 7-17 17-17z" fill="#82bdf2" stroke={INK} strokeWidth="3" />
          <rect x="81" y="56" width="10" height="7" rx="2" fill="#e9c79a" stroke={INK} strokeWidth="2.5" />
          <path d="M14 74h76l-10 12-14 16-12 8-10-8-16-14z" fill="#b4abc4" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M12 68c0-4 3-6 7-6h66c4 0 7 2 7 6v4c0 3-2 5-5 5H17c-3 0-5-2-5-5z" fill="#8ad466" stroke={INK} strokeWidth="3.5" />
          <path d="M52 76l0-10" stroke="#ffc078" strokeWidth="5" strokeLinecap="round" />
          <path d="M52 66l-14-6" stroke="#45b06a" strokeWidth="5" strokeLinecap="round" />
          <path d="M52 66l14-6" stroke="#4b8fd6" strokeWidth="5" strokeLinecap="round" />
          <path d="M52 28l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" fill="#ffc93c" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 640 }}>
          <div style={{ fontSize: 92, lineHeight: 1, letterSpacing: -2 }}>Pathfinder AI</div>
          <div style={{ fontSize: 44, marginTop: 18, color: '#8b74cf' }}>Find your path into AI.</div>
          <div style={{ fontSize: 30, marginTop: 28, lineHeight: 1.3, opacity: 0.8 }}>
            Walk the AI Developer, AI Engineer and AI FDE roadmaps across a world of floating islands. Collect skills, play challenges, reach the Summit.
          </div>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              marginTop: 30,
              padding: '14px 32px',
              fontSize: 36,
              color: '#fff',
              background: '#8b74cf',
              border: `4px solid ${INK}`,
              borderRadius: 999,
            }}
          >
            Start exploring free →
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: 'Geist', data: geist, style: 'normal', weight: 400 }] },
  );
}
