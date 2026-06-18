/**
 * LoopExpeditionScene — the Edge Score Builder expedition map.
 *
 * A 3D dirt track with magenta runway lights, X-eyed stubborn padlocks, one
 * gold "loot" reward lock, and a hooded boss guarding the "CERTIFIED EDGE
 * SCORE HOLDERS ONLY" vault hall. The START node is the player `AvatarFighter`;
 * the final node is the `EdgeScoreBossAvatar`. Node data comes from
 * `curatedLoopsData`. This is illustrative SVG art.
 *
 * Landing-repo note: the only behavioural hook is the `onStart` callback,
 * fired when the player taps the START node / "Tap to play" button. Wire it to
 * whatever the landing page should do (scroll, open a modal, navigate, …) — or
 * leave it undefined for a purely decorative scene.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AvatarFighter } from "./AvatarFighter";
import EdgeScoreBossAvatar from "./EdgeScoreBossAvatar";
import {
  CURATED_LOOPS,
  type CuratedLoop,
  type CuratedLoopNode,
  type LoopNodeCategory,
  type LoopNodeKind,
} from "./curatedLoopsData";

// "… Variable" are the app's variable-font names; the landing loads the same
// typefaces as "Inter Tight" / "JetBrains Mono" (Google Fonts), added as
// fallbacks so the scene's type matches the app 1:1 instead of system fonts.
const DISPLAY_FONT = "'Inter Tight Variable', 'Inter Tight', system-ui, sans-serif";
const MONO_FONT = "'JetBrains Mono Variable', 'JetBrains Mono', monospace";
const MARKETS_PER_CHAPTER = 5;

const KEYFRAMES = `
@keyframes loopLockRattle {
  0%, 84%, 100% { transform: translateX(0) rotate(0); }
  86%           { transform: translateX(-2.4px) rotate(-6deg); }
  88%           { transform: translateX(2.4px)  rotate(6deg); }
  90%           { transform: translateX(-1.6px) rotate(-3deg); }
  92%           { transform: translateX(1.6px)  rotate(3deg); }
  94%           { transform: translateX(-0.8px) rotate(-1.4deg); }
}
@keyframes loopRewardBob {
  0%, 100% { transform: translateY(0)    rotate(0deg); }
  50%      { transform: translateY(-3px) rotate(2deg); }
}
@keyframes loopRewardSparkle {
  0%, 100% { opacity: 0.25; transform: scale(0.6); }
  50%      { opacity: 1;    transform: scale(1); }
}
@keyframes loopPathComet  { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -100; } }
@keyframes loopPathArenaRunway { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -22.5; } }
.loop-path-comet  { animation: loopPathComet 2.4s linear infinite; }
.loop-path-arena-runway { animation: loopPathArenaRunway 1.3s linear infinite; }
@keyframes loopJourneyMist {
  0%, 100% { opacity: 0.28; transform: translateX(-1.5%); }
  50%      { opacity: 0.44; transform: translateX(1.5%); }
}
.loop-journey-mist { animation: loopJourneyMist 7.2s ease-in-out infinite; }
@keyframes bossHallCashFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-4px); }
}
@keyframes bossHallChainShimmer {
  0%, 100% { opacity: 0.62; }
  50%      { opacity: 0.85; }
}
@media (prefers-reduced-motion: reduce) {
  [data-loop-avatar] *, [data-loop-avatar],
  .loop-path-comet, .loop-path-arena-runway, .loop-journey-mist { animation: none !important; }
}
`;

/** Sample point along the wavy quadratic Bezier path covering [4,80]% horizontally. */
function pointOnPath(t: number): { x: number; y: number } {
  if (t <= 0.5) {
    const t2 = t * 2;
    const u = 1 - t2;
    return {
      x: u * u * 4 + 2 * u * t2 * 16 + t2 * t2 * 34,
      y: u * u * 60 + 2 * u * t2 * 25 + t2 * t2 * 60,
    };
  }
  const t2 = (t - 0.5) * 2;
  const u = 1 - t2;
  return {
    x: u * u * 34 + 2 * u * t2 * 52 + t2 * t2 * 80,
    y: u * u * 60 + 2 * u * t2 * 95 + t2 * t2 * 60,
  };
}

/** Vertical serpentine layout for narrow (mobile) viewports — the same
 *  expedition, stacked top→bottom so it reads as a vertical climb instead of
 *  a cramped horizontal scroll. x weaves within [28,72]% so the wide node
 *  glyphs never clip the card edges. */
function pointOnPathVertical(t: number): { x: number; y: number } {
  return {
    x: 50 + 22 * Math.sin(t * Math.PI * 2.1),
    y: 15 + 76 * t,
  };
}

