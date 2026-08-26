import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useFiqYou } from "./fiq-store";

const SEGMENTS = 30;
const MIN = 640;
const MAX = 999;

/**
 * Capsule-segment FIQ ring in the uploaded style. The score animates up AND
 * down toward the live value from the shared FIQ store, so it always matches
 * the leaderboard.
 */
export function FiqRing({ size = 260 }: { size?: number }) {
  const you = useFiqYou();
  const [score, setScore] = useState(you.fiq);
  const [burst, setBurst] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const from = score;
    const to = you.fiq;
    if (from === to) return;
    const DURATION = 900;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startedAt) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      setScore(Math.round(from + (to - from) * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else if (to > from) setBurst((b) => b + 1);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [you.fiq]);

  const progress = Math.max(0, Math.min(1, (score - MIN) / (MAX - MIN)));
  const lit = Math.round(progress * SEGMENTS);
  const delta = you.delta;

  const radius = size / 2 - 16;
  const capW = 12;
  const capH = Math.max(16, (2 * Math.PI * radius) / SEGMENTS - 6);


  return (
    <div
      className="relative select-none"
      style={{ width: size, height: size }}
      aria-label={`Forecasting IQ ${score}`}
    >
      {/* soft inner glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-6 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(236,72,153,0.22), rgba(99,102,241,0.14) 55%, transparent 72%)",
        }}
      />

      {/* capsule segments */}
      {Array.from({ length: SEGMENTS }).map((_, i) => {
        const deg = (i / SEGMENTS) * 360;
        const angle = (deg * Math.PI) / 180 - Math.PI / 2;
        const x = size / 2 + Math.cos(angle) * radius;
        const y = size / 2 + Math.sin(angle) * radius;
        const on = i < lit;
        const p = i / (SEGMENTS - 1);
        const litColor = `color-mix(in oklab, #EC4899 ${Math.round((1 - p) * 100)}%, #6366F1)`;
        return (
          <motion.span
            key={i}
            aria-hidden="true"
            className="absolute rounded-full"
            style={{
              left: x,
              top: y,
              width: capW,
              height: capH,
              marginLeft: -capW / 2,
              marginTop: -capH / 2,
              transform: `rotate(${deg}deg)`,
              background: on ? litColor : "rgba(255,255,255,0.14)",
              boxShadow: on ? `0 0 14px ${litColor}` : "none",
            }}
            animate={on ? { scale: [1.35, 1] } : { scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        );
      })}

      {/* shockwave on completion */}
      {burst > 0 ? (
        <motion.span
          key={burst}
          aria-hidden="true"
          className="pointer-events-none absolute inset-4 rounded-full border-2 border-[#EC4899]"
          initial={{ scale: 0.8, opacity: 0.9 }}
          animate={{ scale: 1.3, opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      ) : null}

      {/* centre score */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[0.6rem] font-black uppercase tracking-[0.34em] text-white/70">
          FIQ
        </span>
        <motion.span
          key={score}
          className="text-6xl font-black leading-none text-white"
          style={{
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.03em",
            textShadow: "0 0 18px rgba(236,72,153,0.55), 0 4px 0 rgba(11,11,24,0.55)",
          }}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.16 }}
        >
          {score}
        </motion.span>
        <motion.span
          key={`d-${delta}-${you.fiq}`}
          className={`mt-2.5 rounded-full px-4 py-1.5 text-base font-black uppercase tracking-widest text-white ${
            delta < 0
              ? "bg-gradient-to-r from-[#6366F1] to-[#22D3EE]"
              : "bg-gradient-to-r from-[#EC4899] to-[#6366F1]"
          }`}
          initial={{ y: delta < 0 ? -6 : 6, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {delta > 0 ? "▲ +" : delta < 0 ? "▼ " : "±"}
          {delta === 0 ? 0 : delta}
        </motion.span>

      </div>
    </div>
  );
}

export default FiqRing;
