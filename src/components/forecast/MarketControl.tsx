import { useCallback, useEffect, useRef, useState } from 'react';
import type { ControlCopy, PlayMarket } from './types';

interface Props {
  market: PlayMarket;
  copy: ControlCopy;
}

type Side = 'yes' | 'no' | null;

/** Distance (as a fraction of the track) the knob must travel to commit. */
const LOCK_THRESHOLD = 0.62;
const KNOB = 46;

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

/**
 * The interactive market control from the play section: pick a side, dial the
 * stake, then slide (or click) to lock. Mirrors the app's thumb gestures — the
 * puck slides to the chosen paddle and locking swaps the panel for the
 * confirmation state. The dial and the lock are always draggable; only the
 * payoff (and the commit itself) needs a side, and trying to lock without one
 * nudges the paddles rather than doing nothing.
 */
export default function MarketControl({ market, copy }: Props) {
  const [side, setSide] = useState<Side>(null);
  const [amount, setAmount] = useState(250);
  const [locked, setLocked] = useState(false);

  const trackRef = useRef<HTMLButtonElement | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  // Set as soon as a drag actually moves, so the click that follows pointerup
  // doesn't also commit (a short drag back must leave the call unlocked).
  const draggedRef = useRef(false);
  // Review: the lock read as broken because it silently did nothing until a
  // side was picked. It now nudges the paddles instead of going dead.
  const [nudge, setNudge] = useState(false);

  useEffect(() => {
    if (!nudge) return;
    const id = window.setTimeout(() => setNudge(false), 450);
    return () => window.clearTimeout(id);
  }, [nudge]);

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

  // Pointer drag on the slide-to-lock knob. Committing past the threshold locks
  // the call; releasing short of it springs the knob back to the start.
  useEffect(() => {
    if (drag === null || locked) return;

    const track = trackRef.current;
    if (!track) return;

    const travel = track.offsetWidth - KNOB - 10;

    const move = (e: PointerEvent) => {
      draggedRef.current = true;
      const rect = track.getBoundingClientRect();
      const x = Math.min(Math.max(e.clientX - rect.left - KNOB / 2, 0), travel);
      setDrag(x / travel);
    };

    const end = () => {
      setDrag((d) => {
        if (d !== null && d >= LOCK_THRESHOLD) commit();
        else if (draggedRef.current && !side) setNudge(true);
        return null;
      });
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  }, [drag, side, locked, commit]);

  const reset = () => {
    setSide(null);
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

      <div className={`fx-sides${nudge ? ' is-nudged' : ''}`}>
        <button
          type="button"
          className={`fx-side fx-side--no${side === 'no' ? ' is-active' : ''}`}
          aria-pressed={side === 'no'}
          onClick={() => setSide('no')}
        >
          <span className="fx-side__label">NO</span>
          <span className="fx-side__pct">{market.no}%</span>
        </button>
        <button
          type="button"
          className={`fx-side fx-side--yes${side === 'yes' ? ' is-active' : ''}`}
          aria-pressed={side === 'yes'}
          onClick={() => setSide('yes')}
        >
          <span className="fx-side__label">YES</span>
          <span className="fx-side__pct">{market.yes}%</span>
        </button>
        <span className={`fx-puck${side ? ` is-${side}` : ''}`} aria-hidden="true">
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
          className={`fx-lock${drag !== null ? ' is-dragging' : ''}`}
          onClick={() => {
            if (draggedRef.current) {
              draggedRef.current = false;
              return;
            }
            commit();
          }}
        >
          {(side ? copy.lockReady : copy.lockIdle).toUpperCase()}
          <span
            className="fx-lock__knob"
            style={{ transform: `translateX(${knobX}px)` }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              draggedRef.current = false;
              setDrag(0);
            }}
          >
            <Check />
          </span>
        </button>
      </div>
    </div>
  );
}