/** Catmull-Rom → cubic-Bezier smooth path through the given points (in the
 *  0–100 viewBox space). Used so the decorative track follows the vertical
 *  node positions exactly. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  const d = [`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d.push(`C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`);
  }
  return d.join(" ");
}

// ─── Boss vault hall backdrop ───────────────────────────────────────────────

function BossDuelHallBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-0 -top-12 -bottom-1 left-6 -right-24 origin-[22%_100%] scale-[0.78] sm:-top-16 sm:left-8 sm:-right-28 sm:scale-[0.86] md:-top-20 md:left-9 md:-right-32 md:scale-90 lg:-top-24 lg:left-10 lg:-right-36 lg:scale-[0.92]"
    >
      <svg viewBox="0 0 240 220" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
        <defs>
          <radialGradient id="bossHallGlow" cx="55%" cy="55%" r="55%">
            <stop offset="0%" stopColor="#d83bff" stopOpacity="0.42" />
            <stop offset="55%" stopColor="#7c3aed" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#0a0a14" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bossHallArch" x1="0" x2="0" y1="0" y2="220">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="55%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0a0a14" />
          </linearGradient>
          <linearGradient id="bossHallInner" x1="0" x2="0" y1="40" y2="200">
            <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#050508" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="bossHallTrophy" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#d83bff" />
            <stop offset="55%" stopColor="#d83bff" />
            <stop offset="100%" stopColor="#7e3bff" />
          </linearGradient>
          <linearGradient id="bossHallSign" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fffdf5" />
            <stop offset="35%" stopColor="rgba(216,59,255,0.22)" />
            <stop offset="100%" stopColor="#d83bff" />
          </linearGradient>
        </defs>

        <ellipse cx="125" cy="125" rx="108" ry="86" fill="url(#bossHallGlow)" />

        <path
          d="M22 208 L22 92 Q22 28 120 28 Q218 28 218 92 L218 208 Z"
          fill="url(#bossHallArch)" stroke="#3b0764" strokeWidth="2.4" opacity="0.92"
        />
        <path d="M22 130 L218 130" stroke="#0a0a14" strokeWidth="1" opacity="0.45" />
        <path d="M22 170 L218 170" stroke="#0a0a14" strokeWidth="1" opacity="0.35" />
        <path d="M70 28 L70 130 M170 28 L170 130" stroke="#0a0a14" strokeWidth="1" opacity="0.35" />

        <path
          d="M50 208 L50 105 Q50 52 120 52 Q190 52 190 105 L190 208 Z"
          fill="url(#bossHallInner)" stroke="#1a103a" strokeWidth="1.6"
        />
        <path d="M50 208 L100 150" stroke="#3b0764" strokeWidth="1.2" opacity="0.55" />
        <path d="M190 208 L140 150" stroke="#3b0764" strokeWidth="1.2" opacity="0.55" />
        <path d="M120 150 L120 208" stroke="#3b0764" strokeWidth="1" opacity="0.4" strokeDasharray="2 3" />

        {/* TOP SIGN — "CERTIFIED EDGE SCORE / HOLDERS ONLY" */}
        <g>
          <path d="M6 7 L234 7 L238 23 L234 51 L6 51 L2 23 Z" fill="#0a1330" opacity="0.22" transform="translate(0 1.4)" />
          <path d="M6 6 L234 6 L238 22 L234 50 L6 50 L2 22 Z" fill="url(#bossHallSign)" stroke="#1a103a" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M12 12 L228 12 L230 18 L228 44 L12 44 L10 18 Z" fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="0.75" />
          <text x="120" y="24" textAnchor="middle" fontSize="13" fontWeight="800" fill="#4c0519" fontFamily={DISPLAY_FONT}>
            <tspan x="120" dy="0" letterSpacing="0.04em">CERTIFIED EDGE SCORE</tspan>
            <tspan x="120" dy="15" letterSpacing="0.18em">HOLDERS ONLY</tspan>
          </text>
        </g>

        {/* Left trophy pillar */}
        <g transform="translate(64 168)">
          <rect x="-10" y="22" width="20" height="6" fill="#5b21b6" stroke="#1a103a" strokeWidth="1.2" />
          <rect x="-5" y="12" width="10" height="10" fill="#7e3bff" stroke="#1a103a" strokeWidth="1" />
          <path d="M-13 -14 Q-13 12 0 12 Q13 12 13 -14 Z" fill="url(#bossHallTrophy)" stroke="#1a103a" strokeWidth="1.4" />
          <path d="M-13 -8 Q-20 -8 -20 -1 Q-20 6 -13 6" stroke="#d83bff" strokeWidth="1.6" fill="none" />
          <path d="M13 -8 Q20 -8 20 -1 Q20 6 13 6" stroke="#d83bff" strokeWidth="1.6" fill="none" />
          <text x="0" y="2" textAnchor="middle" fontSize="7" fontWeight="900" fill="#1a103a" fontFamily={MONO_FONT}>$$</text>
        </g>

        {/* Right trophy pillar */}
        <g transform="translate(176 162)">
          <rect x="-11" y="24" width="22" height="6" fill="#5b21b6" stroke="#1a103a" strokeWidth="1.2" />
          <rect x="-6" y="13" width="12" height="11" fill="#7e3bff" stroke="#1a103a" strokeWidth="1" />
          <path d="M-15 -16 Q-15 13 0 13 Q15 13 15 -16 Z" fill="url(#bossHallTrophy)" stroke="#1a103a" strokeWidth="1.4" />
          <path d="M-15 -10 Q-22 -10 -22 -2 Q-22 6 -15 6" stroke="#d83bff" strokeWidth="1.6" fill="none" />
          <path d="M15 -10 Q22 -10 22 -2 Q22 6 15 6" stroke="#d83bff" strokeWidth="1.6" fill="none" />
          <text x="0" y="2" textAnchor="middle" fontSize="8" fontWeight="900" fill="#1a103a" fontFamily={MONO_FONT}>$$</text>
        </g>

        {/* Floating cash bills */}
        <g style={{ animation: "bossHallCashFloat 3.4s ease-in-out infinite", transformOrigin: "52px 78px" }}>
          <g transform="translate(52 78) rotate(-12)">
            <rect x="-12" y="-7" width="24" height="14" rx="1.6" fill="#16a34a" stroke="#052e16" strokeWidth="1" />
            <rect x="-9" y="-4" width="18" height="8" rx="1" fill="none" stroke="#052e16" strokeWidth="0.6" opacity="0.7" />
            <text x="0" y="3" textAnchor="middle" fontSize="8" fontWeight="900" fill="#052e16" fontFamily={MONO_FONT}>$</text>
          </g>
        </g>
        <g style={{ animation: "bossHallCashFloat 3.4s ease-in-out 0.7s infinite", transformOrigin: "188px 76px" }}>
          <g transform="translate(188 76) rotate(8)">
            <rect x="-12" y="-7" width="24" height="14" rx="1.6" fill="#16a34a" stroke="#052e16" strokeWidth="1" />
            <rect x="-9" y="-4" width="18" height="8" rx="1" fill="none" stroke="#052e16" strokeWidth="0.6" opacity="0.7" />
            <text x="0" y="3" textAnchor="middle" fontSize="8" fontWeight="900" fill="#052e16" fontFamily={MONO_FONT}>$</text>
          </g>
        </g>
        <g style={{ animation: "bossHallCashFloat 4s ease-in-out 1.4s infinite", transformOrigin: "120px 60px" }}>
          <g transform="translate(120 60)">
            <rect x="-16" y="-9" width="32" height="18" rx="2" fill="#16a34a" stroke="#052e16" strokeWidth="1.1" />
            <rect x="-13" y="-6" width="26" height="12" rx="1.2" fill="none" stroke="#052e16" strokeWidth="0.7" opacity="0.7" />
            <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="900" fill="#052e16" fontFamily={MONO_FONT}>$$$</text>
          </g>
        </g>

        {/* Crossed chains + padlock across the doorway */}
        <g opacity="0.7" style={{ animation: "bossHallChainShimmer 3s ease-in-out infinite" }}>
          <path d="M58 132 L182 188" stroke="#d83bff" strokeWidth="2.6" strokeDasharray="5 3.5" strokeLinecap="round" />
          <path d="M58 188 L182 132" stroke="#d83bff" strokeWidth="2.6" strokeDasharray="5 3.5" strokeLinecap="round" />
          <g transform="translate(120 160)">
            <path d="M-4 -4 Q-4 -8 0 -8 Q4 -8 4 -4 L4 0 L-4 0 Z" fill="none" stroke="#d83bff" strokeWidth="1.6" />
            <rect x="-6" y="0" width="12" height="9" rx="1.4" fill="#d83bff" stroke="#7e3bff" strokeWidth="1.2" />
            <circle cx="0" cy="4" r="1.2" fill="#7e3bff" />
          </g>
        </g>
      </svg>
    </div>
  );
}

