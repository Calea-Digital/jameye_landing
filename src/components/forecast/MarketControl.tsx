import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import type { ControlCopy, PlayMarket } from './types';

interface Props {
  market: PlayMarket;
  copy: ControlCopy;
}

type Side = 'yes' | 'no' | null;

/** Distance (as a fraction of the track) the knob must travel to commit. */
const LOCK_THRESHOLD = 0.62;
const KNOB = 46;
/** Undecided band around the middle of the side picker (fraction of the track). */
const SIDE_DEADZONE = 0.12;
/** Pointer travel (px) below which a press counts as a tap, not a drag. */
const TAP_SLOP = 6;

const Check = ({ size = 20, width = 2.2 }: { size?: number; width?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const Thumb = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 13V5a2 2 0 0 1 4 0v6M12 11V4a2 2 0 0 1 4 0v7M16 11V6a2 2 0 0 1 4 0v8a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3l-3-5a2 2 0 0 1 3-2l2 3" />
  </svg>
);

interface SlideHandlers {
  onStart: (clientX: number, target: EventTarget | null) => void;
  onMove: (clientX: number) => void;
  /** `moved` is false for a tap; `target` is where the press began. */
  onEnd: (clientX: number, moved: boolean, target: EventTarget | null) => void;
  onCancel: () => void;
}

/**
 * One horizontal drag gesture on an element, for both fingers and mice.
 *
 * Fingers use raw touch events registered non-passively on the element itself,
 * so the move can block the page scroll and the browser never cancels the
 * stream mid-swipe (iOS Safari starves `pointermove` for touch pointers when
 * the listeners hang off `window` and are attached after a React re-render —
 * the swipe then degrades into the click the browser synthesises on release,
 * which is why the picker and the lock read as plain buttons on a phone).
 * The mouse path uses pointer capture so the drag survives leaving the track.
 * Touch pointers are ignored on the pointer path so nothing runs twice.
 *
 * Listeners are attached once per `enabled` flip and read the latest handlers
 * through a ref, so they never close over stale state.
 */
function useSlideGesture(ref: RefObject<HTMLElement | null>, enabled: boolean, handlers: SlideHandlers) {
  const latest = useRef(handlers);
  latest.current = handlers;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let pointerId: number | null = null;
    let touchId: number | null = null;
    let startX = 0;
    let moved = false;
    let startTarget: EventTarget | null = null;

    const start = (x: number, target: EventTarget | null) => {
      startX = x;
      moved = false;
      startTarget = target;
      latest.current.onStart(x, target);
    };
    const move = (x: number) => {
      if (!moved && Math.abs(x - startX) > TAP_SLOP) moved = true;
      latest.current.onMove(x);
    };
    const end = (x: number) => latest.current.onEnd(x, moved, startTarget);
    const cancel = () => latest.current.onCancel();

    // Mouse / pen ---------------------------------------------------------
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (e.button !== 0 || pointerId !== null || touchId !== null) return;
      e.preventDefault();
      pointerId = e.pointerId;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* capture is best-effort */
      }
      start(e.clientX, e.target);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (pointerId === null || e.pointerId !== pointerId) return;
      move(e.clientX);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (pointerId === null || e.pointerId !== pointerId) return;
      pointerId = null;
      end(e.clientX);
    };
    const onPointerCancel = (e: PointerEvent) => {
      if (pointerId === null || e.pointerId !== pointerId) return;
      pointerId = null;
      cancel();
    };

    // Fingers ----------------------------------------------------------------
    const findTouch = (list: TouchList) => {
      for (let i = 0; i < list.length; i++) if (list[i].identifier === touchId) return list[i];
      return null;
    };
    const onTouchStart = (e: TouchEvent) => {
      if (touchId !== null || pointerId !== null) return;
      const t = e.changedTouches[0];
      if (!t) return;
      // Owning the gesture: no scroll, no synthesised click on the paddles or
      // the lock afterwards, no iOS callout on a slow press.
      e.preventDefault();
      touchId = t.identifier;
      start(t.clientX, e.target);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = findTouch(e.changedTouches);
      if (!t) return;
      e.preventDefault();
      move(t.clientX);
    };
    const onTouchEnd = (e: TouchEvent) => {
      const t = findTouch(e.changedTouches);
      if (!t) return;
      e.preventDefault();
      touchId = null;
      end(t.clientX);
    };
    const onTouchCancel = (e: TouchEvent) => {
      const t = findTouch(e.changedTouches);
      if (!t) return;
      touchId = null;
      cancel();
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerCancel);
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: false });
    el.addEventListener('touchcancel', onTouchCancel);
    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerCancel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [ref, enabled]);
}

