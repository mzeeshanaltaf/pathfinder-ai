import type { Track } from '@/data/roadmap';

/** Track identity colours: Developer = green, Engineer = blue, Common = warm, Meta = lavender. */
export const TRACK_COLORS: Record<Track, { base: string; light: string; dark: string }> = {
  meta: { base: '#b9a3ee', light: '#ddd2fa', dark: '#8b74cf' },
  common: { base: '#ffc078', light: '#ffe0b5', dark: '#e8954a' },
  developer: { base: '#7fd99a', light: '#c4f0cf', dark: '#45b06a' },
  engineer: { base: '#82bdf2', light: '#c6e0fa', dark: '#4b8fd6' },
};

/** Saturated gem colours per track, so Skill Gems pop against the pastel islands. */
export const GEM_COLORS: Record<Track, string> = {
  meta: '#a07cf2',
  common: '#ffa940',
  developer: '#38c86b',
  engineer: '#3f9cf0',
};

export const COLORS = {
  grass: '#8ad466',
  dirt: '#c99e78',
  rock: '#a79fb6',
  rockDark: '#857c98',
  wood: '#c99363',
  woodDark: '#9b6d47',
  rope: '#ecd9ab',
  trunk: '#a3714a',
  leaves: ['#8fd18a', '#74c48f', '#a9de8c', '#9fd6a8'],
  pine: ['#5fb78a', '#6cc49a', '#4fa77e'],
  flowers: ['#ff9eb8', '#ffd66e', '#ffffff', '#b9a3ff', '#ff9f7a'],
  fog: '#d7eaf8',
  void: '#e4f0fb',
  hemiSky: '#e3f1ff',
  hemiGround: '#f6dcc6',
  sun: '#fff3dc',
  outline: '#3d3452',
  label: '#3d3452',
  fade: '#ffffff',
  signBoard: '#f3dcb4',
  robotShell: '#f7f4ff',
  robotScreen: '#2f2a45',
  robotEyes: '#8ff7ff',
} as const;
