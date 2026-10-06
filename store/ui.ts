import { create } from 'zustand';
import type { PhaseId } from '@/data/roadmap';

export type UiMode = 'explore' | 'panel' | 'minigame' | 'passport' | 'menu';

interface UiState {
  mode: UiMode;
  /** The landmark the player is close enough to interact with (null when none). */
  nearbyPhaseId: PhaseId | null;
  /** The island the player is standing on (null on bridges / in the air). */
  currentIsland: PhaseId | null;
  activePhaseId: PhaseId | null;
  /** Desktop pointer lock is active. */
  pointerLocked: boolean;
  /** Full-screen white fade (respawn / travel). */
  fading: boolean;
  /** Physics + world have mounted. */
  worldReady: boolean;
  /** Gem ids waiting to be shown as toasts (head = showing). */
  toastQueue: string[];

  setMode: (mode: UiMode) => void;
  setNearby: (id: PhaseId | null) => void;
  setCurrentIsland: (id: PhaseId | null) => void;
  setPointerLocked: (locked: boolean) => void;
  setFading: (fading: boolean) => void;
  setWorldReady: (ready: boolean) => void;
  /** Open the Phase Panel for a phase (releases pointer lock). */
  openPanel: (id: PhaseId) => void;
  /** Back to exploring. */
  closeOverlay: () => void;
  pushToast: (gemId: string) => void;
  shiftToast: () => void;
}

export const useUi = create<UiState>()((set, get) => ({
  mode: 'explore',
  nearbyPhaseId: null,
  currentIsland: null,
  activePhaseId: null,
  pointerLocked: false,
  fading: false,
  worldReady: false,
  toastQueue: [],

  setMode: (mode) => {
    if (mode !== 'explore' && typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock();
    }
    set({ mode });
  },
  setNearby: (nearbyPhaseId) => set({ nearbyPhaseId }),
  setCurrentIsland: (currentIsland) => set({ currentIsland }),
  setPointerLocked: (pointerLocked) => set({ pointerLocked }),
  setFading: (fading) => set({ fading }),
  setWorldReady: (worldReady) => set({ worldReady }),
  openPanel: (id) => {
    get().setMode('panel');
    set({ activePhaseId: id });
  },
  closeOverlay: () => set({ mode: 'explore', activePhaseId: null }),
  pushToast: (gemId) => set((s) => ({ toastQueue: [...s.toastQueue, gemId] })),
  shiftToast: () => set((s) => ({ toastQueue: s.toastQueue.slice(1) })),
}));