/**
 * The interactive market control from the play section: slide the puck toward
 * NO or YES, dial the stake, then slide to lock. Mirrors the app's thumb
 * gestures — the side picker is one track with the puck resting in the middle
 * until you drag (or tap) it toward a side, and locking swaps the panel for the
 * confirmation state. The dial and the lock are always draggable; only the
 * payoff (and the commit itself) needs a side, and trying to lock without one
 * nudges the track rather than doing nothing. The lock is a slider, not a
 * button: a tap only hints at the gesture (keyboard users commit with Enter).
 */
export default function MarketControl({ market, copy }: Props) {
  const [side, setSide] = useState<Side>(null);
  const [amount, setAmount] = useState(250);
  const [locked, setLocked] = useState(false);

  // Side picker: one track, puck at 0 (NO) … 0.5 (undecided) … 1 (YES). While
  // dragging the puck follows the pointer; on release it snaps to the nearer
  // end, or back to the middle if it never left the dead zone.
  const sidesRef = useRef<HTMLDivElement | null>(null);
  const puckRef = useRef<HTMLSpanElement | null>(null);
  const [pos, setPos] = useState(0.5);
  const [sideDrag, setSideDrag] = useState(false);

  /** Where along the track (0…1) a pointer is, measured from the puck's centre. */
  const ratioAt = useCallback((clientX: number) => {
    const track = sidesRef.current;
    if (!track) return 0.5;
    // Puck diameter comes from CSS (--fx-puck) so the breakpoints own it.
    const puck = puckRef.current?.offsetWidth ?? 56;
    const rect = track.getBoundingClientRect();
    return Math.min(Math.max((clientX - rect.left - puck / 2) / (rect.width - puck), 0), 1);
  }, []);

  const settle = useCallback((p: number) => {
    if (p < 0.5 - SIDE_DEADZONE) {
      setPos(0);
      setSide('no');
    } else if (p > 0.5 + SIDE_DEADZONE) {
      setPos(1);
      setSide('yes');
    } else {
      setPos(0.5);
      setSide(null);
    }
  }, []);

  const pick = useCallback((next: Exclude<Side, null>) => {
    setPos(next === 'no' ? 0 : 1);
    setSide(next);
  }, []);

  // Starting a drag anywhere on the track (not just on the puck) matters on a
  // phone, where a thumb swipe rarely lands on a 48px puck. Pressing the track
  // brings the puck to the finger; pressing the puck itself just grabs it. A
  // tap (no travel) on a paddle picks that side outright.
  useSlideGesture(sidesRef, !locked, {
    onStart: (x, target) => {
      if (!puckRef.current?.contains(target as Node)) setPos(ratioAt(x));
      setSideDrag(true);
    },
    onMove: (x) => setPos(ratioAt(x)),
    onEnd: (x, moved, target) => {
      setSideDrag(false);
      const paddle = (target as Element | null)?.closest?.('.fx-side');
      if (!moved && paddle) pick(paddle.classList.contains('fx-side--no') ? 'no' : 'yes');
      else settle(ratioAt(x));
    },
    // The browser took the gesture. Fall back to the last settled state rather
    // than reading a stray coordinate as a call.
    onCancel: () => {
      setSideDrag(false);
      setPos(side === 'no' ? 0 : side === 'yes' ? 1 : 0.5);
    },
  });

  const trackRef = useRef<HTMLButtonElement | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  // Review: the lock read as broken because it silently did nothing until a
  // side was picked. It now nudges the paddles instead of going dead.
  const [nudge, setNudge] = useState(false);
  // A tap on the lock (instead of a slide) wiggles the knob to show the gesture.
  const [hint, setHint] = useState(false);

  useEffect(() => {
    if (!nudge) return;
    const id = window.setTimeout(() => setNudge(false), 450);
    return () => window.clearTimeout(id);
  }, [nudge]);

  useEffect(() => {
    if (!hint) return;
    const id = window.setTimeout(() => setHint(false), 520);
    return () => window.clearTimeout(id);
  }, [hint]);

  const odds = side === 'no' ? market.no : market.yes;
  const payoff = side ? Math.round(amount * (100 / odds - 1)) : 0;

  const commit = useCallback(() => {
    if (!side) {
      setNudge(true);
      return;
    }
    setLocked(true);
    setDrag(null);
  }, [side]);

  // Slide-to-lock. The knob follows the finger relative to where the press
  // began (so grabbing it mid-track doesn't teleport it); committing past the
  // threshold locks the call, releasing short of it springs the knob back.
  const lockStartX = useRef(0);
  const lockTravel = useRef(1);
  const lockFraction = useRef(0);
  useSlideGesture(trackRef, !locked, {
    onStart: (x) => {
      const track = trackRef.current;
      lockStartX.current = x;
      lockTravel.current = Math.max(1, (track?.offsetWidth ?? 0) - KNOB - 10);
      lockFraction.current = 0;
      setDrag(0);
    },
    onMove: (x) => {
      const f = Math.min(Math.max((x - lockStartX.current) / lockTravel.current, 0), 1);
      lockFraction.current = f;
      setDrag(f);
    },
    onEnd: (_x, moved) => {
      const f = lockFraction.current;
      setDrag(null);
      if (moved && f >= LOCK_THRESHOLD) commit();
      else if (!side) setNudge(true);
      else if (!moved) setHint(true);
    },
    // Gesture taken over by the browser — spring back, never commit.
    onCancel: () => setDrag(null),
  });

  const reset = () => {
    setSide(null);
    setPos(0.5);
    setAmount(250);
    setLocked(false);
    setDrag(null);
  };

  if (locked) {
    return (
      <div className="fx-ctl">
        <div className="fx-locked">
          <span className="fx-locked__seal">
            <Check size={34} width={2.4} />
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="fx-locked__title">
              {copy.lockedTitle
                .replace('{amount}', String(amount))
                .replace('{side}', side === 'no' ? 'NO' : 'YES')}
            </span>
            <span className="fx-locked__sub">{copy.lockedSub.replace('{payoff}', String(payoff))}</span>
          </div>
          <div className="fx-locked__actions">
            <button type="button" className="fx-locked__keep" data-open-waitlist>
              {copy.keep.toUpperCase()}
            </button>
            <button type="button" className="fx-locked__again" onClick={reset}>
              {copy.again}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const knobX = drag !== null && trackRef.current
    ? drag * (trackRef.current.offsetWidth - KNOB - 10)
    : 0;

  return (
    <div className="fx-ctl">
      <div className="fx-ctl__meta">
        <span style={{ letterSpacing: '0.2em', fontSize: 9.5 }}>{copy.yourCall.toUpperCase()}</span>
        <span>
          {copy.balanceLabel} <b>{market.balance.toLocaleString('en-US')}</b> {copy.coins}
        </span>
      </div>
      <div className="fx-ctl__meta">
        <span className="fx-ctl__step">{(side ? copy.step2 : copy.step1).toUpperCase()}</span>
        <span>{market.forecasters}</span>
      </div>

      <div
        ref={sidesRef}
        className={`fx-sides${nudge ? ' is-nudged' : ''}${sideDrag ? ' is-dragging' : ''}${side ? ` is-${side}` : ''}`}
      >
        <span className="fx-sides__track" aria-hidden="true">
          <span className="fx-sides__fill fx-sides__fill--no" style={{ width: `${Math.max(0, 0.5 - pos) * 100}%` }} />
          <span className="fx-sides__fill fx-sides__fill--yes" style={{ width: `${Math.max(0, pos - 0.5) * 100}%` }} />
        </span>

        {/* Pointer taps are handled by the gesture (which swallows the
            synthesised click); these onClicks only serve keyboard activation,
            where the click carries detail 0. */}
        <button
          type="button"
          className={`fx-side fx-side--no${side === 'no' ? ' is-active' : ''}`}
          aria-pressed={side === 'no'}
          onClick={(e) => {
            if (e.detail === 0) pick('no');
          }}
        >
          <span className="fx-side__label">NO</span>
          <span className="fx-side__pct">{market.no}%</span>
        </button>
        <button
          type="button"
          className={`fx-side fx-side--yes${side === 'yes' ? ' is-active' : ''}`}
          aria-pressed={side === 'yes'}
          onClick={(e) => {
            if (e.detail === 0) pick('yes');
          }}
        >
          <span className="fx-side__label">YES</span>
          <span className="fx-side__pct">{market.yes}%</span>
        </button>

        <span
          ref={puckRef}
          className="fx-puck"
          role="slider"
          tabIndex={0}
          aria-label={copy.step1}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos * 100)}
          aria-valuetext={side === 'no' ? 'NO' : side === 'yes' ? 'YES' : 'Undecided'}
          style={{ '--fx-pos': pos } as CSSProperties}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') pick('no');
            else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') pick('yes');
            else if (e.key === 'Home' || e.key === 'Escape') {
              setPos(0.5);
              setSide(null);
            } else return;
            e.preventDefault();
          }}
        >
          <Thumb />
        </span>
      </div>

      <span className="fx-hint">{copy.hint.toUpperCase()}</span>

      <div className={`fx-stake${side ? ' is-live' : ''}`}>
        <div className="fx-stake__row">
          <span className="fx-stake__amount">
            <span className="fx-stake__value">{amount}</span>
            <span className="fx-stake__unit">{copy.coins.toUpperCase()}</span>
          </span>
          <span className="fx-stake__payoff">
            {copy.payoffLabel} <b>+{payoff}</b>
          </span>
        </div>

        <input
          className="fx-range"
          type="range"
          min={50}
          max={market.balance}
          step={10}
          value={amount}
          aria-label={copy.step2}
          onChange={(e) => setAmount(Number(e.currentTarget.value))}
        />

        <div className="fx-quick">
          {copy.quick.map((label) => {
            const value = label === 'ALL' ? market.balance : Number(label);
            return (
              <button
                key={label}
                type="button"
                className={amount === value ? 'is-active' : undefined}
                onClick={() => setAmount(value)}
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          ref={trackRef}
          type="button"
          className={`fx-lock${drag !== null ? ' is-dragging' : ''}${hint ? ' is-hinting' : ''}`}
          aria-label={(side ? copy.lockReady : copy.lockIdle)}
          onKeyDown={(e) => {
            // Keyboard users can't slide; Enter / Space commit directly.
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            commit();
          }}
          onClick={(e) => {
            // Pointer taps are consumed by the gesture; anything else reaching
            // here is synthetic (assistive tech), so treat it as a commit.
            if (e.detail === 0) commit();
          }}
        >
          {(side ? copy.lockReady : copy.lockIdle).toUpperCase()}
          <span className="fx-lock__knob" style={{ transform: `translateX(${knobX}px)` }}>
            <Check />
          </span>
        </button>
      </div>
    </div>
  );
}
