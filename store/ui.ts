import { create } from 'zustand';
import type { PhaseId } from '@/data/roadmap';

export type UiMode = 'explore' | 'panel' | 'minigame' | 'passport' | 'menu';

/** A finished mini-game run, shown on the host's result screen. */
export interface MiniGameResult {
  phaseId: PhaseId;
  score: number;
  stars: 1 | 2 | 3;
  /** Best stars before this run (0 = no badge yet) and after it. */
  prevStars: 0 | 1 | 2 | 3;
  best: 1 | 2 | 3;
}

/** The Harbor tutorial runs in explore mode; these are its three checks. */
export interface TutorialSteps {
  look: boolean;
  jump: boolean;
  passport: boolean;
}

interface UiState {
  mode: UiMode;
  /** The landmark the player is close enough to interact with (null when none). */
  nearbyPhaseId: PhaseId | null;
  /** The Challenge pedestal the player is close enough to use (takes priority over the landmark). */
  nearbyChallenge: PhaseId | null;
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
  /** Set when a mini-game finishes; the host then shows its result screen. */
  miniGameResult: MiniGameResult | null;
  /** Harbor tutorial in progress (null when not running). */
  tutorial: TutorialSteps | null;

  setMode: (mode: UiMode) => void;
  setNearby: (id: PhaseId | null) => void;
  setNearbyChallenge: (id: PhaseId | null) => void;
  setCurrentIsland: (id: PhaseId | null) => void;
  setPointerLocked: (locked: boolean) => void;
  setFading: (fading: boolean) => void;
  setWorldReady: (ready: boolean) => void;
  /** Open the Phase Panel for a phase (releases pointer lock). */
  openPanel: (id: PhaseId) => void;
  /** Open a phase's mini-game at its intro card (releases pointer lock). */
  openMiniGame: (id: PhaseId) => void;
  /** Show a finished run's result screen (opens the host if it isn't open). */
  showMiniGameResult: (result: MiniGameResult) => void;
  clearMiniGameResult: () => void;
  setTutorial: (steps: TutorialSteps | null) => void;
  /** Back to exploring. */
  closeOverlay: () => void;
  pushToast: (gemId: string) => void;
  shiftToast: () => void;
}

export const useUi = create<UiState>()((set, get) => ({
  mode: 'explore',
  nearbyPhaseId: null,
  nearbyChallenge: null,
  currentIsland: null,
  activePhaseId: null,
  pointerLocked: false,
  fading: false,
  worldReady: false,
  toastQueue: [],
  miniGameResult: null,
  tutorial: null,

  setMode: (mode) => {
    if (mode !== 'explore' && typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock();
    }
    set({ mode });
  },
  setNearby: (nearbyPhaseId) => set({ nearbyPhaseId }),
  setNearbyChallenge: (nearbyChallenge) => set({ nearbyChallenge }),
  setCurrentIsland: (currentIsland) => set({ currentIsland }),
  setPointerLocked: (pointerLocked) => set({ pointerLocked }),
  setFading: (fading) => set({ fading }),
  setWorldReady: (worldReady) => set({ worldReady }),
  openPanel: (id) => {
    get().setMode('panel');
    set({ activePhaseId: id });
  },
  openMiniGame: (id) => {
    get().setMode('minigame');
    set({ activePhaseId: id, miniGameResult: null });
  },
  showMiniGameResult: (result) => {
    get().setMode('minigame');
    set({ activePhaseId: result.phaseId, miniGameResult: result });
  },
  clearMiniGameResult: () => set({ miniGameResult: null }),
  setTutorial: (tutorial) => set({ tutorial }),
  closeOverlay: () => set({ mode: 'explore', activePhaseId: null, miniGameResult: null }),
  pushToast: (gemId) => set((s) => ({ toastQueue: [...s.toastQueue, gemId] })),
  shiftToast: () => set((s) => ({ toastQueue: s.toastQueue.slice(1) })),
}));
