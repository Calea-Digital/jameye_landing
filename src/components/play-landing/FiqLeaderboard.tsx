import { useMemo } from "react";
import { motion } from "framer-motion";
import { useFiqPlayers } from "./fiq-store";

/** Live ranking board where avatars swap rows as their FIQ drifts. */
export function FiqLeaderboard() {
  const players = useFiqPlayers();

  const ranked = useMemo(() => [...players].sort((a, b) => b.fiq - a.fiq), [players]);
  const max = ranked[0]?.fiq ?? 999;


  return (
    <div className="w-full max-w-sm space-y-1.5 sm:space-y-2">
      {ranked.map((p, i) => {
        const isYou = p.id === "you";
        return (
          <motion.div
            key={p.id}
            layout
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className={`relative flex items-center gap-2.5 overflow-hidden rounded-2xl border px-2.5 py-1.5 sm:gap-3 sm:px-3 sm:py-2 ${
              isYou
                ? "border-[#EC4899]/70 bg-white/10"
                : "border-white/15 bg-white/5"
            }`}
          >
            <motion.div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#EC4899]/35 to-[#6366F1]/10"
              animate={{ width: `${(p.fiq / max) * 100}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
            <span className="relative w-5 text-sm font-black text-white/70">{i + 1}</span>
            <img src={p.avatar} alt="" aria-hidden="true" className="relative h-7 w-auto sm:h-9" />
            <span className="relative flex-1 text-xs font-black uppercase tracking-widest text-white">
              {p.name}
            </span>
            <span
              className="relative text-lg font-black text-white"
              style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}
            >
              {p.fiq}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

export default FiqLeaderboard;
