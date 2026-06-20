/**
 * FlagIcon — hand-authored rect-based SVG country flags.
 *
 * Extracted from the BoU hero card on the Markets page so every flag in
 * the university-battle UI shares the same editorial language: 26×18
 * viewBox, rounded corners, navy outline, top-half sheen. Inline SVG
 * keeps flags crisp at any pixel density and free of OS-emoji rendering
 * inconsistencies.
 *
 * Server data stores flags as emoji (🇸🇪, 🇺🇸, …); this component maps
 * the emoji to its SVG art on the client. Unknown flags fall back to
 * rendering the emoji text so new countries degrade gracefully.
 */

import React, { useId } from 'react';

type FlagArt = (clipId: string, sheenId: string) => React.ReactNode;

const STRIPE_H = 18 / 13;
const CANTON_H = STRIPE_H * 7;

/** Per-country flag art, painted inside the rounded clip. Each painter
 *  receives unique gradient/clip id prefixes so multiple flags can
 *  coexist in one document. */
const FLAG_ART: Record<string, FlagArt> = {
  // Sweden — blue gradient field, yellow Nordic cross (bar thickness 3,
  // vertical bar offset ~1/3 from the left).
  se: (clipId, sheenId) => (
    <>
      <defs>
        <linearGradient id={`${clipId}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0058a3" />
          <stop offset="100%" stopColor="#003d73" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="26" height="18" fill={`url(#${clipId}-bg)`} />
      <rect x="8" y="0" width="3" height="18" fill="#fecd00" />
      <rect x="0" y="7.5" width="26" height="3" fill="#fecd00" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // USA — 13 stripes, blue canton over the upper-left 7 stripes, 5×4
  // grid of small white circle "stars" so the icon reads
  // stars-and-stripes without trying to be cartographically accurate
  // at 26×18.
  us: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="26" height="18" fill="#ffffff" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={`stripe-${i}`} x="0" y={i * STRIPE_H} width="26" height={STRIPE_H} fill="#bf0a30" />
      ))}
      <rect x="0" y="0" width="10.4" height={CANTON_H} fill="#002868" />
      {[1, 2, 3, 4, 5].flatMap((col) =>
        [1, 2, 3, 4].map((row) => (
          <circle
            key={`star-${col}-${row}`}
            cx={(col * 10.4) / 6}
            cy={(row * CANTON_H) / 5}
            r="0.55"
            fill="#ffffff"
          />
        ))
      )}
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // UK — Union Jack: blue field, white + red diagonals (stroked
  // corner-to-corner lines, clipped by the rounded frame), then the
  // white + red St George cross via rects.
  gb: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="26" height="18" fill="#012169" />
      <line x1="0" y1="0" x2="26" y2="18" stroke="#ffffff" strokeWidth="4" />
      <line x1="26" y1="0" x2="0" y2="18" stroke="#ffffff" strokeWidth="4" />
      <line x1="0" y1="0" x2="26" y2="18" stroke="#c8102e" strokeWidth="1.6" />
      <line x1="26" y1="0" x2="0" y2="18" stroke="#c8102e" strokeWidth="1.6" />
      <rect x="10" y="0" width="6" height="18" fill="#ffffff" />
      <rect x="0" y="6" width="26" height="6" fill="#ffffff" />
      <rect x="11.5" y="0" width="3" height="18" fill="#c8102e" />
      <rect x="0" y="7.5" width="26" height="3" fill="#c8102e" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // Denmark — red field, white Nordic cross (same bar geometry as SE).
  dk: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="26" height="18" fill="#c8102e" />
      <rect x="8" y="0" width="3" height="18" fill="#ffffff" />
      <rect x="0" y="7.5" width="26" height="3" fill="#ffffff" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // Norway — red field, white-fimbriated indigo Nordic cross.
  no: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="26" height="18" fill="#ba0c2f" />
      <rect x="7" y="0" width="5" height="18" fill="#ffffff" />
      <rect x="0" y="6.5" width="26" height="5" fill="#ffffff" />
      <rect x="8.25" y="0" width="2.5" height="18" fill="#00205b" />
      <rect x="0" y="7.75" width="26" height="2.5" fill="#00205b" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // Finland — white field, blue Nordic cross (slightly thicker bar, as
  // on the real flag).
  fi: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="26" height="18" fill="#ffffff" />
      <rect x="7.5" y="0" width="4" height="18" fill="#002f6c" />
      <rect x="0" y="7" width="26" height="4" fill="#002f6c" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // Germany — black / red / gold horizontal tricolor.
  de: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="26" height="6" fill="#000000" />
      <rect x="0" y="6" width="26" height="6" fill="#dd0000" />
      <rect x="0" y="12" width="26" height="6" fill="#ffce00" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // France — blue / white / red vertical tricolor.
  fr: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="8.67" height="18" fill="#002395" />
      <rect x="8.67" y="0" width="8.67" height="18" fill="#ffffff" />
      <rect x="17.33" y="0" width="8.67" height="18" fill="#ed2939" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // Italy — green / white / red vertical tricolor.
  it: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="8.67" height="18" fill="#009246" />
      <rect x="8.67" y="0" width="8.67" height="18" fill="#ffffff" />
      <rect x="17.33" y="0" width="8.67" height="18" fill="#ce2b37" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // Japan — white field, red sun disc.
  jp: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="26" height="18" fill="#ffffff" />
      <circle cx="13" cy="9" r="5" fill="#bc002d" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // Singapore — red over white halves; crescent built from two
  // offset circles, stars omitted at 26×18 to keep the icon legible.
  sg: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="26" height="18" fill="#ffffff" />
      <rect x="0" y="0" width="26" height="9" fill="#ee2536" />
      <circle cx="6.4" cy="4.5" r="3" fill="#ffffff" />
      <circle cx="7.6" cy="4.5" r="2.55" fill="#ee2536" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // Brazil — green field, yellow rhombus, blue celestial globe disc.
  br: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="26" height="18" fill="#009b3a" />
      <polygon points="13,2 24,9 13,16 2,9" fill="#ffdf00" />
      <circle cx="13" cy="9" r="3.6" fill="#002776" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // Argentina — sky-blue / white / sky-blue triband, golden Sun of May.
  ar: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="26" height="6" fill="#74acdf" />
      <rect x="0" y="6" width="26" height="6" fill="#ffffff" />
      <rect x="0" y="12" width="26" height="6" fill="#74acdf" />
      <circle cx="13" cy="9" r="1.7" fill="#f6b40e" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // Spain — red / wide gold / red horizontal bands.
  es: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="26" height="18" fill="#aa151b" />
      <rect x="0" y="4.5" width="26" height="9" fill="#f1bf00" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // Portugal — green hoist / red fly with a yellow armillary disc on
  // the seam (shield detail omitted at 26×18).
  pt: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="26" height="18" fill="#da291c" />
      <rect x="0" y="0" width="10" height="18" fill="#046a38" />
      <circle cx="10" cy="9" r="2.6" fill="#ffe000" />
      <circle cx="10" cy="9" r="1.4" fill="#da291c" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // Netherlands — red / white / blue horizontal tricolor.
  nl: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="26" height="6" fill="#ae1c28" />
      <rect x="0" y="6" width="26" height="6" fill="#ffffff" />
      <rect x="0" y="12" width="26" height="6" fill="#21468b" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // Belgium — black / yellow / red vertical tricolor.
  be: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="8.67" height="18" fill="#000000" />
      <rect x="8.67" y="0" width="8.67" height="18" fill="#fae042" />
      <rect x="17.33" y="0" width="8.67" height="18" fill="#ed2939" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // Croatia — red / white / blue triband with a small red-and-white
  // checkerboard standing in for the šahovnica coat of arms.
  hr: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="26" height="6" fill="#ff0000" />
      <rect x="0" y="6" width="26" height="6" fill="#ffffff" />
      <rect x="0" y="12" width="26" height="6" fill="#171796" />
      <rect x="10.5" y="5.5" width="5" height="5" fill="#ffffff" />
      <rect x="10.5" y="5.5" width="2.5" height="2.5" fill="#ff0000" />
      <rect x="13" y="8" width="2.5" height="2.5" fill="#ff0000" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // Uruguay — white field with blue stripes, white canton holding the
  // golden Sun of May (nine stripes simplified to four for legibility).
  uy: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="26" height="18" fill="#ffffff" />
      <rect x="0" y="2.5" width="26" height="2" fill="#0038a8" />
      <rect x="0" y="6.5" width="26" height="2" fill="#0038a8" />
      <rect x="0" y="10.5" width="26" height="2" fill="#0038a8" />
      <rect x="0" y="14.5" width="26" height="2" fill="#0038a8" />
      <rect x="0" y="0" width="9" height="9" fill="#ffffff" />
      <circle cx="4.5" cy="4.5" r="2.1" fill="#fcd116" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // Mexico — green / white / red vertical tricolor with a brown emblem
  // disc standing in for the eagle-and-serpent crest.
  mx: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="8.67" height="18" fill="#006847" />
      <rect x="8.67" y="0" width="8.67" height="18" fill="#ffffff" />
      <rect x="17.33" y="0" width="8.67" height="18" fill="#ce1126" />
      <circle cx="13" cy="9" r="1.7" fill="#6f4a2f" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // Switzerland — red field, bold white couped cross.
  ch: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="26" height="18" fill="#d52b1e" />
      <rect x="11" y="4" width="4" height="10" fill="#ffffff" />
      <rect x="8" y="7" width="10" height="4" fill="#ffffff" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // Morocco — red field, green interlaced pentagram (drawn as the
  // five-line star outline).
  ma: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="26" height="18" fill="#c1272d" />
      <path
        d="M13 4.5 L15.64 12.64 L8.72 7.61 L17.28 7.61 L10.36 12.64 Z"
        fill="none"
        stroke="#006233"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // South Korea — white field, red-and-blue taegeuk (S-curve comma
  // halves); the four trigrams are omitted at 26×18.
  kr: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="26" height="18" fill="#ffffff" />
      <circle cx="13" cy="9" r="4" fill="#cd2e3a" />
      <path d="M13 5 a4 4 0 0 1 0 8 a2 2 0 0 1 0 -4 a2 2 0 0 0 0 -4 Z" fill="#0047a0" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // Senegal — green / gold / red vertical tricolor, green star centered.
  sn: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="8.67" height="18" fill="#00853f" />
      <rect x="8.67" y="0" width="8.67" height="18" fill="#fdef42" />
      <rect x="17.33" y="0" width="8.67" height="18" fill="#e31b23" />
      <path
        d="M13 6 L13.71 8.03 L15.85 8.07 L14.14 9.37 L14.76 11.43 L13 10.2 L11.24 11.43 L11.86 9.37 L10.15 8.07 L12.29 8.03 Z"
        fill="#00853f"
      />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // Turkey — red field, white crescent (two offset circles) and star.
  tr: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="26" height="18" fill="#e30a17" />
      <circle cx="10" cy="9" r="4" fill="#ffffff" />
      <circle cx="11.3" cy="9" r="3.2" fill="#e30a17" />
      <path
        d="M15.8 7.3 L16.21 8.43 L17.42 8.47 L16.47 9.22 L16.8 10.38 L15.8 9.7 L14.8 10.38 L15.13 9.22 L14.18 8.47 L15.39 8.43 Z"
        fill="#ffffff"
      />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
  // South Africa — red top / blue bottom, central green pall with white
  // fimbriation and a gold-bordered black hoist triangle (simplified to
  // horizontal bands so it reads at 26×18).
  za: (_clipId, sheenId) => (
    <>
      <rect x="0" y="0" width="26" height="9" fill="#e03c31" />
      <rect x="0" y="9" width="26" height="9" fill="#001489" />
      <rect x="0" y="4.5" width="26" height="9" fill="#ffffff" />
      <rect x="0" y="6" width="26" height="6" fill="#007749" />
      <path d="M0 0 L11 9 L0 18 Z" fill="#ffb81c" />
      <path d="M0 1.6 L8.6 9 L0 16.4 Z" fill="#000000" />
      <rect x="0" y="0" width="26" height="9" fill={`url(#${sheenId})`} />
    </>
  ),
};

