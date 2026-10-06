let url: string | null = null;

/**
 * Soft puff sprite for drei <Clouds>, drawn on a canvas so we don't depend on
 * drei's default CDN-hosted texture. Client-only.
 */
export function getCloudTextureUrl(): string {
  if (url) return url;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const puffs: [number, number, number][] = [
    [0.5, 0.55, 0.42],
    [0.33, 0.6, 0.28],
    [0.68, 0.58, 0.3],
    [0.48, 0.38, 0.3],
  ];
  for (const [x, y, r] of puffs) {
    const g = ctx.createRadialGradient(x * size, y * size, 0, x * size, y * size, r * size);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.45)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  url = canvas.toDataURL('image/png');
  return url;
}
