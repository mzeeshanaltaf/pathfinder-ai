import { AdditiveBlending, Color, MeshBasicMaterial, MeshToonMaterial, NormalBlending } from 'three';
import { getToonGradient } from '@/lib/toon';

// Shared, memoised materials. Landmarks and props pass these via `material={...}` so
// identical colours reuse one material (fewer programs / state changes per frame).

const toonCache = new Map<string, MeshToonMaterial>();
const basicCache = new Map<string, MeshBasicMaterial>();

/** Toon material for a flat colour (optionally glowing). */
export function toon(color: string, emissive?: string, emissiveIntensity = 0.6): MeshToonMaterial {
  const key = `${color}|${emissive ?? ''}|${emissiveIntensity}`;
  let m = toonCache.get(key);
  if (!m) {
    m = new MeshToonMaterial({ color, gradientMap: getToonGradient() });
    if (emissive) {
      m.emissive = new Color(emissive);
      m.emissiveIntensity = emissiveIntensity;
    }
    toonCache.set(key, m);
  }
  return m;
}

let vertexToonMat: MeshToonMaterial | null = null;

/** Toon material that takes its colour from the geometry's vertex colours (merged static props). */
export function vertexToon(): MeshToonMaterial {
  vertexToonMat ??= new MeshToonMaterial({ vertexColors: true, gradientMap: getToonGradient() });
  return vertexToonMat;
}

let vertexGlowMat: MeshBasicMaterial | null = null;

/** Unlit vertex-coloured material: lit windows, screens and lamps merged into one mesh. */
export function vertexGlow(): MeshBasicMaterial {
  vertexGlowMat ??= new MeshBasicMaterial({ vertexColors: true, toneMapped: false });
  return vertexGlowMat;
}

/** Unlit glow (holograms, beams, sparks). Additive glows never write depth. */
export function glow(color: string, opacity = 1, additive = true): MeshBasicMaterial {
  const key = `${color}|${opacity}|${additive}`;
  let m = basicCache.get(key);
  if (!m) {
    m = new MeshBasicMaterial({
      color,
      transparent: opacity < 1 || additive,
      opacity,
      depthWrite: !additive && opacity >= 1,
      blending: additive ? AdditiveBlending : NormalBlending,
      toneMapped: false,
    });
    basicCache.set(key, m);
  }
  return m;
}

/**
 * A material that animates (its own instance: opacity / colour change per frame). Additive reads as
 * light but washes out to white against the bright sky; use `additive = false` for tinted glass.
 */
export function animatedGlow(color: string, opacity = 1, additive = true): MeshBasicMaterial {
  return new MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: additive ? AdditiveBlending : NormalBlending,
    toneMapped: false,
  });
}