// ─── Hover card (category tooltip) ──────────────────────────────────────────

type CategoryCardMeta = {
  short: string;
  icon: "parliament" | "runner" | "chart" | "briefcase" | "spark";
  from: string;
  to: string;
};

const CATEGORY_CARD_META: Record<LoopNodeCategory, CategoryCardMeta> = {
  "Politics & Geopolitics": { short: "Politics", icon: "parliament", from: "#2962ff", to: "#5b8dff" },
  Sport: { short: "Sport", icon: "runner", from: "#5b8dff", to: "#a78bff" },
  "Finance & Macro": { short: "Finance", icon: "chart", from: "#2962ff", to: "#a78bff" },
  "Companies & Business": { short: "Business", icon: "briefcase", from: "#a78bff", to: "#d83bff" },
  Crypto: { short: "Crypto", icon: "chart", from: "#7e3bff", to: "#d83bff" },
  "Culture & Entertainment": { short: "Culture", icon: "spark", from: "#d83bff", to: "#ff3ba8" },
  Technology: { short: "Tech", icon: "chart", from: "#2962ff", to: "#7e3bff" },
};

function NodeCardIcon({ icon }: { icon: CategoryCardMeta["icon"] }) {
  if (icon === "parliament") {
    return (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 19h16M5.5 17V9.5h13V17" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.8 9.5L12 4l8.2 5.5H3.8z" fill="rgba(255,255,255,0.18)" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
        <path d="M8 17v-5M12 17v-5M16 17v-5" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
        <path d="M10.3 8.1h3.4M12 6.4v3.4" stroke="#7e3bff" strokeWidth={1.4} strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === "runner") {
    return (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <circle cx="13" cy="4" r="2" />
        <path d="M14.5 7h-3l-2.2 5.4 2.7 1.4-1.6 5.7 2 .5 2-6.3-1.5-1 1.6-3.2 2 3 3.5-1-.7-1.9-2.3.5L14.5 7z" />
      </svg>
    );
  }
  if (icon === "briefcase") {
    return (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V5.75A1.75 1.75 0 0110.75 4h2.5A1.75 1.75 0 0115 5.75V7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 9.5A2.5 2.5 0 016.5 7h11A2.5 2.5 0 0120 9.5v7A2.5 2.5 0 0117.5 19h-11A2.5 2.5 0 014 16.5v-7z" />
        <path strokeLinecap="round" d="M4 12h16M10 12v1h4v-1" />
      </svg>
    );
  }
  if (icon === "spark") {
    return (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2l2.8 6.4L22 11l-7.2 2.6L12 20l-2.8-6.4L2 11l7.2-2.6L12 2z" />
        <path d="M5 3l1.2 2.8L9 7 6.2 8.2 5 11 3.8 8.2 1 7l2.8-1.2L5 3z" opacity="0.65" />
      </svg>
    );
  }
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5M4 19h16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 15l3-4 3 2 5-7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 6h2v2" />
    </svg>
  );
}

