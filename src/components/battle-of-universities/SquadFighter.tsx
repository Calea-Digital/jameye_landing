/**
 * SquadFighter — a compact, recolorable chibi fighter for the battle squads.
 *
 * The app renders each org's *real* members here via the database-driven
 * `FighterAvatar` → `CustomizableFighterAvatar` subsystem (character catalog,
 * avatar config, part atlas, gradient-id registry). That whole subsystem is
 * overkill for a landing page, so this is a single self-contained SVG fighter
 * that:
 *   • takes a `jersey` color (the org's primary brand color) for the shirt,
 *   • takes `hairFrom` / `hairTo` so the three fighters per side vary,
 *   • namespaces its gradient ids with a unique `uid` (so multiple instances
 *     on the page don't clash),
 *   • registers with the shared cursor-tracking pointer (`fighterPointer`) so
 *     heads tilt / eyes follow / everyone blinks in lockstep — exactly like the
 *     real avatars.
 *
 * Geometry is the app's `AvatarFighter` (viewBox 120×140, chibi proportions,
 * 2.4–2.6px ink outlines) so it reads as the same cast.
 */

import { useEffect, useRef } from "react";
import { registerFighter } from "./fighterPointer";

const INK = "#0f172a";

export interface SquadFighterProps {
  /** Unique id used to namespace this instance's SVG gradients. */
  uid: string;
  /** Shirt / jersey color — pass the org's primary brand color. */
  jersey?: string;
  /** Hair gradient endpoints (top → bottom). */
  hairFrom?: string;
  hairTo?: string;
  /** Which way the head leans toward the cursor. */
  facing?: "left" | "right";
  className?: string;
}

export function SquadFighter({
  uid,
  jersey = "#7e3bff",
  hairFrom = "#7e3bff",
  hairTo = "#0b0606",
  facing = "right",
  className = "",
}: SquadFighterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const eyesRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    return registerFighter({
      wrapper: containerRef.current,
      head: headRef.current,
      eyes: eyesRef.current,
      facing,
    });
  }, [facing]);

  const hairId = `sf-hair-${uid}`;
  const faceId = `sf-face-${uid}`;
  const eyeId = `sf-eye-${uid}`;
  const shirtId = `sf-shirt-${uid}`;

  return (
    <div ref={containerRef} className={`flex h-full w-full items-end justify-center ${className}`}>
      <svg viewBox="0 0 120 140" className="h-full w-full" aria-hidden role="img">
        <defs>
          <linearGradient id={hairId} x1="30" x2="90" y1="6" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor={hairFrom} />
            <stop offset="0.55" stopColor={hairTo} />
            <stop offset="1" stopColor="#0b0606" />
          </linearGradient>
          <linearGradient id={faceId} x1="38" x2="82" y1="22" y2="74" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fde7c2" />
            <stop offset="0.55" stopColor="#f9b27d" />
            <stop offset="1" stopColor="#c2410c" />
          </linearGradient>
          <linearGradient id={eyeId} x1="46" x2="74" y1="42" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#020617" />
            <stop offset="0.5" stopColor={jersey} />
            <stop offset="1" stopColor="#d83bff" />
          </linearGradient>
          <linearGradient id={shirtId} x1="32" x2="88" y1="74" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor={jersey} />
            <stop offset="1" stopColor="#0b0f1a" />
          </linearGradient>
        </defs>

        {/* ground shadow */}
        <ellipse cx="60" cy="134" rx="30" ry="3.6" fill={INK} opacity="0.22" />

        {/* legs */}
        <path d="M40 102 L34 130 L48 130 L52 106 Z" fill={INK} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        <ellipse cx="41" cy="131" rx="10" ry="3.2" fill={INK} stroke={INK} strokeWidth="2" />
        <path d="M64 106 Q72 118 78 130 L92 130 L88 132.5 L74 132.5 Q68 124 60 110 Z" fill={INK} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        <ellipse cx="84" cy="131" rx="11" ry="3.2" fill={INK} stroke={INK} strokeWidth="2" />

        {/* belt */}
        <rect x="40" y="98" width="42" height="7" fill={jersey} stroke={INK} strokeWidth="2.2" />

        {/* shirt / jersey */}
        <path d="M42 74 Q34 96 40 104 L82 104 Q88 96 80 74 Q60 68 42 74 Z" fill={`url(#${shirtId})`} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M44 84 L78 82" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round" />

        {/* arms */}
        <path d="M44 76 Q30 76 32 92 Q34 100 42 96 L46 86 Q48 80 46 76 Z" fill={`url(#${faceId})`} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M76 76 Q92 72 96 86 Q98 96 90 100 L80 94 Q76 86 76 78 Z" fill={`url(#${faceId})`} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />

        {/* fists */}
        <circle cx="38" cy="96" r="6.5" fill={`url(#${faceId})`} stroke={INK} strokeWidth="2.2" />
        <circle cx="94" cy="98" r="7" fill={`url(#${faceId})`} stroke={INK} strokeWidth="2.4" />

        {/* neck */}
        <rect x="55" y="70" width="10" height="6" fill="#c2410c" stroke={INK} strokeWidth="2" />

        {/* HEAD GROUP — cursor-tracked */}
        <g ref={headRef}>
          <path
            d="M30 48C30 22 42 8 60 8C78 8 90 22 90 48V70C90 78 84 82 76 79C72 82 48 82 44 79C36 82 30 78 30 70V48Z"
            fill={`url(#${hairId})`}
            stroke={INK}
            strokeWidth="2.4"
          />
          <path d="M28 54C20 50 22 36 30 36M92 54C100 50 98 36 90 36" fill={hairTo} stroke={INK} strokeWidth="2" />
          <ellipse cx="60" cy="48" rx="22" ry="24" fill={`url(#${faceId})`} stroke={INK} strokeWidth="2.4" />
          <path
            d="M30 32 L36 14 L42 28 L48 8 L54 26 L60 6 L66 26 L72 8 L78 28 L84 14 L90 32 Q60 22 30 32 Z"
            fill={`url(#${hairId})`}
            stroke={INK}
            strokeWidth="2.3"
            strokeLinejoin="round"
          />
          {/* eyebrows */}
          <path d="M42 50 L56 52" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M64 52 L78 50" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
          {/* eye whites / irises */}
          <ellipse data-fighter-eye cx="50" cy="56" rx="6.4" ry="5.5" fill={`url(#${eyeId})`} stroke={INK} strokeWidth="1.5" />
          <ellipse data-fighter-eye cx="70" cy="56" rx="6.4" ry="5.5" fill={`url(#${eyeId})`} stroke={INK} strokeWidth="1.5" />
          {/* PUPILS — cursor-tracked */}
          <g ref={eyesRef}>
            <circle cx="50" cy="56" r="2.4" fill="#0a1330" />
            <circle cx="70" cy="56" r="2.4" fill="#0a1330" />
            <circle cx="48.4" cy="54" r="1.5" fill="#fff" />
            <circle cx="68.4" cy="54" r="1.5" fill="#fff" />
          </g>
          {/* mouth */}
          <path d="M52 66 L68 66" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

export default SquadFighter;
