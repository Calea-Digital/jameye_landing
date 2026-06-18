/**
 * EdgeScoreBossAvatar — final-chapter villain on the Loops hub.
 *
 * Visual contract: this avatar must read as a member of the SAME cast
 * as `AvatarFighter` — just wearing the antagonist costume. The shared
 * cast DNA:
 *
 *   • viewBox 120×140 chibi-shounen geometry
 *   • 2.4–2.6px ink outlines on every shape
 *   • Hair-back crown silhouette `M30 48 C30 22 ...`
 *   • Face ellipse cx=60 cy=48 rx=22 ry=24
 *   • Same eye sockets as the cast — but the BOSS face deliberately
 *     diverges: half-lidded slits instead of wide ovals.
 *   • Wide-stance body: legs at cx≈42 / cx≈84 with belt at y=98
 *
 * What makes this *the boss*: purple/indigo hair, crimson eye sclera,
 * smug asymmetric brows, half-lidded slit eyes, a cocky toothy smirk,
 * a dark suit with V-lapels + tie + pocket square, a gold (brand
 * magenta) forelock streak, and horn-silhouette accents.
 *
 * Cursor follow: head tilts, pupils slide. Implemented with refs + a
 * single `requestAnimationFrame` loop so React doesn't re-render on
 * mousemove. Honors `prefers-reduced-motion: reduce`.
 */

import React, { useEffect, useRef } from 'react';
import { ensureFighterStyles } from './fighterStyles';

/* Boss avatar palette:
 *  - INK stays a deep ink for the chibi outline contract.
 *  - TEETH stays bone-cream so the toothy grin pops on any bg.
 *  - GOLD is repurposed as brand magenta. */
const INK = '#0a0716';
const TEETH = 'rgba(255,255,255,0.04)';
const GOLD = '#d83bff';

interface Props {
  /** Optional className for sizing / positioning the wrapper div. */
  className?: string;
  style?: React.CSSProperties;
  /** No-op kept for API compatibility with legacy callers. */
  silent?: boolean;
}

const SHARED_KEYFRAMES = `
@keyframes homeAvatarBob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-3px); }
}
@keyframes homeAvatarSpark {
  0%, 100% { opacity: 0.45; transform: scale(0.85) rotate(0deg); }
  50%      { opacity: 1;    transform: scale(1.1) rotate(12deg); }
}
`;

const BOSS_KEYFRAMES = `
@keyframes edgeBossCertFloat {
  0%, 100% { transform: translate(0, 0) rotate(-6deg); }
  50%      { transform: translate(0, -3px) rotate(-2deg); }
}
@keyframes edgeBossCertSpark {
  0%, 100% { opacity: 0.35; transform: scale(0.85) rotate(0deg); }
  50%      { opacity: 1;    transform: scale(1.2) rotate(20deg); }
}
`;

let _sharedInjected = false;
let _bossInjected = false;
function ensureKeyframes() {
  if (typeof document === 'undefined') return;
  if (!_sharedInjected) {
    if (!document.querySelector('style[data-home-avatars]')) {
      const style = document.createElement('style');
      style.setAttribute('data-home-avatars', 'true');
      style.textContent = SHARED_KEYFRAMES;
      document.head.appendChild(style);
    }
    _sharedInjected = true;
  }
  if (!_bossInjected) {
    if (!document.querySelector('style[data-edge-boss]')) {
      const style = document.createElement('style');
      style.setAttribute('data-edge-boss', 'true');
      style.textContent = BOSS_KEYFRAMES;
      document.head.appendChild(style);
    }
    _bossInjected = true;
  }
}

/* Cursor tracker — pivot is the head center (cx=60 cy=72 in the
 * 120×140 viewBox). */
function useBossTracker() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const pupilsRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 3;
    let curX = 0;
    let curY = 0;
    let frame = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const tick = () => {
      const wrap = wrapperRef.current;
      if (wrap) {
        const r = wrap.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height * 0.32;
        const dx = mx - cx;
        const dy = my - cy;
        const dist = Math.hypot(dx, dy);
        const norm = Math.min(1, dist / 360);
        const targetX = dist > 0.001 ? (dx / dist) * norm : 0;
        const targetY = dist > 0.001 ? (dy / dist) * norm : 0;
        curX += (targetX - curX) * 0.18;
        curY += (targetY - curY) * 0.18;

        if (headRef.current) {
          const rot = curX * 6;
          const tx = curX * 2.2;
          const ty = curY * 2.2 * 0.7;
          headRef.current.setAttribute(
            'transform',
            `translate(${tx.toFixed(3)} ${ty.toFixed(3)}) rotate(${rot.toFixed(3)} 60 72)`,
          );
        }
        if (pupilsRef.current) {
          const px = curX * 2.5;
          const py = curY * 2.5 * 0.85;
          pupilsRef.current.setAttribute(
            'transform',
            `translate(${px.toFixed(3)} ${py.toFixed(3)})`,
          );
        }
      }
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return { wrapperRef, headRef, pupilsRef };
}

