'use client';

import type { ReactNode } from 'react';
import { CloseButton, INK } from './kit';

/**
 * Full-screen card used by the menus (onboarding, welcome back, settings, finale, certificate).
 * Full height on phones (scrolls inside), a centred card from `sm` up.
 */
export default function Sheet({
  label,
  title,
  icon,
  tint = '#ddd2fa',
  onClose,
  width = 'max-w-lg',
  children,
  footer,
}: {
  label: string;
  title?: ReactNode;
  icon?: ReactNode;
  tint?: string;
  onClose?: () => void;
  width?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-stretch justify-center bg-[#3d3452]/40 backdrop-blur-[3px] sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`flex h-full w-full ${width} min-w-0 flex-col overflow-hidden bg-[#fffdf8] sm:h-auto sm:max-h-[92vh] sm:rounded-3xl sm:border-4`}
        style={{ borderColor: INK, color: INK, boxShadow: `0 8px 0 ${INK}` }}
      >
        {(title || onClose) && (
          <header
            className="flex items-center gap-3 border-b-4 px-4 pt-[max(10px,env(safe-area-inset-top))] pb-2.5"
            style={{ background: tint, borderColor: INK }}
          >
            {icon}
            <h2 className="min-w-0 flex-1 text-xl leading-tight font-extrabold">{title}</h2>
            {onClose && <CloseButton onClick={onClose} />}
          </header>
        )}
        <div
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-4"
          style={{ touchAction: 'pan-y' }}
        >
          {children}
        </div>
        {footer && (
          <footer className="flex flex-wrap gap-2 border-t-4 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]" style={{ borderColor: INK }}>
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

/** Chunky pill button matching the HUD / mini-game style. */
export function PillButton({
  onClick,
  children,
  color = 'white',
  className = '',
  disabled = false,
  type = 'button',
}: {
  onClick?: () => void;
  children: ReactNode;
  color?: string;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`min-h-11 rounded-full border-[3px] px-4 text-sm font-extrabold active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
      style={{ borderColor: INK, background: color, color: INK, boxShadow: `0 3px 0 ${INK}` }}
    >
      {children}
    </button>
  );
}
