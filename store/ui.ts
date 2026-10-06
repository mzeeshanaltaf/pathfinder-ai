import { create } from 'zustand';
import type { PhaseId } from '@/data/roadmap';

export type UiMode = 'explore' | 'panel' | 'minigame' | 'passport' | 'menu';

interface UiState {
  mode: UiMode;
  /** Phase 1: the island the player is standing on (null on bridges / in the air). */
  nearbyPhaseId: PhaseId | null;
  activePhaseId: PhaseId | null;
  /** Desktop pointer lock is active. */
  pointerLocked: boolean;
  /** Full-screen white fade (respawn). */
  fading: boolean;
  /** Physics + world have mounted. */
  worldReady: boolean;

  setMode: (mode: UiMode) => void;
  setNearby: (id: PhaseId | null) => void;
  setPointerLocked: (locked: boolean) => void;
  setFading: (fading: boolean) => void;
  setWorldReady: (ready: boolean) => void;
}

export const useUi = create<UiState>()((set) => ({
  mode: 'explore',
  nearbyPhaseId: null,
  activePhaseId: null,
  pointerLocked: false,
  fading: false,
  worldReady: false,

  setMode: (mode) => {
    if (mode !== 'explore' && typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock();
    }
    set({ mode });
  },
  setNearby: (nearbyPhaseId) => set({ nearbyPhaseId }),
  setPointerLocked: (pointerLocked) => set({ pointerLocked }),
  setFading: (fading) => set({ fading }),
  setWorldReady: (worldReady) => set({ worldReady }),
}));
