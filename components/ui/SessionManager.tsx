'use client';

import { useEffect } from 'react';
import { initAudio } from '@/lib/audio';
import { BYTE_HATS, hasProgress, newAchievements, STREAK_MILESTONES } from '@/lib/progress';
import { useProgress } from '@/store/progress';
import { useUi } from '@/store/ui';

/** What happened to the streak when this session started (read by the welcome-back card). */
export const sessionInfo = { streakBefore: 0, streakAfter: 0 };

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