function HoverCardSheet({ node, index }: { node: CuratedLoopNode; index: number }) {
  const meta = CATEGORY_CARD_META[node.category];
  const isBoss = node.kind === "boss";
  const isLocked = node.kind === "locked" || isBoss;
  const canStart = node.kind === "current";
  const marketLine = isBoss ? "5 picks (boss)" : `${MARKETS_PER_CHAPTER} markets`;

  return (
    <>
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:repeating-linear-gradient(105deg,rgba(255,255,255,0.26)_0_1px,transparent_1px_14px)]" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full opacity-35 blur-2xl" style={{ background: meta.to }} />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-20 w-20 rounded-full opacity-28 blur-2xl" style={{ background: meta.from }} />

      <div className="relative mb-2 flex items-center gap-2">
        <h4
          className="shrink-0 rounded-md border border-white/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white"
          style={{ backgroundImage: "linear-gradient(95deg,#2962ff 0%,#7e3bff 55%,#d83bff 100%)", boxShadow: "0 6px 18px -6px rgba(126,59,255,0.55)" }}
        >
          Ch {index + 1}
        </h4>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium uppercase tracking-[0.02em] leading-none text-white" style={{ fontFamily: DISPLAY_FONT }}>
            {meta.short}
          </p>
          <p className="mt-1 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">{marketLine}</p>
        </div>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-white/15 text-white"
          style={{ background: `linear-gradient(145deg, ${meta.from}66, ${meta.to}44)` }}
        >
          <NodeCardIcon icon={meta.icon} />
        </div>
      </div>

      {isLocked && (
        <div className="relative mb-2 flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.035] px-2.5 py-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/15 text-[12px]" style={{ background: "rgba(255,255,255,0.06)" }} aria-hidden>
            🔒
          </span>
          <p className="text-[11px] font-normal leading-snug text-white/70">{node.unlockText ?? "Clear the previous chapter first"}</p>
        </div>
      )}

      {canStart && (
        <div
          className="relative mt-1 inline-flex w-full items-center justify-center gap-2 rounded-[10px] border-2 border-[#0a1330] px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white"
          style={{ backgroundImage: "linear-gradient(95deg,#2962ff 0%,#7e3bff 55%,#d83bff 100%)", boxShadow: "0 12px 30px -10px rgba(126,59,255,0.55)" }}
        >
          ▶ Start
        </div>
      )}
    </>
  );
}

function HoverChrome({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative max-h-full min-h-0 flex-1 overflow-hidden rounded-[12px] border border-white/[0.08] bg-white/[0.04] p-3 text-white backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.5),0_28px_64px_-20px_rgba(0,0,0,0.6)]"
      style={{ color: "#f8fafc" }}
    >
      {children}
    </div>
  );
}

/** Node anchor + portal hover card. The card is portaled to <body> so the
 *  scene card's `overflow-hidden` + transformed wrappers don't clip it. */
