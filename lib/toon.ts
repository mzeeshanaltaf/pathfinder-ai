import { DataTexture, NearestFilter, RedFormat } from 'three';

let gradient: DataTexture | null = null;

/** Shared 4-step gradient map for MeshToonMaterial (hard cartoon shading bands). */
export function getToonGradient(): DataTexture {
  if (!gradient) {
    gradient = new DataTexture(new Uint8Array([110, 170, 220, 255]), 4, 1, RedFormat);
    gradient.minFilter = NearestFilter;
    gradient.magFilter = NearestFilter;
    gradient.generateMipmaps = false;
    gradient.needsUpdate = true;
  }
  return gradient;
}