const EMOJI_TO_CODE: Record<string, string> = {
  '🇸🇪': 'se',
  '🇺🇸': 'us',
  '🇬🇧': 'gb',
  '🇩🇰': 'dk',
  '🇳🇴': 'no',
  '🇫🇮': 'fi',
  '🇩🇪': 'de',
  '🇫🇷': 'fr',
  '🇮🇹': 'it',
  '🇯🇵': 'jp',
  '🇸🇬': 'sg',
  '🇧🇷': 'br',
  '🇦🇷': 'ar',
  '🇪🇸': 'es',
  '🇵🇹': 'pt',
  '🇳🇱': 'nl',
  '🇧🇪': 'be',
  '🇭🇷': 'hr',
  '🇺🇾': 'uy',
  '🇲🇽': 'mx',
  '🇨🇭': 'ch',
  '🇲🇦': 'ma',
  '🇰🇷': 'kr',
  '🇸🇳': 'sn',
  '🇹🇷': 'tr',
  '🇿🇦': 'za',
};

export function FlagIcon({
  flag,
  className = 'h-[18px] w-[26px] flex-shrink-0',
}: {
  /** Emoji flag (🇸🇪, 🇺🇸, …) or a lowercase ISO code (se, us, …). */
  flag: string;
  /** Size/positioning classes. Keep the 26:18 aspect ratio. */
  className?: string;
}) {
  const uid = useId();
  const code = EMOJI_TO_CODE[flag] ?? (flag.toLowerCase() in FLAG_ART ? flag.toLowerCase() : null);
  const art = code ? FLAG_ART[code] : null;

  // Unknown flag (e.g. the server's 🌍 default or non-country crew
  // emoji) — keep rendering the raw emoji so nothing disappears.
  if (!art) return <span className="leading-none">{flag}</span>;

  const clipId = `flag-clip-${uid}`;
  const sheenId = `flag-sheen-${uid}`;
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 26 18"
      className={className}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0.75" y="0.75" width="24.5" height="16.5" rx="2.25" />
        </clipPath>
        <linearGradient id={sheenId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${clipId})`}>{art(clipId, sheenId)}</g>
      <rect x="0.75" y="0.75" width="24.5" height="16.5" rx="2.25" fill="none" stroke="#0f172a" strokeWidth="1.5" />
    </svg>
  );
}

export default FlagIcon;