function NodeWithHover({
  node,
  index,
  pos,
  openAbove,
  onStart,
}: {
  node: CuratedLoopNode;
  index: number;
  pos: { x: number; y: number };
  openAbove: boolean;
  onStart: () => void;
}) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState<{ left: number; width: number; top: number | null; bottom: number | null; maxHeight: number } | null>(null);
  const isCurrent = node.kind === "current";

  const cancelClose = useCallback(() => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  }, []);
  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  }, [cancelClose]);
  useEffect(() => () => cancelClose(), [cancelClose]);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) { setBox(null); return; }
    const margin = 14, gap = 10, minUseful = 110, capH = 420;
    const measure = () => {
      const el = anchorRef.current;
      if (!el) return;
      const vh = window.innerHeight, vw = window.innerWidth;
      const rect = el.getBoundingClientRect();
      const width = Math.min(228, vw - margin * 2);
      let left = rect.left + rect.width / 2 - width / 2;
      left = Math.max(margin, Math.min(left, vw - width - margin));
      const spaceBelow = vh - rect.bottom - margin;
      const spaceAbove = rect.top - margin;
      let placeAbove = openAbove;
      if (spaceBelow < minUseful && spaceAbove > spaceBelow) placeAbove = true;
      if (spaceAbove < minUseful && spaceBelow > spaceAbove) placeAbove = false;
      if (placeAbove) {
        setBox({ left, width, top: null, bottom: Math.max(margin, vh - rect.top + gap), maxHeight: Math.min(capH, Math.max(minUseful, spaceAbove - gap)) });
      } else {
        setBox({ left, width, top: Math.max(margin, rect.bottom + gap), bottom: null, maxHeight: Math.min(capH, Math.max(minUseful, spaceBelow - gap)) });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, openAbove, node.id]);

  return (
    <div
      className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
    >
      <div
        ref={anchorRef}
        role="button"
        tabIndex={0}
        aria-label={isCurrent ? "Start the quest" : `${node.kind} level — details`}
        onClick={isCurrent ? onStart : undefined}
        onPointerEnter={() => { cancelClose(); setOpen(true); }}
        onPointerLeave={scheduleClose}
        className="group relative inline-block cursor-pointer select-none rounded-[34px] outline-none transition-[transform,filter] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[#7e3bff]/70 active:scale-95 motion-safe:hover:scale-[1.06] motion-safe:hover:-translate-y-0.5"
      >
        <LoopNodeGlyph kind={node.kind} />
        <div className="pointer-events-none absolute left-1/2 -bottom-3 h-4 w-[82%] -translate-x-1/2 rounded-full bg-[#0f172a]/65 blur-[3px]" aria-hidden />
      </div>
      {node.label && (
        <span className="mt-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{node.label}</span>
      )}
      {isCurrent && (
        <button
          type="button"
          onClick={onStart}
          className="mt-1 inline-flex items-center gap-1 rounded-full border-2 border-[#0a1330] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_10px_28px_-8px_rgba(126,59,255,0.55)] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
          style={{ backgroundImage: "linear-gradient(95deg,#2962ff 0%,#7e3bff 55%,#d83bff 100%)" }}
        >
          Tap to play
        </button>
      )}

      {open && box && typeof document !== "undefined" &&
        createPortal(
          <div
            className="pointer-events-auto fixed z-[260] flex flex-col outline-none"
            style={{ left: box.left, width: box.width, top: box.top ?? "auto", bottom: box.bottom ?? "auto", maxHeight: box.maxHeight }}
            onPointerEnter={cancelClose}
            onPointerLeave={scheduleClose}
            onClick={(e) => e.stopPropagation()}
          >
            <HoverChrome>
              <HoverCardSheet node={node} index={index} />
            </HoverChrome>
          </div>,
          document.body,
        )}
    </div>
  );
}

// ─── Node glyphs ────────────────────────────────────────────────────────────

