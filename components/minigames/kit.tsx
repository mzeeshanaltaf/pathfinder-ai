'use client';

import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { INK } from '@/components/ui/kit';

/** Chunky cartoon button used by every engine. */
export function GameButton({
  children,
  onClick,
  disabled = false,
  color = '#ffd66e',
  className = '',
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  color?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-h-12 rounded-full border-[3px] px-5 text-base font-extrabold whitespace-nowrap transition-transform active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      style={{ borderColor: INK, background: color, color: INK, boxShadow: `0 4px 0 ${INK}` }}
    >
      {children}
    </button>
  );
}

/** Green (correct) / red (wrong) / neutral explanation card. */
export function Feedback({ tone, title, children }: { tone: 'good' | 'bad' | 'info'; title: ReactNode; children?: ReactNode }) {
  const bg = tone === 'good' ? '#d6f5df' : tone === 'bad' ? '#ffe1e1' : '#fff4d6';
  const fg = tone === 'good' ? '#23824a' : tone === 'bad' ? '#c0392b' : INK;
  return (
    <div
      role="status"
      className="w-full rounded-2xl border-[3px] px-3 py-2 text-sm animate-[toast-in_200ms_ease-out]"
      style={{ borderColor: INK, background: bg }}
    >
      <div className="font-extrabold" style={{ color: fg }}>
        {title}
      </div>
      {children && <div className="mt-0.5 font-semibold">{children}</div>}
    </div>
  );
}

/** Row of dots: done (green / red), current, upcoming. */
export function ProgressDots({ results, total, current }: { results: boolean[]; total: number; current: number }) {
  return (
    <div className="flex flex-wrap justify-center gap-1" aria-label={`Card ${Math.min(current + 1, total)} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="h-2.5 w-2.5 rounded-full border-2 transition-colors"
          style={{
            borderColor: INK,
            background: i < results.length ? (results[i] ? '#45b06a' : '#e5584f') : i === current ? INK : 'white',
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pointer-event drag & drop (mouse + touch; no HTML5 DnD).
// Drop targets are any element with `data-drop="<id>"`.

const DRAG_THRESHOLD = 6;

interface DragSession<T> {
  pointerId: number;
  x0: number;
  y0: number;
  offX: number;
  offY: number;
  item: T;
  dragging: boolean;
  over: string | null;
}

function dropTargetAt(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y);
  return (el?.closest('[data-drop]') as HTMLElement | null)?.dataset.drop ?? null;
}

/**
 * Tap-or-drag for cards. A press that moves less than a few pixels is a tap (`onTap`);
 * otherwise a ghost follows the pointer and `onDrop(item, targetId | null)` fires on release.
 * Keyboard activation (Enter / Space) also counts as a tap.
 */
export function useDragDrop<T>({ onTap, onDrop }: { onTap: (item: T) => void; onDrop: (item: T, target: string | null) => void }) {
  const session = useRef<DragSession<T> | null>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const ghostWidth = useRef(0);
  const [drag, setDrag] = useState<{ item: T; label: ReactNode; x: number; y: number; w: number } | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const end = () => {
    session.current = null;
    setDrag(null);
    setOver(null);
  };

  const bind = (item: T, label: ReactNode, enabled = true) => {
    if (!enabled) return {};
    return {
      onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
        if ((e.pointerType === 'mouse' && e.button !== 0) || session.current) return;
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.setPointerCapture(e.pointerId);
        session.current = {
          pointerId: e.pointerId,
          x0: e.clientX,
          y0: e.clientY,
          offX: e.clientX - r.left,
          offY: e.clientY - r.top,
          item,
          dragging: false,
          over: null,
        };
        // Width is captured now so the ghost matches the card.
        ghostWidth.current = r.width;
      },
      onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
        const s = session.current;
        if (!s || s.pointerId !== e.pointerId) return;
        const x = e.clientX - s.offX;
        const y = e.clientY - s.offY;
        if (!s.dragging) {
          if (Math.hypot(e.clientX - s.x0, e.clientY - s.y0) < DRAG_THRESHOLD) return;
          s.dragging = true;
          setDrag({ item, label, x, y, w: ghostWidth.current });
        } else if (ghostRef.current) {
          ghostRef.current.style.transform = `translate(${x}px, ${y}px) rotate(-3deg)`;
        }
        const target = dropTargetAt(e.clientX, e.clientY);
        if (target !== s.over) {
          s.over = target;
          setOver(target);
        }
      },
      onPointerUp: (e: ReactPointerEvent<HTMLElement>) => {
        const s = session.current;
        if (!s || s.pointerId !== e.pointerId) return;
        if (s.dragging) onDrop(s.item, dropTargetAt(e.clientX, e.clientY));
        else onTap(s.item);
        end();
      },
      onPointerCancel: end,
      onClick: (e: React.MouseEvent) => {
        // detail === 0 → keyboard activation (pointer taps are handled on pointerup).
        if (e.detail === 0) onTap(item);
      },
      style: { touchAction: 'none' } as CSSProperties,
    };
  };

  const ghost = drag ? (
    <div
      ref={ghostRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-70 opacity-95 drop-shadow-xl"
      style={{ width: drag.w, transform: `translate(${drag.x}px, ${drag.y}px) rotate(-3deg)` }}
    >
      {drag.label}
    </div>
  ) : null;

  return { bind, ghost, over, dragging: drag ? drag.item : null };
}
