import type { PhaseId } from '@/data/roadmap';

/**
 * Written by the Player every frame, read by HTML overlays (minimap) in their own rAF loop.
 * Plain mutable object on purpose: no React state per frame.
 */
export const playerPose = {
  x: 0,
  /** Feet height. */
  y: 0,
  z: 0,
  /** Camera yaw (0 = looking towards −Z). */
  yaw: 0,
};

let travelRequest: PhaseId | null = null;

/** Ask the Player to fade out and reappear at the centre of an island (free fast-travel). */
export function requestTravel(id: PhaseId) {
  travelRequest = id;
}

/** Consumed by the Player's frame loop. */
export function takeTravelRequest(): PhaseId | null {
  const id = travelRequest;
  travelRequest = null;
  return id;
}
