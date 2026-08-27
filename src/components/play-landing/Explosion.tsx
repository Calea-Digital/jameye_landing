import { Fragment, useMemo } from "react";
import { motion } from "framer-motion";

import { useIsMobile } from "./use-mobile";

const DEFAULT_DELAY = 0.15;
const PULSE_COUNT = 3;

/** GPU hints — keeps iOS Safari from repainting on the CPU. */
const GPU = {
  willChange: "transform, opacity",
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
} as const;

export function Explosion({
  delay = DEFAULT_DELAY,
  label = "SMARTEST PERSON ALIVE!",
}: {
  delay?: number;
  label?: string;
}) {
  const BOOM = delay;
  const isMobile = useIsMobile();

  // Scale particle counts down hard on phones — iOS chokes long before desktop.
  const n = useMemo(() => {
    const q = isMobile ? 0.4 : 1;
    return (base: number) => Math.max(3, Math.round(base * q));
  }, [isMobile]);

  const glow = (color: string, size = 8) => (isMobile ? undefined : `0 0 ${size}px ${color}`);

  return (
    <motion.div
      aria-hidden="true"
      animate={{ x: [0, -6, 6, -4, 3, 0], y: [0, 4, -5, 3, -2, 0] }}
      transition={{ delay: BOOM, duration: 0.55, ease: "easeOut" }}
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
      style={GPU}
    >
      {/* full-frame flash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.25, 0] }}
        transition={{ delay: BOOM, duration: 0.7, ease: "easeOut" }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(255,255,255,1),rgba(236,72,153,0.55)_38%,rgba(99,102,241,0.3)_50%,transparent_62%)]"
        style={{ willChange: "opacity" }}
      />

      {/* anamorphic lens streak */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1.6, 0.9, 0], opacity: [0, 1, 0.5, 0] }}
        transition={{ delay: BOOM, duration: 0.85, ease: "easeOut" }}
        className="absolute left-1/2 top-[44%] h-[6px] w-full rounded-full bg-[linear-gradient(90deg,transparent,rgba(99,102,241,0.9),rgba(255,255,255,1),rgba(236,72,153,0.9),transparent)]"
        style={{ ...GPU, x: "-50%", y: "-50%" }}
      />

      {/* rotating star burst */}
      <motion.div
        initial={{ scale: 0.2, rotate: 0, opacity: 0 }}
        animate={{ scale: [0.2, 1.9, 2.4], rotate: [0, 40], opacity: [0, 0.9, 0] }}
        transition={{ delay: BOOM, duration: 1.05, ease: "easeOut" }}
        className="absolute left-1/2 top-[44%] h-40 w-40"
        style={{
          ...GPU,
          x: "-50%",
          y: "-50%",
          background:
            "conic-gradient(from 0deg, rgba(255,255,255,0.9) 0deg 6deg, transparent 6deg 45deg, rgba(236,72,153,0.8) 45deg 51deg, transparent 51deg 90deg, rgba(255,255,255,0.9) 90deg 96deg, transparent 96deg 135deg, rgba(99,102,241,0.8) 135deg 141deg, transparent 141deg 180deg, rgba(255,255,255,0.9) 180deg 186deg, transparent 186deg 225deg, rgba(236,72,153,0.8) 225deg 231deg, transparent 231deg 270deg, rgba(255,255,255,0.9) 270deg 276deg, transparent 276deg 315deg, rgba(99,102,241,0.8) 315deg 321deg, transparent 321deg 360deg)",
          maskImage: "radial-gradient(circle, #000 20%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(circle, #000 20%, transparent 72%)",
        }}
      />

      {/* pulsing core fireballs */}
      {Array.from({ length: isMobile ? 2 : PULSE_COUNT }).map((_, i) => (
        <motion.div
          key={`pulse-${i}`}
          initial={{ scale: 0.1, opacity: 0 }}
          animate={{ scale: [0.1, 1.5, 2.6], opacity: [0, 1, 0] }}
          transition={{
            delay: BOOM + i * 0.32,
            duration: 1,
            ease: "easeOut",
          }}
          className="absolute left-1/2 top-[44%] h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,1)_0%,rgba(255,214,240,0.95)_22%,rgba(236,72,153,0.75)_44%,rgba(99,102,241,0.4)_68%,rgba(99,102,241,0)_80%)]"
          style={{ ...GPU, x: "-50%", y: "-50%" }}
        />
      ))}

      {/* shockwave rings */}
      {[0, 0.14, 0.3].map((d, i) => (
        <motion.div
          key={`ring-${i}`}
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: [0.2, 2.2], opacity: [0.9, 0] }}
          transition={{ delay: BOOM + d, duration: 0.95, ease: "easeOut" }}
          className="absolute left-1/2 top-[44%] h-32 w-32 rounded-full border-2"
          style={{
            ...GPU,
            x: "-50%",
            y: "-50%",
            borderColor: i === 1 ? "rgba(236,72,153,0.8)" : "rgba(255,255,255,0.65)",
          }}
        />
      ))}

      {/* flat elliptical ground wave */}
      <motion.div
        initial={{ scaleX: 0.2, scaleY: 0.2, opacity: 0 }}
        animate={{ scaleX: [0.2, 2.6], scaleY: [0.2, 0.7], opacity: [0.8, 0] }}
        transition={{ delay: BOOM + 0.05, duration: 0.9, ease: "easeOut" }}
        className="absolute left-1/2 top-[44%] h-24 w-40 rounded-full border border-[#6366F1]/70"
        style={{ ...GPU, x: "-50%", y: "-50%" }}
      />

      {/* radial light spikes */}
      {Array.from({ length: n(20) }).map((_, i, arr) => (
        <motion.span
          key={`spike-${i}`}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ delay: BOOM, duration: 0.6, ease: "easeOut" }}
          className="absolute left-1/2 top-[44%] h-24 w-[3px]"
          style={{
            ...GPU,
            x: "-50%",
            y: "-100%",
            rotate: (i / arr.length) * 360,
            transformOrigin: "50% 100%",
            backgroundImage: `linear-gradient(180deg, transparent, ${
              i % 2 ? "#6366F1" : "#EC4899"
            })`,
          }}
        />
      ))}

      {/* shards */}
      {Array.from({ length: n(40) }).map((_, i, arr) => {
        const a = (i / arr.length) * Math.PI * 2 + 0.2;
        const dist = 90 + (i % 6) * 26;
        return (
          <motion.span
            key={`shard-${i}`}
            initial={{ x: "-50%", y: "-50%", opacity: 0, scale: 0.3, rotate: 0 }}
            animate={{
              x: `calc(-50% + ${Math.cos(a) * dist}px)`,
              y: `calc(-50% + ${Math.sin(a) * dist}px)`,
              rotate: 180 + i * 24,
              opacity: [0, 1, 0],
              scale: [0.3, 1, 0.4],
            }}
            transition={{ delay: BOOM + 0.05, duration: 1.1, ease: "easeOut" }}
            className="absolute left-1/2 top-[44%] h-3 w-1.5 skew-x-[-14deg]"
            style={{
              ...GPU,
              backgroundColor: i % 3 === 0 ? "#FFFFFF" : i % 3 === 1 ? "#EC4899" : "#6366F1",
            }}
          />
        );
      })}

      {/* sparks */}
      {Array.from({ length: n(70) }).map((_, i, arr) => {
        const a = (i / arr.length) * Math.PI * 2;
        const dist = 70 + ((i * 37) % 90);
        const size = i % 3 === 0 ? 3 : 2;
        const color = i % 4 === 0 ? "#FFFFFF" : i % 2 ? "#6366F1" : "#EC4899";
        return (
          <motion.span
            key={`spark-${i}`}
            initial={{ x: "-50%", y: "-50%", opacity: 0, scale: 0.4 }}
            animate={{
              x: `calc(-50% + ${Math.cos(a) * dist}px)`,
              y: `calc(-50% + ${Math.sin(a) * dist + 26}px)`,
              opacity: [0, 1, 0],
              scale: [0.4, 1, 0.2],
            }}
            transition={{
              delay: BOOM + 0.08 + (i % 5) * 0.04,
              duration: 1.25,
              ease: "easeOut",
            }}
            className="absolute left-1/2 top-[44%] rounded-full"
            style={{
              ...GPU,
              height: size,
              width: size,
              backgroundColor: color,
              boxShadow: glow(i % 2 ? "#6366F1" : "#EC4899"),
            }}
          />
        );
      })}

      {/* smoke puffs */}
      {Array.from({ length: n(10) }).map((_, i, arr) => {
        const a = (i / arr.length) * Math.PI * 2;
        return (
          <motion.span
            key={`smoke-${i}`}
            initial={{ x: "-50%", y: "-50%", opacity: 0, scale: 0.3 }}
            animate={{
              x: `calc(-50% + ${Math.cos(a) * 54}px)`,
              y: `calc(-50% + ${Math.sin(a) * 40 - 10}px)`,
              opacity: [0, 0.4, 0],
              scale: [0.3, 1.5],
            }}
            transition={{ delay: BOOM + 0.1, duration: 1.4, ease: "easeOut" }}
            className="absolute left-1/2 top-[44%] h-12 w-12 rounded-full bg-white/25"
            style={{ ...GPU, filter: isMobile ? undefined : "blur(12px)" }}
          />
        );
      })}

      {/* fireworks bursts */}
      {Array.from({ length: n(8) }).map((_, i, arr) => {
        const a = (i / arr.length) * Math.PI * 2;
        const dist = 88 + (i % 4) * 30;
        const color = i % 3 === 0 ? "#EC4899" : i % 3 === 1 ? "#6366F1" : "#F59E0B";
        return (
          <Fragment key={`firework-${i}`}>
            {Array.from({ length: isMobile ? 6 : 12 }).map((_, j, jarr) => {
              const ja = a + (j / jarr.length) * Math.PI * 2;
              const jd = 28 + (j % 3) * 12;
              return (
                <motion.span
                  key={`fw-${i}-${j}`}
                  initial={{
                    x: `calc(-50% + ${Math.cos(a) * dist}px)`,
                    y: `calc(-50% + ${Math.sin(a) * dist}px)`,
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    x: `calc(-50% + ${Math.cos(a) * dist + Math.cos(ja) * jd}px)`,
                    y: `calc(-50% + ${Math.sin(a) * dist + Math.sin(ja) * jd}px)`,
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.2],
                  }}
                  transition={{
                    delay: BOOM + 0.18 + i * 0.1,
                    duration: 0.9,
                    ease: "easeOut",
                  }}
                  className="absolute left-1/2 top-[44%] h-1.5 w-1.5 rounded-full"
                  style={{ ...GPU, backgroundColor: color, boxShadow: glow(color, 10) }}
                />
              );
            })}
          </Fragment>
        );
      })}

      {/* manga speed lines behind the word */}
      {Array.from({ length: n(30) }).map((_, i, arr) => (
        <motion.span
          key={`ml-${i}`}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: [0, 1, 0.7, 0], opacity: [0, 1, 0.8, 0] }}
          transition={{ delay: BOOM, duration: 1, ease: "easeOut" }}
          className="absolute left-1/2 top-[44%] h-[4.6rem] w-[2px] bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.85))]"
          style={{
            ...GPU,
            x: "-50%",
            y: "-100%",
            rotate: (i / arr.length) * 360,
            transformOrigin: "50% 100%",
          }}
        />
      ))}

      {/* manga impact burst */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0, rotate: -12 }}
        animate={{
          scale: [0.3, 1.3, 1.06, 1.08, 1.08, 1.14],
          opacity: [0, 1, 1, 1, 1, 0],
          rotate: [-12, -8, -8, -8, -8, -8],
        }}
        transition={{
          delay: BOOM + 0.02,
          duration: 3.4,
          times: [0, 0.09, 0.16, 0.24, 0.85, 1],
          ease: "easeOut",
        }}
        className="absolute left-1/2 top-[28%] w-full"
        style={{ ...GPU, x: "-50%", y: "-50%" }}
      >
        <span className="relative mx-auto block w-fit max-w-full skew-x-[-10deg] text-center font-heavy text-[1.9rem] leading-[0.9] tracking-tighter whitespace-normal sm:text-[2.3rem]">
          {[
            { c: "text-[#312E81]", x: 7, y: 7, blur: "blur-[2px]" },
            { c: "text-[#6366F1]", x: 5, y: 5, blur: "" },
            { c: "text-[#BE185D]", x: -4, y: -4, blur: "" },
            { c: "text-[#EC4899]", x: -2, y: -2, blur: "" },
          ].map((l, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`absolute inset-0 ${l.c} ${l.blur}`}
              style={{ transform: `translate(${l.x}px, ${l.y}px)` }}
            >
              {label}
            </span>
          ))}
          <span className="relative bg-[linear-gradient(180deg,#FFFFFF_0%,#FFF3FA_38%,#FBCFE8_58%,#FFFFFF_100%)] bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(236,72,153,0.95)]">
            {label}
          </span>
        </span>
      </motion.div>

      {/* falling embers */}
      {Array.from({ length: n(28) }).map((_, i) => (
        <motion.span
          key={`ember-${i}`}
          initial={{ x: "-50%", y: "-50%", opacity: 0 }}
          animate={{
            x: `calc(-50% + ${((i % 5) - 2) * 34 + (i % 2 ? 10 : -10)}px)`,
            y: `calc(-50% + ${60 + (i % 4) * 26}px)`,
            opacity: [0, 1, 0],
          }}
          transition={{
            delay: BOOM + 0.35 + (i % 5) * 0.09,
            duration: 1.6,
            ease: "easeIn",
          }}
          className="absolute left-1/2 top-[44%] h-1 w-1 rounded-full"
          style={{
            ...GPU,
            backgroundColor: i % 3 === 0 ? "#F59E0B" : i % 3 === 1 ? "#EC4899" : "#FFFFFF",
            boxShadow: glow(i % 3 === 1 ? "#EC4899" : "#F59E0B", 10),
          }}
        />
      ))}

      {/* halftone dot field — desktop only */}
      {!isMobile &&
        Array.from({ length: 44 }).map((_, i) => {
          const a = (i / 44) * Math.PI * 2 + (i % 3) * 0.3;
          const dist = 40 + ((i * 53) % 130);
          const size = 2 + (i % 4) * 2;
          return (
            <motion.span
              key={`halftone-${i}`}
              initial={{ x: "-50%", y: "-50%", opacity: 0, scale: 0 }}
              animate={{
                x: `calc(-50% + ${Math.cos(a) * dist}px)`,
                y: `calc(-50% + ${Math.sin(a) * dist}px)`,
                opacity: [0, 0.85, 0],
                scale: [0, 1, 0.3],
              }}
              transition={{ delay: BOOM + 0.04 + (i % 6) * 0.05, duration: 1.3, ease: "easeOut" }}
              className="absolute left-1/2 top-[44%] rounded-full"
              style={{
                ...GPU,
                height: size,
                width: size,
                backgroundColor:
                  i % 5 === 0 ? "#FFFFFF" : i % 2 ? "rgba(236,72,153,0.85)" : "rgba(99,102,241,0.85)",
              }}
            />
          );
        })}

      {/* chromatic aberration ghost rings */}
      {[
        { c: "rgba(236,72,153,0.55)", d: 0 },
        { c: "rgba(94,234,212,0.5)", d: 0.07 },
        { c: "rgba(99,102,241,0.5)", d: 0.14 },
        { c: "rgba(255,255,255,0.5)", d: 0.21 },
        { c: "rgba(245,158,11,0.45)", d: 0.28 },
      ]
        .slice(0, isMobile ? 3 : 5)
        .map((r, i) => (
          <motion.div
            key={`chroma-${i}`}
            initial={{ scale: 0.15, opacity: 0 }}
            animate={{ scale: [0.15, 2.9], opacity: [0.9, 0] }}
            transition={{ delay: BOOM + r.d, duration: 1.2, ease: "easeOut" }}
            className="absolute left-1/2 top-[44%] h-28 w-28 rounded-full border"
            style={{ ...GPU, x: "-50%", y: "-50%", borderColor: r.c }}
          />
        ))}

      {/* secondary delayed detonations */}
      {[
        { x: -78, y: -46, d: 0.42 },
        { x: 84, y: -30, d: 0.56 },
        { x: -58, y: 54, d: 0.7 },
        { x: 66, y: 62, d: 0.84 },
      ]
        .slice(0, isMobile ? 2 : 4)
        .map((s2, i) => (
          <Fragment key={`sec-${i}`}>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 2.1], opacity: [0, 1, 0] }}
              transition={{ delay: BOOM + s2.d, duration: 0.8, ease: "easeOut" }}
              className="absolute left-1/2 top-[44%] h-16 w-16 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,1),rgba(236,72,153,0.7)_45%,transparent_72%)]"
              style={{ ...GPU, x: `calc(-50% + ${s2.x}px)`, y: `calc(-50% + ${s2.y}px)` }}
            />
            {Array.from({ length: isMobile ? 5 : 8 }).map((_, j, jarr) => {
              const a = (j / jarr.length) * Math.PI * 2;
              return (
                <motion.span
                  key={`sec-${i}-${j}`}
                  initial={{
                    x: `calc(-50% + ${s2.x}px)`,
                    y: `calc(-50% + ${s2.y}px)`,
                    opacity: 0,
                    scale: 0.2,
                  }}
                  animate={{
                    x: `calc(-50% + ${s2.x + Math.cos(a) * 44}px)`,
                    y: `calc(-50% + ${s2.y + Math.sin(a) * 44}px)`,
                    opacity: [0, 1, 0],
                    scale: [0.2, 1, 0.2],
                  }}
                  transition={{ delay: BOOM + s2.d, duration: 0.9, ease: "easeOut" }}
                  className="absolute left-1/2 top-[44%] h-1.5 w-1.5 rounded-full"
                  style={{
                    ...GPU,
                    backgroundColor: j % 2 ? "#6366F1" : "#FFFFFF",
                    boxShadow: glow("rgba(236,72,153,0.9)"),
                  }}
                />
              );
            })}
          </Fragment>
        ))}

      {/* glitter twinkles */}
      {Array.from({ length: n(26) }).map((_, i, arr) => {
        const a = (i / arr.length) * Math.PI * 2 + 0.6;
        const dist = 55 + ((i * 41) % 120);
        return (
          <motion.span
            key={`twinkle-${i}`}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.1, 0], rotate: [0, 90] }}
            transition={{ delay: BOOM + 0.2 + (i % 8) * 0.08, duration: 0.9, ease: "easeOut" }}
            className="absolute left-1/2 top-[44%]"
            style={{
              ...GPU,
              x: `calc(-50% + ${Math.cos(a) * dist}px)`,
              y: `calc(-50% + ${Math.sin(a) * dist}px)`,
            }}
          >
            <span
              className="block h-3 w-3"
              style={{
                background: i % 3 === 0 ? "#FFFFFF" : i % 3 === 1 ? "#5EEAD4" : "#FDE68A",
                clipPath:
                  "polygon(50% 0%, 58% 42%, 100% 50%, 58% 58%, 50% 100%, 42% 58%, 0% 50%, 42% 42%)",
              }}
            />
          </motion.span>
        );
      })}

      {/* dust ring on the floor */}
      {[0, 0.18, 0.36].slice(0, isMobile ? 2 : 3).map((d, i) => (
        <motion.div
          key={`dust-${i}`}
          initial={{ scaleX: 0.2, scaleY: 0.1, opacity: 0 }}
          animate={{ scaleX: [0.2, 3.2], scaleY: [0.1, 0.55], opacity: [0.5, 0] }}
          transition={{ delay: BOOM + d, duration: 1.2, ease: "easeOut" }}
          className="absolute left-1/2 top-[52%] h-16 w-44 rounded-full bg-white/15"
          style={{ ...GPU, x: "-50%", y: "-50%", filter: isMobile ? undefined : "blur(12px)" }}
        />
      ))}

    </motion.div>
  );
}
