'use client';

import { useCallback, useEffect } from 'react';
import { useKeyboardControls, type KeyboardControlsEntry } from '@react-three/drei';

export type ControlName = 'forward' | 'back' | 'turnLeft' | 'turnRight' | 'jump' | 'sprint' | 'interact';

export const KEYBOARD_MAP: KeyboardControlsEntry<ControlName>[] = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'back', keys: ['KeyS', 'ArrowDown'] },
  { name: 'turnLeft', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'turnRight', keys: ['KeyD', 'ArrowRight'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'sprint', keys: ['ShiftLeft', 'ShiftRight'] },
  { name: 'interact', keys: ['KeyE'] },
];

/**
 * Written by MobileControls (rendered outside the Canvas), read every frame by the Player.
 * Plain mutable object on purpose: no React state in the frame loop.
 */
export const touchState = {
  /** Joystick, −1..1. moveX turns (right +), moveY walks (forward +). */
  moveX: 0,
  moveY: 0,
  /** One-shot presses, consumed by the reader (`interact` is also set by the E key). */
  jump: false,
  interact: false,
};

export interface InputFrame {
  /** Walk forward (+) / back (−), −1..1. */
  moveY: number;
  /** Turn right (+) / left (−), −1..1. */
  turn: number;
  sprint: boolean;
  /** Jump requested this frame (held key or a touch press). */
  jump: boolean;
  /** Interact pressed this frame (edge). */
  interact: boolean;
}

const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));

/** Returns a reader to call once per frame inside useFrame. Keyboard + joystick only (tank controls). */
export function useInput(): () => InputFrame {
  const [, getKeys] = useKeyboardControls<ControlName>();

  useEffect(() => {
    // Interact is event-driven so a quick tap (down + up within one frame) is never missed.
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && !e.repeat) touchState.interact = true;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return useCallback((): InputFrame => {
    const k = getKeys();

    const turn = clamp1((k.turnRight ? 1 : 0) - (k.turnLeft ? 1 : 0) + touchState.moveX);
    const moveY = clamp1((k.forward ? 1 : 0) - (k.back ? 1 : 0) + touchState.moveY);

    const jump = k.jump || touchState.jump;
    touchState.jump = false;

    const interact = touchState.interact;
    touchState.interact = false;

    // Mobile sprints when the stick is pushed to the rim.
    const sprint = k.sprint || Math.hypot(touchState.moveX, touchState.moveY) > 0.92;

    return { moveY, turn, sprint, jump, interact };
  }, [getKeys]);
}