function LoopNodeGlyph({ kind }: { kind: LoopNodeKind }) {
  if (kind === "current") {
    return (
      <div data-loop-avatar className="relative flex h-28 w-28 items-end justify-center">
        <div className="h-[140%] w-full drop-shadow-[0_10px_18px_rgba(126,59,255,0.45)]">
          <AvatarFighter />
        </div>
      </div>
    );
  }

  if (kind === "locked") {
    return (
      <div data-loop-avatar className="relative flex h-24 w-24 items-center justify-center">
        <span className="block" style={{ transform: "rotate(-6deg)", transformOrigin: "center" }}>
          <svg
            viewBox="0 0 60 72"
            className="h-20 w-20 drop-shadow-[0_8px_22px_-8px_rgba(0,0,0,0.55)]"
            aria-hidden
            style={{ animation: "loopLockRattle 4.5s ease-in-out infinite", transformOrigin: "center" }}
          >
            <path d="M2 16 L9 19" stroke="#0a1330" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M58 16 L51 19" stroke="#0a1330" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M3 56 L10 55" stroke="#0a1330" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
            <path d="M57 56 L50 55" stroke="#0a1330" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
            <path d="M48 3 L52 7" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M52 3 L48 7" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M50 1 L50 8" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M55 6 L55 11" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 30 V20 a14 14 0 0 1 28 0 V30" fill="none" stroke="#0a1330" strokeWidth="6.5" strokeLinecap="round" />
            <path d="M16 30 V20 a14 14 0 0 1 28 0 V30" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
            <path d="M19 21 a11 11 0 0 1 8 -8" fill="none" stroke="#f8fafc" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
            <rect x="6" y="28" width="48" height="42" rx="9" fill="#475569" stroke="#0a1330" strokeWidth="2.6" />
            <rect x="11" y="33" width="38" height="32" rx="6" fill="#334155" stroke="#0a1330" strokeWidth="1.8" />
            <circle cx="16" cy="38" r="0.9" fill="#94a3b8" opacity="0.55" />
            <circle cx="44" cy="40" r="0.9" fill="#94a3b8" opacity="0.55" />
            <circle cx="20" cy="60" r="0.9" fill="#94a3b8" opacity="0.55" />
            <circle cx="40" cy="60" r="0.9" fill="#94a3b8" opacity="0.55" />
            <circle cx="30" cy="34" r="0.8" fill="#94a3b8" opacity="0.55" />
            <path d="M11 36 L11 60" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
            <path d="M19 43 L26 50" stroke="#d83bff" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M26 43 L19 50" stroke="#d83bff" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M34 43 L41 50" stroke="#d83bff" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M41 43 L34 50" stroke="#d83bff" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M23 58 L37 58" stroke="#d83bff" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </span>
      </div>
    );
  }

  if (kind === "reward") {
    return (
      <div data-loop-avatar className="relative flex h-24 w-24 items-center justify-center">
        <span className="block" style={{ transform: "rotate(5deg)", transformOrigin: "center" }}>
          <svg
            viewBox="0 0 60 72"
            className="h-20 w-20 drop-shadow-[0_8px_22px_-8px_rgba(0,0,0,0.55)]"
            aria-hidden
            style={{ animation: "loopRewardBob 2.4s ease-in-out infinite", transformOrigin: "center" }}
          >
            <path d="M30 1 L30 7" stroke="#d83bff" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M2 38 L8 38" stroke="#d83bff" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M58 38 L52 38" stroke="#d83bff" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M5 14 L10 18" stroke="#d83bff" strokeWidth="2" strokeLinecap="round" />
            <path d="M55 14 L50 18" stroke="#d83bff" strokeWidth="2" strokeLinecap="round" />
            <g style={{ transformBox: "fill-box", transformOrigin: "center", animation: "loopRewardSparkle 1.8s ease-in-out infinite" }}>
              <path d="M52 3 L53.6 7 L57.6 7 L54.4 9.6 L55.6 13.6 L52 11 L48.4 13.6 L49.6 9.6 L46.4 7 L50.4 7 Z" fill="rgba(216,59,255,0.22)" stroke="#0a1330" strokeWidth="1.4" strokeLinejoin="round" />
            </g>
            <g style={{ transformBox: "fill-box", transformOrigin: "center", animation: "loopRewardSparkle 2.2s ease-in-out 0.7s infinite" }}>
              <path d="M5 64 L6 66.4 L8.4 66.4 L6.4 68 L7.2 70.4 L5 69 L2.8 70.4 L3.6 68 L1.6 66.4 L4 66.4 Z" fill="#d83bff" stroke="#0a1330" strokeWidth="1.2" strokeLinejoin="round" />
            </g>
            <path d="M16 30 V20 a14 14 0 0 1 28 0 V30" fill="none" stroke="#0a1330" strokeWidth="6.5" strokeLinecap="round" />
            <path d="M16 30 V20 a14 14 0 0 1 28 0 V30" fill="none" stroke="#d83bff" strokeWidth="3" strokeLinecap="round" />
            <path d="M19 21 a11 11 0 0 1 8 -8" fill="none" stroke="#fff7d6" strokeWidth="1.4" strokeLinecap="round" opacity="0.95" />
            <rect x="6" y="28" width="48" height="42" rx="9" fill="#f59e0b" stroke="#0a1330" strokeWidth="2.6" />
            <rect x="11" y="33" width="38" height="32" rx="6" fill="#d97706" stroke="#0a1330" strokeWidth="1.8" />
            <circle cx="16" cy="38" r="0.9" fill="rgba(216,59,255,0.22)" opacity="0.7" />
            <circle cx="44" cy="40" r="0.9" fill="rgba(216,59,255,0.22)" opacity="0.7" />
            <circle cx="20" cy="60" r="0.9" fill="rgba(216,59,255,0.22)" opacity="0.7" />
            <circle cx="40" cy="60" r="0.9" fill="rgba(216,59,255,0.22)" opacity="0.7" />
            <circle cx="30" cy="34" r="0.8" fill="rgba(216,59,255,0.22)" opacity="0.7" />
            <path d="M11 36 L11 60" stroke="#d83bff" strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />
            <g style={{ transformBox: "fill-box", transformOrigin: "center", animation: "loopRewardSparkle 1.8s ease-in-out infinite" }}>
              <path d="M30 38 L33 46 L41 46 L34.5 51 L37 59 L30 54 L23 59 L25.5 51 L19 46 L27 46 Z" fill="rgba(216,59,255,0.22)" stroke="#0a1330" strokeWidth="1.8" strokeLinejoin="round" />
            </g>
            <circle cx="30" cy="50" r="2.2" fill="#3a2f6b" stroke="#0a1330" strokeWidth="1" />
          </svg>
        </span>
      </div>
    );
  }

  // boss
  return (
    <div data-loop-avatar className="relative flex h-[7.25rem] w-28 items-end justify-center overflow-visible sm:h-36 sm:w-32 md:h-44 md:w-40 lg:h-52 lg:w-48">
      <BossDuelHallBackdrop />
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0 h-3 w-[78%] rounded-full bg-[#7e3bff]/40 blur-[6px] z-[1]" aria-hidden />
      <EdgeScoreBossAvatar className="relative z-10 h-full w-full" />
    </div>
  );
}

// ─── Scene ──────────────────────────────────────────────────────────────────

const MAIN_PATH = "M 4 60 Q 16 25 34 60 T 80 60";
const UPPER_RAIL_PATH = "M 4 54 Q 16 19 34 54 T 80 54";
const LOWER_RAIL_PATH = "M 4 66 Q 16 31 34 66 T 80 66";
const LEAD_IN_PATH = "M 0 60 L 4 60";

export function LoopExpeditionScene({
  loop = CURATED_LOOPS[0],
  onStart,
}: {
  loop?: CuratedLoop;
  /** Fired when the player taps the START node. Optional — omit for a purely decorative scene. */
  onStart?: () => void;
}) {
  const n = loop.nodes.length;

  // Narrow viewports lay the expedition out vertically (a top→bottom climb)
  // instead of the horizontal track, so the wide node glyphs stop colliding.
  const [isVertical, setIsVertical] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsVertical(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const positions = useMemo(() => {
    const out: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      out.push(isVertical ? pointOnPathVertical(t) : pointOnPath(t));
    }
    return out;
  }, [n, isVertical]);

  // Vertical track geometry, generated from the node positions so the
  // decorative path threads through every node exactly.
  const vMainPath = useMemo(() => (isVertical ? smoothPath(positions) : ""), [isVertical, positions]);
  const vRailA = useMemo(() => (isVertical ? smoothPath(positions.map((p) => ({ x: p.x - 3, y: p.y }))) : ""), [isVertical, positions]);
  const vRailB = useMemo(() => (isVertical ? smoothPath(positions.map((p) => ({ x: p.x + 3, y: p.y }))) : ""), [isVertical, positions]);

  const mainPath = isVertical ? vMainPath : MAIN_PATH;
  const upperRail = isVertical ? vRailA : UPPER_RAIL_PATH;
  const lowerRail = isVertical ? vRailB : LOWER_RAIL_PATH;
  // Horizontal gets a short dashed lead-in before the start node; vertical
  // omits it — the start avatar rises above its node, so a lead-in from the
  // top edge would poke out above its head.
  const leadIn = isVertical ? "" : LEAD_IN_PATH;

  const handleStart = onStart ?? (() => {});

  // Vertical mode needs a tall, content-driven height; horizontal keeps the
  // original viewport-clamped band.
  const heightClass = isVertical
    ? "h-auto"
    : "h-[clamp(200px,42svh,260px)] sm:h-[clamp(232px,36svh,300px)] md:h-[clamp(280px,38svh,380px)] lg:h-[clamp(300px,40svh,440px)]";

  return (
    <div
      className={`relative mx-auto mt-0 ${heightClass} w-full max-w-full overflow-visible px-3 pb-12 pt-0 sm:px-4 sm:pb-16 md:px-5 md:pb-14`}
      style={isVertical ? { height: `${n * 142 + 28}px` } : undefined}
    >
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      {/* Atmospheric mists (arena brightness) */}
      {isVertical ? (
        <div
          className="pointer-events-none absolute inset-y-[2%] left-1/2 w-[72%] -translate-x-1/2 rounded-[45%] opacity-70 blur-2xl"
          style={{ background: "radial-gradient(ellipse at 50% 12%, rgba(216,59,255,0.26), transparent 30%), radial-gradient(ellipse at 50% 88%, rgba(126,59,255,0.24), transparent 36%)" }}
          aria-hidden
        />
      ) : (
        <>
          <div
            className="pointer-events-none absolute inset-x-[-3%] top-[2%] h-[58%] rounded-[40%] opacity-80 blur-2xl"
            style={{ background: "radial-gradient(ellipse at 68% 42%, rgba(216,59,255,0.28), transparent 34%), radial-gradient(ellipse at 20% 40%, rgba(126,59,255,0.22), transparent 38%)" }}
            aria-hidden
          />
          <div
            className="loop-journey-mist pointer-events-none absolute inset-x-[-4%] bottom-[12%] h-[36%] rounded-full blur-xl"
            style={{ background: "linear-gradient(90deg, transparent 0%, rgba(91,141,255,0.10) 16%, rgba(126,59,255,0.18) 54%, rgba(216,59,255,0.10) 82%, transparent 100%)" }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-[6%] bottom-[3%] h-[34%] rounded-[50%] opacity-45 blur-xl"
            style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(126,59,255,0.45), rgba(41,98,255,0.18) 42%, transparent 76%)" }}
            aria-hidden
          />
        </>
      )}

      {/* Path */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="loopJourneySky" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#1a0a35" stopOpacity="0" />
            <stop offset="48%" stopColor="#d83bff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#7e3bff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="builderArenaGlow" x1="0%" x2={isVertical ? "0%" : "100%"} y1="0%" y2={isVertical ? "100%" : "0%"}>
            <stop offset="0%" stopColor="#2962ff" stopOpacity="0.0" />
            <stop offset="12%" stopColor="#2962ff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#7e3bff" stopOpacity="1" />
            <stop offset="88%" stopColor="#d83bff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#d83bff" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {!isVertical && (
          <>
            <path d="M 4 72 C 18 50 31 45 45 56 S 70 68 96 36" stroke="url(#loopJourneySky)" strokeWidth="16" fill="none" strokeLinecap="round" opacity="0.42" />
            <path d="M 6 88 C 22 76 38 73 50 78 C 66 84 80 74 94 64" stroke="#0a1330" strokeOpacity="0.22" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M78 27 L89 18 L96 27 Z" fill="#1a0a35" opacity="0.42" />
            <path d="M8 50 L17 36 L25 51 Z" fill="#1a0a35" opacity="0.34" />
          </>
        )}

        {/* outer brand glow halo */}
        <path d={mainPath} stroke="#7e3bff" strokeOpacity="0.32" strokeWidth="18" fill="none" strokeLinecap="round" style={{ filter: "blur(2px)" }} />
        {/* dark void base track */}
        <path d={mainPath} stroke="#0a0716" strokeWidth="11" fill="none" strokeLinecap="round" />
        {/* upper guard rail — soft lilac dashes */}
        <path d={upperRail} stroke="#c8b5ff" strokeOpacity="0.32" strokeWidth="1.2" strokeDasharray="2 3.5" fill="none" strokeLinecap="round" />
        {/* lower guard rail — deep void shadow */}
        <path d={lowerRail} stroke="#1a0a35" strokeOpacity="0.9" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        {/* bright brand-gradient trace on top */}
        <path d={mainPath} stroke="url(#builderArenaGlow)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* HUD circuit dashes */}
        <path d={mainPath} stroke="#d83bff" strokeOpacity="0.72" strokeWidth="1" strokeDasharray="0.5 2.2" fill="none" strokeLinecap="round" />
        {/* runway approach lights — magenta-tinged white cascade */}
        <path d={mainPath} stroke="#f0d8ff" strokeOpacity="0.95" strokeWidth="1.6" strokeDasharray="1.5 6" fill="none" strokeLinecap="round" className="loop-path-arena-runway" style={{ filter: "drop-shadow(0 0 1.8px rgba(216, 59, 255, 0.95))" }} />
        {/* comet — full-length brand streak */}
        <path d={mainPath} stroke="#fff0ff" strokeWidth="2.4" strokeDasharray="4 96" fill="none" strokeLinecap="round" className="loop-path-comet" style={{ filter: "drop-shadow(0 0 5px rgba(216, 59, 255, 0.95))" }} />
        {/* dashed lead-in */}
        <path d={leadIn} stroke="#d83bff" strokeOpacity="0.85" strokeWidth="1.4" strokeDasharray="2 2" fill="none" strokeLinecap="round" />

        {/* distant spires + arcs */}
        {!isVertical && (
          <g opacity="0.88">
            <path d="M23 78 L28 68 L35 78 Z" fill="#1a0a35" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
            <path d="M25 78 L30 71 L33 78 Z" fill="#2a1858" opacity="0.75" />
            <path d="M72 33 L78 21 L87 33 Z" fill="#1a0a35" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" opacity="0.78" />
            <path d="M75 33 L80 25 L84 33 Z" fill="#2a1858" opacity="0.65" />
            <path d="M39 30 Q48 24 57 31" stroke="#d83bff" strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.42" fill="none" />
            <path d="M14 65 Q22 60 30 64" stroke="#d83bff" strokeWidth="0.9" strokeLinecap="round" strokeOpacity="0.32" fill="none" />
          </g>
        )}
      </svg>

      {/* Nodes */}
      {loop.nodes.map((node, i) => (
        <NodeWithHover
          key={node.id}
          node={node}
          index={i}
          pos={positions[i]}
          openAbove={!isVertical && i > 0 && positions[i].y > 50}
          onStart={handleStart}
        />
      ))}
    </div>
  );
}
