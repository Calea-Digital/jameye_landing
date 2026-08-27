import { motion } from "framer-motion";

import explorer from "./assets/avatars/02-edge-score-explorer.svg?url";
import customizable from "./assets/avatars/03-duel-customizable-fighter.svg?url";
import rapidFighter from "./assets/avatars/04-rapid-duel-fighter.svg?url";

export type PodiumOpponent = {
  name: string;
  avatar: string;
  prize: string;
};

type PodiumItem = {
  place: number;
  name: string;
  avatar: string;
  prize: string;
  role: string;
  skew: number;
  accent: string;
  barBg: string;
  border: string;
  glow: string;
  textClass: string;
  mutedClass: string;
  dotColor: string;
  flex: number;
};

const CONFETTI_PALETTE = [
  {
    grad: "linear-gradient(135deg,#FEF3C7,#FDE68A 40%,#F59E0B 75%,#B45309)",
    glow: "0 0 8px rgba(253,230,138,0.65)",
  },
  {
    grad: "linear-gradient(135deg,#FBCFE8,#EC4899 55%,#9D174D)",
    glow: "0 0 8px rgba(236,72,153,0.7)",
  },
  {
    grad: "linear-gradient(135deg,#C7D2FE,#6366F1 55%,#312E81)",
    glow: "0 0 8px rgba(99,102,241,0.7)",
  },
  {
    grad: "linear-gradient(135deg,#FFFFFF,#E2E8F0 50%,#94A3B8)",
    glow: "0 0 7px rgba(226,232,240,0.55)",
  },
  {
    grad: "linear-gradient(135deg,#A7F3D0,#34D399 55%,#065F46)",
    glow: "0 0 8px rgba(52,211,153,0.55)",
  },
];

const SHAPES = ["rect", "ribbon", "dot", "shard"] as const;

const CONFETTI = Array.from({ length: 24 }).map((_, i) => {
  const p = CONFETTI_PALETTE[i % CONFETTI_PALETTE.length];
  const shape = SHAPES[i % SHAPES.length];
  const big = i % 6 === 0;
  return {
    left: (i * 3.8 + ((i * 17) % 11)) % 96,
    delay: (i % 7) * 0.22,
    dur: 3.2 + ((i * 5) % 4) * 0.45,
    flip: 0.6 + ((i * 2) % 4) * 0.18,
    sway: `${6 + ((i * 3) % 14)}px`,
    rot0: `${(i * 47) % 360}deg`,
    spin: `${(i % 2 ? 1 : -1) * (360 + (i % 4) * 180)}deg`,
    w: shape === "dot" ? (big ? 5 : 3) : shape === "ribbon" ? 3 : big ? 6 : 4,
    h:
      shape === "dot"
        ? big
          ? 5
          : 3
        : shape === "ribbon"
          ? big
            ? 14
            : 10
          : big
            ? 9
            : 6,
    shape,
    grad: p.grad,
    glow: p.glow,
  };
});

