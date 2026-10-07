import { TRACK_COLORS } from '@/lib/palette';

const INK = '#3d3452';

/** Byte, the guide robot, as a small SVG (same look as the 3D mentor; optional streak hat). */
export default function ByteAvatar({ size = 64, hat = null, className = '' }: { size?: number; hat?: string | null; className?: string }) {
  const accent = TRACK_COLORS.meta.base;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden>
      <ellipse cx="50" cy="94" rx="22" ry="4" fill={INK} opacity="0.15" />
      <rect x="30" y="52" width="40" height="38" rx="19" fill="#f7f4ff" stroke={INK} strokeWidth="3.5" />
      <circle cx="22" cy="68" r="7" fill={accent} stroke={INK} strokeWidth="3" />
      <circle cx="78" cy="68" r="7" fill={accent} stroke={INK} strokeWidth="3" />
      <rect x="18" y="22" width="64" height="38" rx="8" fill={accent} stroke={INK} strokeWidth="3.5" />
      <rect x="25" y="28" width="50" height="26" rx="5" fill="#2f2a45" />
      <ellipse cx="40" cy="41" rx="5" ry="6.5" fill="#8ff7ff" />
      <ellipse cx="60" cy="41" rx="5" ry="6.5" fill="#8ff7ff" />
      {hat ? (
        <g transform="rotate(-10 52 20)">
          <rect x="31" y="17" width="42" height="6" rx="3" fill={hat} stroke={INK} strokeWidth="3" />
          <rect x="39" y="1" width="26" height="18" rx="3" fill={hat} stroke={INK} strokeWidth="3" />
          <rect x="39" y="12" width="26" height="4" fill={INK} />
        </g>
      ) : (
        <>
          <line x1="50" y1="22" x2="50" y2="10" stroke={INK} strokeWidth="3" />
          <circle cx="50" cy="8" r="5" fill={accent} stroke={INK} strokeWidth="2.5" />
        </>
      )}
    </svg>
  );
}
