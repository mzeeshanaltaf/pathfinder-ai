'use client';

import { useEffect } from 'react';
import { CAREER_PATH_BY_ID, PATH_IDS, type PathId } from '@/data/roadmap';
import { initAudio } from '@/lib/audio';
import { PLAY_PATH_PARAM } from '@/lib/playLinks';
import { BYTE_HATS, hasProgress, newAchievements, STREAK_MILESTONES } from '@/lib/progress';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';

/** What happened to the streak when this session started (read by the welcome-back card). */
export const sessionInfo = { streakBefore: 0, streakAfter: 0 };

/**
 * `/play?path=engineer` (from the landing page): remember the chosen path, then drop the parameter
 * so a reload or a shared link doesn't re-apply it. Returns the path when it was newly applied.
 */
function takeChosenPathFromUrl(): PathId | null {
  const url = new URL(window.location.href);
  const raw = url.searchParams.get(PLAY_PATH_PARAM);
  if (raw === null) return null;
  url.searchParams.delete(PLAY_PATH_PARAM);
  window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
  const path = (PATH_IDS as readonly string[]).includes(raw) ? (raw as PathId) : null;
  if (!path) return null;
  useProgress.getState().setChosenPath(path);
  return path;
}

/** Set on mount, announced once the world is ready (the toast would be hidden behind the loading screen). */
let pathToAnnounce: PathId | null = null;

/** Count today's visit; celebrate a longer streak and any hat it unlocks. */
function countVisit() {
  const { before, after } = useProgress.getState().touchStreak();
  if (after <= before) return;
  const ui = useUi.getState();
  if (after > 1) ui.pushNotice({ key: `streak:${after}`, icon: '🔥', title: 'Daily streak', text: `${after} days in a row. Keep it going!` });
  for (const m of STREAK_MILESTONES) {
    const hat = BYTE_HATS.find((h) => h.days === m);
    if (hat && before < m && after >= m) {
      ui.pushNotice({ key: `hat:${hat.id}`, icon: '🎩', title: `${m}-day streak`, text: `Byte unlocked the ${hat.label} hat! Try it on in Settings.` });
    }
  }
}

/** The Summit celebration plays once, the first time the player stands on the Summit with its badge. */
function maybeStartFinale() {
  const ui = useUi.getState();
  const p = useProgress.getState();
  if (p.finaleSeen || !p.badges.summit) return;
  if (ui.currentIsland !== 'summit' || ui.mode !== 'explore' || ui.fading || !ui.worldReady) return;
  p.setFinaleSeen();
  ui.startCinematic({ kind: 'finale' });
}

/**
 * Session-level wiring with no UI of its own: sound, the daily streak, achievements, the first
 * card a player sees (onboarding or welcome back) and the Summit finale trigger.
 */
export default function SessionManager() {
  const worldReady = useUi((s) => s.worldReady);

  // Sound + achievements (existing saves unlock silently; new ones toast).
  useEffect(() => {
    initAudio();
    // `??` keeps the first result when Strict Mode re-runs this effect (the parameter is gone by then).
    pathToAnnounce = takeChosenPathFromUrl() ?? pathToAnnounce;
    const p = useProgress.getState();
    p.unlockAchievements(newAchievements(p).map((a) => a.id));
    const unsubProgress = useProgress.subscribe((s, prev) => {
      if (s !== prev) {
        const fresh = newAchievements(s);
        if (fresh.length) {
          s.unlockAchievements(fresh.map((a) => a.id));
          for (const a of fresh) useUi.getState().pushNotice({ key: `ach:${a.id}`, icon: a.icon, title: 'Achievement unlocked', text: a.title });
        }
      }
      maybeStartFinale();
    });
    const unsubUi = useUi.subscribe(maybeStartFinale);
    return () => {
      unsubProgress();
      unsubUi();
    };
  }, []);

  // Once the world is in: count the visit, then onboarding (first visit) or the welcome-back card.
  useEffect(() => {
    if (!worldReady) return;
    const before = useProgress.getState().streak.count;
    countVisit();
    sessionInfo.streakBefore = before;
    sessionInfo.streakAfter = useProgress.getState().streak.count;
    const p = useProgress.getState();
    const ui = useUi.getState();
    if (pathToAnnounce) {
      const path = CAREER_PATH_BY_ID[pathToAnnounce];
      ui.pushNotice({
        key: `path:${path.id}`,
        icon: path.emoji,
        title: `${path.pathLabel} chosen`,
        text: 'The compass follows it once the shared trunk is done. Every island stays open.',
      });
      pathToAnnounce = null;
    }
    if (ui.mode === 'explore') {
      if (!p.onboardingDone) ui.openMenu('onboarding');
      else if (hasProgress(p)) ui.openMenu('welcome');
    }
    // A tab left open past midnight still counts the new day when it comes back.
    const onVisible = () => {
      if (!document.hidden) countVisit();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [worldReady]);

  return null;
}
