/**
 * InfoTip — the app-wide clarifying tooltip.
 *
 * Usage: <InfoTip content="What it is and how it's computed.">Edge Rating</InfoTip>
 * Renders the wrapped label plus a small ⓘ affordance; the whole element is
 * the hover target. Without children it renders the ⓘ glyph alone.
 *
 * Behaviour (per the clarity spec):
 *  - Desktop: opens on mouseover (~150ms delay) and on keyboard focus
 *    (instant); closes instantly on leave/blur.
 *  - Touch: tap toggles, tap anywhere else dismisses (hover doesn't exist
 *    on touch — never hide essential info behind hover-only).
 *  - Accessibility: trigger ↔ panel linked with aria-describedby, trigger
 *    is keyboard-focusable, Esc closes.
 *  - Positioning: portal to <body>, auto-flips above/below and clamps
 *    horizontally so it never clips the viewport.
 */

import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const OPEN_DELAY_MS = 150;
const VIEWPORT_PAD = 8;
const GAP = 8;

interface InfoTipProps {
  /** One or two short sentences. What it is + how it's computed / what it does. */
  content: React.ReactNode;
  /** The visible term the tip clarifies. Omit to render the ⓘ glyph alone. */
  children?: React.ReactNode;
  className?: string;
  /** Hide the ⓘ glyph (when the label itself already signals "hover me"). */
  hideIcon?: boolean;
}

export default function InfoTip({ content, children, className = '', hideIcon = false }: InfoTipProps) {
  const id = useId();
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const clearTimer = () => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
  };

  const show = () => {
    clearTimer();
    setOpen(true);
  };
  const hide = () => {
    clearTimer();
    setOpen(false);
    setPos(null);
  };
  const showDelayed = () => {
    clearTimer();
    openTimer.current = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
  };

  // Place after the panel has rendered (we need its size to flip/clamp).
  useLayoutEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;
    const t = trigger.getBoundingClientRect();
    const p = panel.getBoundingClientRect();

    // Prefer above; flip below when there's no headroom.
    let top = t.top - p.height - GAP;
    if (top < VIEWPORT_PAD) top = t.bottom + GAP;
    // If flipping below would also clip, pin to whichever side has room.
    if (top + p.height > window.innerHeight - VIEWPORT_PAD) {
      top = Math.max(VIEWPORT_PAD, window.innerHeight - VIEWPORT_PAD - p.height);
    }

    let left = t.left + t.width / 2 - p.width / 2;
    left = Math.min(Math.max(left, VIEWPORT_PAD), window.innerWidth - VIEWPORT_PAD - p.width);

    setPos({ top, left });
  }, [open]);

  // Esc closes; tap/click outside dismisses (touch); scroll closes so the
  // panel never drifts away from its trigger.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      hide();
    };
    const onScroll = () => hide();
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('scroll', onScroll, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => clearTimer, []);

  return (
    <>
      <span
        ref={triggerRef}
        tabIndex={0}
        aria-describedby={open ? id : undefined}
        onMouseEnter={showDelayed}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={e => {
          // Tap-to-toggle for touch; don't trigger surrounding card actions.
          e.stopPropagation();
          open ? hide() : show();
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open ? hide() : show();
          }
        }}
        className={`group inline-flex cursor-help items-center gap-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${className}`}
      >
        {children}
        {!hideIcon && (
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="h-[1.1em] w-[1.1em] shrink-0 opacity-90 transition-opacity group-hover:opacity-100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <circle cx="8" cy="8" r="6.6" />
            <path d="M8 7.2v3.6" strokeLinecap="round" />
            <circle cx="8" cy="4.9" r="0.85" fill="currentColor" stroke="none" />
          </svg>
        )}
      </span>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={id}
            role="tooltip"
            style={{
              position: 'fixed',
              top: pos?.top ?? -9999,
              left: pos?.left ?? -9999,
              visibility: pos ? 'visible' : 'hidden',
              backgroundColor: '#15121F',
              border: '1px solid #241F33',
              color: '#ECEAF2',
              boxShadow: '0 12px 36px -10px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.4)',
            }}
            className="z-[9999] max-w-[280px] rounded-lg px-3 py-2 text-left text-[12px] font-normal normal-case leading-[1.5] tracking-normal"
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}

/** Inline numeric value inside tooltip copy — DM Mono per the style spec. */
export function TipValue({ children }: { children: React.ReactNode }) {
  return <span className="[font-family:var(--j-font-mono)] text-white">{children}</span>;
}