function fmtUsd(n: number) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function PrizePodium({
  playerAvatar = customizable,
  playerName = "YOU",
  prizeShare,
  prizePool = 500,
  leftOpponent = { name: "Nova", avatar: explorer, prize: "" },
  rightOpponent = { name: "Rio", avatar: rapidFighter, prize: "" },
  label = "TOURNAMENT PAYOUT",
  subtext = "Cash prizes, merch & partner rewards",
  showSubtext = true,
  align = "bottom",
  className,
}: {
  playerAvatar?: string;
  playerName?: string;
  prizeShare?: string;
  prizePool?: number;
  leftOpponent?: PodiumOpponent;
  rightOpponent?: PodiumOpponent;
  label?: string;
  subtext?: string;
  showSubtext?: boolean;
  align?: "bottom" | "center";
  className?: string;
}) {
  const first = prizeShare ?? fmtUsd(prizePool * 0.5);
  const second = fmtUsd(prizePool * 0.3);
  const third = fmtUsd(prizePool * 0.2);

  const podium: PodiumItem[] = [
    {
      place: 2,
      name: leftOpponent.name,
      avatar: leftOpponent.avatar,
      prize: leftOpponent.prize || second,
      role: "Runner Up",
      skew: -4,
      accent: "#818CF8",
      barBg: "rgba(99,102,241,0.28)",
      border: "rgba(129,140,248,0.85)",
      glow: "rgba(99,102,241,0.55)",
      textClass: "text-[#A5B4FC]",
      mutedClass: "text-[#818CF8]/80",
      dotColor: "#A5B4FC",
      flex: 1,
    },
    {
      place: 1,
      name: playerName,
      avatar: playerAvatar,
      prize: first,
      role: "Winner",
      skew: -2,
      accent: "#F472B6",
      barBg: "rgba(236,72,153,0.30)",
      border: "rgba(244,114,182,0.95)",
      glow: "rgba(236,72,153,0.65)",
      textClass: "text-white",
      mutedClass: "text-[#FBCFE8]",
      dotColor: "#F472B6",
      flex: 1.15,
    },
    {
      place: 3,
      name: rightOpponent.name,
      avatar: rightOpponent.avatar,
      prize: rightOpponent.prize || third,
      role: "Finalist",
      skew: -6,
      accent: "#CBD5E1",
      barBg: "rgba(255,255,255,0.16)",
      border: "rgba(255,255,255,0.55)",
      glow: "rgba(255,255,255,0.30)",
      textClass: "text-white",
      mutedClass: "text-white/70",
      dotColor: "#E2E8F0",
      flex: 1,
    },
  ];

  return (
    <div className={`relative flex flex-col items-center ${className ?? ""}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[22%] h-56 bg-[radial-gradient(ellipse_at_50%_70%,rgba(236,72,153,0.22),transparent_70%)] blur-2xl"
      />

      {/* confetti */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {CONFETTI.map((c, i) => (
          <span
            key={`c-${i}`}
            className="confetti-piece absolute top-0"
            style={{
              left: `${c.left}%`,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.dur}s`,
              ["--cf-sway" as string]: c.sway,
              ["--cf-rot0" as string]: c.rot0,
              ["--cf-spin" as string]: c.spin,
            }}
          >
            <span
              className="confetti-face"
              style={{
                height: c.h,
                width: c.w,
                animationDelay: `${c.delay}s`,
                borderRadius: c.shape === "dot" ? "9999px" : c.shape === "ribbon" ? "9999px" : "1px",
                transform: c.shape === "shard" ? "skewX(-18deg)" : undefined,
                backgroundImage: c.grad,
                boxShadow: c.glow,
              }}
            />
          </span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative z-10 mt-1 rounded-full bg-gradient-to-r from-[#EC4899] to-[#6366F1] px-3 py-1 shadow-[0_12px_30px_-12px_rgba(236,72,153,0.9)]"
      >
        <span className="block font-heavy text-[0.6rem] uppercase tracking-[0.08em] text-white">
          {label}
        </span>
      </motion.div>

      <div
        className={`relative z-10 flex h-auto w-full max-w-[280px] items-end justify-center gap-2 sm:gap-3 ${align === "bottom" ? "mt-auto" : "mt-0"}`}
      >
        {podium.map((p, i) => {
          const isFirst = p.place === 1;
          return (
            <div key={p.place} className="flex flex-col items-center" style={{ flex: p.flex }}>
              {/* Avatar + name + prize */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.2 + i * 0.12,
                  type: "spring",
                  stiffness: 220,
                  damping: 15,
                }}
                className="mb-2 flex flex-col items-center text-center"
              >
                <motion.img
                  src={p.avatar}
                  alt=""
                  aria-hidden="true"
                  className={`w-auto ${isFirst ? "h-12 sm:h-14" : "h-9 sm:h-10"}`}
                  style={{ filter: `drop-shadow(0 4px 10px ${p.glow})` }}
                  animate={
                    isFirst
                      ? { y: [0, -6, 0, -4, 0], scale: [1, 1.04, 1] }
                      : undefined
                  }
                  transition={
                    isFirst
                      ? {
                          duration: 1.6,
                          repeat: Infinity,
                          repeatDelay: 0.4,
                          ease: "easeInOut",
                          delay: 0.8,
                        }
                      : undefined
                  }
                />
                <p
                  className={`mt-1 max-w-full truncate whitespace-nowrap text-[0.6rem] font-bold uppercase tracking-[-0.02em] ${p.textClass}`}
                >
                  {p.name}
                </p>
                <p className={`text-[0.65rem] font-mono font-semibold ${p.mutedClass}`}>{p.prize}</p>
              </motion.div>

              {/* Bar */}
              <div
                className={`relative w-full overflow-hidden ${isFirst ? "h-48 sm:h-64" : p.place === 2 ? "h-32 sm:h-40" : "h-24 sm:h-32"}`}
                style={{ transform: `skewX(${p.skew}deg)` }}
              >
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "100%", opacity: 1 }}
                  transition={{ delay: 0.35 + i * 0.15, duration: 0.55, ease: "easeOut" }}
                  className="absolute bottom-0 w-full overflow-hidden rounded-t-lg sm:rounded-t-xl border-x border-t backdrop-blur-md"
                  style={{
                    backgroundColor: p.barBg,
                    borderColor: p.border,
                    borderTopWidth: isFirst ? 2 : 1,
                    boxShadow: isFirst ? `0 0 30px -8px ${p.glow}` : undefined,
                  }}
                >
                  {/* Dot grid texture */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 opacity-[0.12]"
                    style={{
                      backgroundImage: `radial-gradient(circle, ${p.dotColor} 1px, transparent 1px)`,
                      backgroundSize: "8px 8px",
                    }}
                  />

                  {/* Top glow line (first place) */}
                  {isFirst && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#EC4899] to-transparent"
                    />
                  )}

                  {/* Corner bracket */}
                  <span
                    aria-hidden="true"
                    className="absolute top-2 right-2"
                    style={{
                      width: isFirst ? 16 : 10,
                      height: isFirst ? 16 : 10,
                      borderTop: `1.5px solid ${p.border}`,
                      borderRight: `1.5px solid ${p.border}`,
                    }}
                  />

                  {/* Counter-skewed rank number */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ transform: `skewX(${-p.skew}deg)` }}
                  >
                    <span
                      aria-hidden="true"
                      className={`font-heavy italic leading-none ${isFirst ? "text-[2.2rem] sm:text-[2.8rem]" : "text-[1.6rem] sm:text-[2rem]"}`}
                      style={{
                        color: isFirst ? "rgba(236,72,153,0.55)" : "rgba(255,255,255,0.18)",
                        WebkitTextStroke: isFirst ? "1px rgba(255,255,255,0.25)" : "1px rgba(255,255,255,0.12)",
                      }}
                    >
                      {p.place}
                    </span>
                  </div>

                  {/* Animated scanline (first place) */}
                  {isFirst && (
                    <motion.span
                      aria-hidden="true"
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.12), transparent)",
                      }}
                      initial={{ y: "-100%" }}
                      animate={{ y: "200%" }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay: 1 }}
                    />
                  )}

                  {/* Shine sweep */}
                  <motion.span
                    aria-hidden="true"
                    className="absolute -inset-y-6 w-8 -skew-x-[18deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)]"
                    initial={{ left: "-40%" }}
                    animate={{ left: ["-40%", "140%"] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      repeatDelay: 2.8,
                      delay: 1.2,
                      ease: "easeIn",
                    }}
                  />
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Decorative grid base */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.9, duration: 0.6, ease: "easeOut" }}
        className="relative z-10 mt-3 h-px w-full max-w-[260px] bg-gradient-to-r from-transparent via-[#6366F1]/50 to-transparent"
      />

      {showSubtext ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="relative z-10 mb-3 mt-3 px-2 text-center text-[0.65rem] font-semibold leading-snug tracking-wide text-white/55"
        >
          {subtext}
        </motion.p>
      ) : null}
    </div>
  );
}
