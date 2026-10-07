import { create } from 'zustand';
import type { PathId, PhaseId } from '@/data/roadmap';

/** `cinematic` (Phase 5): the camera is scripted (balloon flight, Summit finale); input is off and the Player skips its camera rig. */
export type UiMode = 'explore' | 'panel' | 'minigame' | 'passport' | 'menu' | 'cinematic';

/** Which full-screen card `mode === 'menu'` shows. */
export type MenuId = 'onboarding' | 'welcome' | 'settings' | 'finale' | 'certificate';

export type Cinematic = { kind: 'balloon'; to: PhaseId } | { kind: 'finale' };

export type PassportTab = 'map' | 'roadmap' | 'journey' | 'awards';

/** A queued celebratory toast (achievement, streak milestone, new hat). */
export interface Notice {
  key: string;
  icon: string;
  title: string;
  text: string;
}

/** Rendering tier: 2 = full, 1 = dpr 1, 0 = low (no shadows, fewer clouds / flowers / particles). */
export type PerfTier = 0 | 1 | 2;

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
  /** Full-screen white fade (respawn / travel). */
  fading: boolean;
  /** Physics + world have mounted. */
  worldReady: boolean;
  /** The gem card on screen (gem id; stays until closed, a new gem replaces it). */
  gemCard: string | null;
  /** Where the open Phase Panel was opened from: 'passport' adds a back button. */
  panelFrom: 'passport' | null;
  passportTab: PassportTab;
  /** Island selected on the Passport map (kept across a trip to the island guide and back). */
  passportSelected: PhaseId | null;
  /** Career path shown on the Roadmap tab (null = the player's preferred path). */
  roadmapPath: PathId | null;
  /** Set when a mini-game finishes; the host then shows its result screen. */
  miniGameResult: MiniGameResult | null;
  /** Harbor tutorial in progress (null when not running). */
  tutorial: TutorialSteps | null;
  /** Balloon dock in interact range (lowest E priority). */
  nearbyDock: PhaseId | null;
  menu: MenuId | null;
  cinematic: Cinematic | null;
  notices: Notice[];
  /** Auto-quality tier from PerformanceMonitor (used when settings.quality is 'auto'). */
  perfTier: PerfTier;

  setMode: (mode: UiMode) => void;
  setNearbyDock: (id: PhaseId | null) => void;
  openMenu: (menu: MenuId) => void;
  startCinematic: (c: Cinematic) => void;
  pushNotice: (n: Notice) => void;
  shiftNotice: () => void;
  setPerfTier: (tier: PerfTier) => void;
  setNearby: (id: PhaseId | null) => void;
  setNearbyChallenge: (id: PhaseId | null) => void;
  setCurrentIsland: (id: PhaseId | null) => void;
  setFading: (fading: boolean) => void;
  setWorldReady: (ready: boolean) => void;
  /** Open the Phase Panel for a phase. From the Passport, the panel gets a "← Passport" back button. */
  openPanel: (id: PhaseId, from?: 'passport') => void;
  /** Open the Passport (default tab: Map) with the current island selected. */
  openPassport: (tab?: PassportTab) => void;
  /** Back from the island guide to the Passport, keeping its tab and selection. */
  backToPassport: () => void;
  setPassportTab: (tab: PassportTab) => void;
  setPassportSelected: (id: PhaseId | null) => void;
  setRoadmapPath: (id: PathId) => void;
  /** Open a phase's mini-game at its intro card. */
  openMiniGame: (id: PhaseId) => void;
  /** Show a finished run's result screen (opens the host if it isn't open). */
  showMiniGameResult: (result: MiniGameResult) => void;
  clearMiniGameResult: () => void;
  setTutorial: (steps: TutorialSteps | null) => void;
  /** Back to exploring. */
  closeOverlay: () => void;
  /** Show a gem card (replaces any open one). */
  showGemCard: (gemId: string) => void;
  closeGemCard: () => void;
}

export const useUi = create<UiState>()((set, get) => ({
  mode: 'explore',
  nearbyPhaseId: null,
  nearbyChallenge: null,
  currentIsland: null,
  activePhaseId: null,
  fading: false,
  worldReady: false,
  gemCard: null,
  panelFrom: null,
  passportTab: 'map',
  passportSelected: null,
  roadmapPath: null,
  miniGameResult: null,
  tutorial: null,
  nearbyDock: null,
  menu: null,
  cinematic: null,
  notices: [],
  perfTier: 2,

  setMode: (mode) => set({ mode }),
  setNearbyDock: (nearbyDock) => set({ nearbyDock }),
  openMenu: (menu) => {
    get().setMode('menu');
    set({ menu, cinematic: null, panelFrom: null });
  },
  startCinematic: (cinematic) => {
    get().setMode('cinematic');
    set({ cinematic, menu: null, activePhaseId: null, panelFrom: null, miniGameResult: null });
  },
  pushNotice: (n) => set((s) => ({ notices: [...s.notices, n] })),
  shiftNotice: () => set((s) => ({ notices: s.notices.slice(1) })),
  setPerfTier: (perfTier) => set({ perfTier }),
  setNearby: (nearbyPhaseId) => set({ nearbyPhaseId }),
  setNearbyChallenge: (nearbyChallenge) => set({ nearbyChallenge }),
  setCurrentIsland: (currentIsland) => set({ currentIsland }),
  setFading: (fading) => set({ fading }),
  setWorldReady: (worldReady) => set({ worldReady }),
  openPanel: (id, from) => set({ mode: 'panel', activePhaseId: id, panelFrom: from ?? null }),
  openPassport: (tab = 'map') =>
    set((s) => ({ mode: 'passport', passportTab: tab, passportSelected: s.currentIsland, activePhaseId: null, panelFrom: null })),
  backToPassport: () => set({ mode: 'passport', activePhaseId: null, panelFrom: null }),
  setPassportTab: (passportTab) => set({ passportTab }),
  setPassportSelected: (passportSelected) => set({ passportSelected }),
  setRoadmapPath: (roadmapPath) => set({ roadmapPath }),
  openMiniGame: (id) => {
    get().setMode('minigame');
    set({ activePhaseId: id, panelFrom: null, miniGameResult: null });
  },
  showMiniGameResult: (result) => {
    get().setMode('minigame');
    set({ activePhaseId: result.phaseId, miniGameResult: result });
  },
  clearMiniGameResult: () => set({ miniGameResult: null }),
  setTutorial: (tutorial) => set({ tutorial }),
  closeOverlay: () => set({ mode: 'explore', activePhaseId: null, panelFrom: null, miniGameResult: null, menu: null, cinematic: null }),
  showGemCard: (gemCard) => set({ gemCard }),
  closeGemCard: () => set({ gemCard: null }),
}));
