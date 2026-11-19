import type { StaticImageData } from 'next/image';
import type { PathId } from '@/data/roadmap';
import launchPad from '@/assets/landing/launch-pad.jpg';
import llmLighthouse from '@/assets/landing/llm-lighthouse.jpg';
import meadowVista from '@/assets/landing/meadow-vista.jpg';
import transformerTower from '@/assets/landing/transformer-tower.jpg';

export interface Shot {
  src: StaticImageData;
  alt: string;
}

/**
 * In-game screenshots for the landing page, one per career path (ideally its first or best-known
 * island). A path without one falls back to the view across the trunk.
 */
export const PATH_SHOTS: Partial<Record<PathId, Shot>> = {
  developer: { src: llmLighthouse, alt: 'The LLM Lighthouse, first island on the AI Developer path, with Skill Gems and a mentor robot' },
  engineer: { src: transformerTower, alt: 'Near the Transformer Tower on the AI Engineer path, with a balloon dock and the Model Forge sign' },
  fde: { src: launchPad, alt: 'The Launch Pad on the AI FDE path, with its mentor robot and the bridge to the Proving Grounds' },
};

export const FALLBACK_SHOT: Shot = {
  src: meadowVista,
  alt: 'The view from ML Meadow across the floating islands toward the Fork',
};

export const shotFor = (id: PathId): Shot => PATH_SHOTS[id] ?? FALLBACK_SHOT;
