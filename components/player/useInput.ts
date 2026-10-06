'use client';

import { useCallback, useEffect } from 'react';
import { useKeyboardControls, type KeyboardControlsEntry } from '@react-three/drei';

export type ControlName = 'forward' | 'back' | 'left' | 'right' | 'jump' | 'sprint' | 'interact';

export const KEYBOARD_MAP: KeyboardControlsEntry<ControlName>[] = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'back', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'sprint', keys: ['ShiftLeft', 'ShiftRight'] },
  { name: 'interact', keys: ['KeyE'] },
];

/**
 * Written by MobileControls (rendered outside the Canvas), read every frame by the Player.
 * Plain mutable object on purpose: no React state in the frame loop.
 */
export const touchState = {
  /** Joystick, −1..1. moveY is forward. */
  moveX: 0,
  moveY: 0,
  /** Accumulated drag-look pixels since the last frame. */
  lookDX: 0,
  lookDY: 0,
  /** One-shot presses, consumed by the reader (`interact` is also set by the E key). */
  jump: false,
  interact: false,
};

const mouseState = { dx: 0, dy: 0 };

const MOUSE_RAD_PER_PX = 0.0022;
const TOUCH_RAD_PER_PX = 0.0048;

export interface InputFrame {
  /** Strafe right (+) / left (−), −1..1. */
  moveX: number;
  /** Forward (+) / back (−), −1..1. */
  moveY: number;
  sprint: boolean;
  /** Jump requested this frame (held key or a touch press). */
  jump: boolean;
  /** Interact pressed this frame (edge). */
  interact: boolean;
  /** Look deltas in radians (before user sensitivity). +X turns right, +Y looks down. */
  lookX: number;
  lookY: number;
}

/** Returns a reader to call once per frame inside useFrame. */
export function useInput(): () => InputFrame {
  const [, getKeys] = useKeyboardControls<ControlName>();

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!document.pointerLockElement) return;
      // Some browsers emit a huge spurious delta right after locking; drop it.
      if (Math.abs(e.movementX) > 400 || Math.abs(e.movementY) > 400) return;
      mouseState.dx += e.movementX;
      mouseState.dy += e.movementY;
    };
    // Interact is event-driven so a quick tap (down + up within one frame) is never missed.
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && !e.repeat) touchState.interact = true;
    };
    document.addEventListener('mousemove', onMove);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousemove', onMove);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return useCallback((): InputFrame => {
    const k = getKeys();

    let moveX = (k.right ? 1 : 0) - (k.left ? 1 : 0) + touchState.moveX;
    let moveY = (k.forward ? 1 : 0) - (k.back ? 1 : 0) + touchState.moveY;
    const len = Math.hypot(moveX, moveY);
    if (len > 1) {
      moveX /= len;
      moveY /= len;
    }

    const lookX = mouseState.dx * MOUSE_RAD_PER_PX + touchState.lookDX * TOUCH_RAD_PER_PX;
    const lookY = mouseState.dy * MOUSE_RAD_PER_PX + touchState.lookDY * TOUCH_RAD_PER_PX;
    mouseState.dx = mouseState.dy = 0;
    touchState.lookDX = touchState.lookDY = 0;

    const jump = k.jump || touchState.jump;
    touchState.jump = false;

    const interact = touchState.interact;
    touchState.interact = false;

    // Mobile sprints when the stick is pushed to the rim.
    const sprint = k.sprint || Math.hypot(touchState.moveX, touchState.moveY) > 0.92;

    return { moveX, moveY, sprint, jump, interact, lookX, lookY };
  }, [getKeys]);
}

/** Drop any buffered look/press input (e.g. after a mode switch). */
export function clearInput() {
  mouseState.dx = mouseState.dy = 0;
  touchState.lookDX = touchState.lookDY = 0;
  touchState.jump = touchState.interact = false;
}
