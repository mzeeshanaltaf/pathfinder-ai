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

/** Discrete player events, counted for listeners outside the Canvas (e.g. the Harbor tutorial). */
export const playerEvents = {
  jumps: 0,
};

/** Imperative hooks the Player registers for scripted moves (balloon landing, finale). */
export const playerControl: {
  /** Move the player's feet to (x, feetY, z); optionally set the look direction (pitch resets to 0). */
  teleport: ((x: number, feetY: number, z: number, yaw?: number) => void) | null;
  /** Turn the view without moving. */
  face: ((yaw: number, pitch?: number) => void) | null;
} = { teleport: null, face: null };

let travelRequest: PhaseId | null = null;

/** Ask for a hot-air balloon flight to an island's dock (consumed by BalloonTravel). */
export function requestTravel(id: PhaseId) {
  travelRequest = id;
}

/** Consumed by the balloon director's frame loop. */
export function takeTravelRequest(): PhaseId | null {
  const id = travelRequest;
  travelRequest = null;
  return id;
}

/** One-shot "skip the cinematic" flag (Skip button / Space / Enter / Esc). */
export const cinematicControl = { skip: false };
