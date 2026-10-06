'use client';

import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { useUi } from '@/store/ui';
import { touchState } from './useInput';

const STICK_RADIUS = 56;

/** Touch controls overlay: left half = floating joystick, right half = drag-to-look, plus Jump / Interact. */
export default function MobileControls() {
  const stickId = useRef<number | null>(null);
  const stickOrigin = useRef({ x: 0, y: 0 });
  const lookId = useRef<number | null>(null);
  const lookLast = useRef({ x: 0, y: 0 });
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const mode = useUi((s) => s.mode);
  const nearby = useUi((s) => s.nearbyPhaseId !== null);

  // iOS Safari pinch-zoom gestures ignore touch-action; block them explicitly.
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener('gesturestart', prevent);
    document.addEventListener('dblclick', prevent);
    return () => {
      document.removeEventListener('gesturestart', prevent);
      document.removeEventListener('dblclick', prevent);
      touchState.moveX = touchState.moveY = 0;
    };
  }, []);

  const showStick = (x: number, y: number, visible: boolean) => {
    const base = baseRef.current;
    if (!base) return;
    base.style.opacity = visible ? '1' : '0';
    base.style.transform = `translate(${x - STICK_RADIUS}px, ${y - STICK_RADIUS}px)`;
  };

  const moveKnob = (dx: number, dy: number) => {
    if (knobRef.current) knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const onStickDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (stickId.current !== null) return;
    stickId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    stickOrigin.current = { x: e.clientX, y: e.clientY };
    showStick(e.clientX, e.clientY, true);
    moveKnob(0, 0);
  };

  const onStickMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== stickId.current) return;
    let dx = e.clientX - stickOrigin.current.x;
    let dy = e.clientY - stickOrigin.current.y;
    const len = Math.hypot(dx, dy);
    if (len > STICK_RADIUS) {
      dx = (dx / len) * STICK_RADIUS;
      dy = (dy / len) * STICK_RADIUS;
    }
    moveKnob(dx, dy);
    touchState.moveX = dx / STICK_RADIUS;
    touchState.moveY = -dy / STICK_RADIUS;
  };

  const onStickUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== stickId.current) return;
    stickId.current = null;
    touchState.moveX = touchState.moveY = 0;
    showStick(stickOrigin.current.x, stickOrigin.current.y, false);
  };

  const onLookDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (lookId.current !== null) return;
    lookId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    lookLast.current = { x: e.clientX, y: e.clientY };
  };

  const onLookMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== lookId.current) return;
    touchState.lookDX += e.clientX - lookLast.current.x;
    touchState.lookDY += e.clientY - lookLast.current.y;
    lookLast.current = { x: e.clientX, y: e.clientY };
  };

  const onLookUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId === lookId.current) lookId.current = null;
  };

  const press = (key: 'jump' | 'interact') => (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    touchState[key] = true;
  };

  if (mode !== 'explore') return null;

  return (
    <div className="fixed inset-0 z-10 select-none touch-none">
      <div
        className="absolute inset-y-0 left-0 w-1/2"
        onPointerDown={onStickDown}
        onPointerMove={onStickMove}
        onPointerUp={onStickUp}
        onPointerCancel={onStickUp}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/2"
        onPointerDown={onLookDown}
        onPointerMove={onLookMove}
        onPointerUp={onLookUp}
        onPointerCancel={onLookUp}
      />

      {/* Floating joystick (positioned where the thumb lands). */}
      <div
        ref={baseRef}
        className="pointer-events-none absolute left-0 top-0 rounded-full border-2 border-white/70 bg-white/25 opacity-0 transition-opacity duration-150"
        style={{ width: STICK_RADIUS * 2, height: STICK_RADIUS * 2 }}
      >
        <div
          ref={knobRef}
          className="absolute rounded-full bg-white/85 shadow-md"
          style={{ width: 52, height: 52, left: STICK_RADIUS - 26, top: STICK_RADIUS - 26 }}
        />
      </div>

      <div
        className="absolute flex flex-col items-center gap-3"
        style={{ right: 'max(16px, env(safe-area-inset-right))', bottom: 'max(24px, env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          aria-label="Interact"
          onPointerDown={press('interact')}
          className={`h-16 w-16 rounded-full border-2 text-lg font-bold text-white shadow-lg transition-all active:scale-95 ${
            nearby ? 'scale-110 animate-[interact-pulse_1.2s_ease-in-out_infinite] border-white bg-violet-500' : 'border-white/80 bg-violet-400/60'
          }`}
        >
          E
        </button>
        <button
          type="button"
          aria-label="Jump"
          onPointerDown={press('jump')}
          className="h-20 w-20 rounded-full border-2 border-white/80 bg-sky-400/60 text-sm font-bold text-white shadow-lg active:scale-95"
        >
          JUMP
        </button>
      </div>
    </div>
  );
}