export default function EdgeScoreBossAvatar({ className = '', style }: Props) {
  const { wrapperRef, headRef, pupilsRef } = useBossTracker();
  useEffect(() => { ensureKeyframes(); ensureFighterStyles(); }, []);

  return (
    <div ref={wrapperRef} className={`relative ${className}`} style={style}>
      <svg
        viewBox="0 0 120 140"
        className="relative h-full w-full"
        style={{ animation: 'homeAvatarBob 1.55s ease-in-out infinite' }}
        aria-label="Edge Score boss — final chapter"
        role="img"
      >
        <defs>
          <linearGradient id="bossHair" x1="30" x2="92" y1="6" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#581c87" />
            <stop offset="0.5" stopColor="#3b0764" />
            <stop offset="1" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient id="bossHairFront" x1="32" x2="88" y1="8" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor="#e9d5ff" />
            <stop offset="0.45" stopColor="#a855f7" />
            <stop offset="1" stopColor="#581c87" />
          </linearGradient>
          <linearGradient id="bossFace" x1="38" x2="82" y1="22" y2="74" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fde7c2" />
            <stop offset="0.55" stopColor="#fbbf77" />
            <stop offset="1" stopColor="#c2410c" />
          </linearGradient>
          <linearGradient id="bossEye" x1="46" x2="74" y1="42" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#020617" />
            <stop offset="0.45" stopColor="#7e3bff" />
            <stop offset="1" stopColor="#d83bff" />
          </linearGradient>
          <linearGradient id="bossSuit" x1="32" x2="88" y1="74" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4c1d95" />
            <stop offset="0.55" stopColor="#312e81" />
            <stop offset="1" stopColor="#0f0f1f" />
          </linearGradient>
          <linearGradient id="bossCert" x1="0" x2="36" y1="0" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f0d8ff" />
            <stop offset="1" stopColor="#d83bff" />
          </linearGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="60" cy="134" rx="34" ry="4" fill={INK} opacity="0.25" />

        {/* Speed lines + impact spark */}
        <path d="M10 60 L24 60" stroke={INK} strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
        <path d="M6 76 L22 76" stroke={INK} strokeWidth="2.2" strokeLinecap="round" opacity="0.4" />
        <path d="M10 92 L22 92" stroke={INK} strokeWidth="2.2" strokeLinecap="round" opacity="0.3" />
        <path
          d="M104 60 l1.4 -4 1.4 4 4 1.4 -4 1.4 -1.4 4 -1.4 -4 -4 -1.4 z"
          fill={GOLD}
          style={{ animation: 'homeAvatarSpark 1.5s ease-in-out infinite', transformOrigin: '105.4px 61.4px' }}
        />

        {/* Back leg */}
        <path d="M40 102 L34 130 L48 130 L52 106 Z" fill={INK} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        <ellipse cx="41" cy="131" rx="10" ry="3.2" fill="#0a1330" stroke={INK} strokeWidth="2" />

        {/* Front leg */}
        <path
          d="M64 106 Q72 118 78 130 L92 130 L88 132.5 L74 132.5 Q68 124 60 110 Z"
          fill={INK}
          stroke={INK}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <ellipse cx="84" cy="131" rx="11" ry="3.2" fill="#0a1330" stroke={INK} strokeWidth="2" />

        {/* Belt */}
        <rect x="40" y="98" width="42" height="7" fill={GOLD} stroke={INK} strokeWidth="2.2" />

        {/* Suit torso */}
        <path
          d="M42 74 Q34 96 40 104 L82 104 Q88 96 80 74 Q60 68 42 74 Z"
          fill="url(#bossSuit)"
          stroke={INK}
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        {/* Suit lapels */}
        <path d="M48 74 L58 96 L52 100 L42 78 Z" fill="#0f0f1f" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M74 74 L62 96 L68 100 L80 78 Z" fill="#0f0f1f" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        {/* Inner shirt panel + tie */}
        <path d="M56 76 L64 76 L62 96 L60 100 L58 96 Z" fill={TEETH} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M58 76 L62 76 L61 92 L60 96 L59 92 Z" fill={GOLD} stroke={INK} strokeWidth="1.4" />
        {/* Pocket square */}
        <path d="M76 86 L82 88 L82 94 L76 92 Z" fill="#d83bff" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />

        {/* LEFT arm — hand on hip */}
        <path
          d="M44 76 Q30 80 30 94 Q34 100 42 96 L46 86 Q48 80 46 76 Z"
          fill="url(#bossSuit)"
          stroke={INK}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <ellipse cx="34" cy="100" rx="6" ry="5" fill="url(#bossFace)" stroke={INK} strokeWidth="2.2" />
        <path d="M30 102 L38 100" stroke="#7e3bff" strokeWidth="1.4" strokeLinecap="round" />

        {/* RIGHT arm — extended forward */}
        <path
          d="M76 76 Q90 76 92 90 Q92 98 86 100 L78 96 Q76 86 76 78 Z"
          fill="url(#bossSuit)"
          stroke={INK}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <ellipse cx="92" cy="98" rx="7" ry="5.5" fill="url(#bossFace)" stroke={INK} strokeWidth="2.4" />
        <path d="M86 100 L96 96" stroke="#7e3bff" strokeWidth="1.4" strokeLinecap="round" />

        {/* Neck */}
        <rect x="55" y="70" width="10" height="6" fill="#c2410c" stroke={INK} strokeWidth="2" />

        {/* HEAD group — rotates / translates with the cursor */}
        <g ref={headRef}>
          <path
            d="M30 48C30 22 42 8 60 8C78 8 90 22 90 48V70C90 78 84 82 76 79C72 82 48 82 44 79C36 82 30 78 30 70V48Z"
            fill="url(#bossHair)"
            stroke={INK}
            strokeWidth="2.4"
          />
          <path d="M28 54C20 50 22 36 30 36M92 54C100 50 98 36 90 36" fill="#3b0764" stroke={INK} strokeWidth="2" />

          {/* Horn-silhouette accents */}
          <path
            d="M34 18 Q26 6 30 0 Q40 6 42 16 Z"
            fill="#0f0f1f"
            stroke={INK}
            strokeWidth="1.2"
            strokeLinejoin="round"
            opacity="0.55"
          />
          <path
            d="M86 18 Q94 6 90 0 Q80 6 78 16 Z"
            fill="#0f0f1f"
            stroke={INK}
            strokeWidth="1.2"
            strokeLinejoin="round"
            opacity="0.55"
          />

          {/* Face */}
          <ellipse cx="60" cy="48" rx="22" ry="24" fill="url(#bossFace)" stroke={INK} strokeWidth="2.4" />

          {/* Hair-front — slicked-back forelock */}
          <path
            d="M30 32 Q44 14 60 14 Q76 14 90 32 Q82 28 74 30 Q66 24 60 24 Q54 24 46 30 Q38 28 30 32 Z"
            fill="url(#bossHairFront)"
            stroke={INK}
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
          {/* Gold streak */}
          <path d="M58 16 Q60 12 62 16 L61 32 L59 32 Z" fill={GOLD} stroke={INK} strokeWidth="1.4" strokeLinejoin="round" opacity="0.95" />

          {/* Eyebrows — smug, asymmetric */}
          <path d="M42 48 L56 51" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
          <path d="M64 51 L78 43" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />

          {/* Eye sclera — half-lidded slits */}
          <ellipse
            data-fighter-eye
            cx="50" cy="57" rx="6" ry="3.2"
            fill="url(#bossEye)"
            stroke={INK} strokeWidth="1.5"
          />
          <ellipse
            data-fighter-eye
            cx="70" cy="57" rx="6" ry="3.2"
            fill="url(#bossEye)"
            stroke={INK} strokeWidth="1.5"
          />

          {/* Heavy upper eyelid */}
          <path d="M43 54.4 Q50 53.2 57 55.4" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M63 55.4 Q70 53.2 77 54.4" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />

          {/* Pupils — slim slit verticals */}
          <g ref={pupilsRef}>
            <ellipse cx="50" cy="57" rx="1.3" ry="2.4" fill="#0a1330" />
            <ellipse cx="70" cy="57" rx="1.3" ry="2.4" fill="#0a1330" />
            <ellipse cx="50" cy="57" rx="0.55" ry="1.6" fill="#dc2626" opacity="0.95" />
            <ellipse cx="70" cy="57" rx="0.55" ry="1.6" fill="#dc2626" opacity="0.95" />
            <circle cx="48.7" cy="55.8" r="0.7" fill="#fff" />
            <circle cx="68.7" cy="55.8" r="0.7" fill="#fff" />
          </g>

          {/* Cocky asymmetric smirk */}
          <path
            d="M50 68 Q56 64.5 64 65 Q71 65 76 60.5 L75 63 Q73 70 65 70.8 Q56 70.5 50 68 Z"
            fill="#2a0a14"
            stroke={INK}
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <path
            d="M59 70.3 Q61.6 72 63.6 70.2 Q62 71.4 59 70.3 Z"
            fill="#a78bff"
            stroke={INK}
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          <path
            d="M56 65 L59 65 L57.5 68.5 Z M59 65 L62 65 L60.5 69 Z M62 65 L66 65 L64 69.5 Z M66 64.5 L71 63 L68.6 70.2 Z"
            fill={TEETH}
            stroke={INK}
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
          <path
            d="M73.5 60 Q76 59.8 76.6 62.2"
            fill="none"
            stroke={INK}
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          {/* Battle-scar accent */}
          <path d="M46 62 L50 66" stroke="#7e3bff" strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />
        </g>
      </svg>
    </div>
  );
}
