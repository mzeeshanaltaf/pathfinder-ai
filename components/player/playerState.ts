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
  /** Facing yaw (0 = facing −Z); the third-person camera sits behind it. */
  yaw: 0,
};

/** Discrete player events, counted for listeners outside the Canvas (e.g. the Harbor tutorial). */
export const playerEvents = {
  jumps: 0,
};

/** Imperative hooks the Player registers for scripted moves (balloon landing, finale). */
export const playerControl: {
  /**
   * Move the player's feet to (x, feetY, z); optionally set the facing. The camera cuts to the new spot
   * unless `snap: false` (a balloon landing blends from the cinematic camera instead).
   */
  teleport: ((x: number, feetY: number, z: number, yaw?: number, opts?: { snap?: boolean }) => void) | null;
  /** Turn to face a direction without moving. */
  face: ((yaw: number) => void) | null;
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
