import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Animated pointing hand cue — used everywhere we want the user to tap.
 */
export function TapHand({
  className = "",
  delay = 0.4,
  noBob = false,
}: {
  className?: string;
  delay?: number;
  noBob?: boolean;
}) {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        transform: "translateZ(0)",
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        isolation: "isolate",
      }}
      className={`pointer-events-none z-[70] flex flex-col items-center ${className}`}
    >
      <div className="relative flex h-14 w-14 items-center justify-center">
        {/* soft grounded shadow (cheap, no filter — avoids iOS repaint smears) */}
        <span
          className="pointer-events-none absolute bottom-0 h-3 w-9 rounded-full bg-black/35"
          style={{ transform: "translateZ(0)" }}
        />
        {/* hand — cartoon glove, index finger clearly pointing up */}
        <svg
          width="54"
          height="54"
          viewBox="0 0 120 120"
          style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
          className={`relative ${noBob ? "" : "tap-hand-bob"}`}
        >

          <defs>
            <linearGradient id="gloveBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E5E2EF" />
            </linearGradient>
            <linearGradient id="gloveCuff" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#D9D5E6" />
              <stop offset="100%" stopColor="#C8C4D8" />
            </linearGradient>
          </defs>

          <g stroke="#2A1B4A" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
            {/* index finger — extended, offset left so it's clearly the index, not middle */}
            <path
              d="M38 68 L38 22 C38 12 45 6 53 6 C61 6 68 12 68 22 L68 68 Z"
              fill="url(#gloveBody)"
            />

            {/* folded middle/ring/pinky knuckle bumps to the right of the index finger */}
            <path
              d="M68 58
                 C68 50 74 46 81 46 C88 46 94 51 94 58
                 L94 68
                 C94 74 89 78 82 78
                 L68 78 Z"
              fill="url(#gloveBody)"
            />

            {/* palm / main fist */}
            <path
              d="M28 68
                 C28 58 36 54 46 54
                 L86 58
                 C98 60 104 68 104 80
                 L104 92
                 C104 102 96 110 84 110
                 L50 110
                 C36 110 28 102 28 90 Z"
              fill="url(#gloveBody)"
            />

            {/* thumb — curved on the left side */}
            <path
              d="M30 78 C18 78 12 84 12 92 C12 100 18 106 30 106"
              fill="url(#gloveBody)"
            />

            {/* separation line between index and folded fingers */}
            <path d="M68 68 L68 78" strokeWidth="3.5" opacity="0.6" fill="none" />

            {/* knuckle creases on folded fingers */}
            <path d="M80 58 L80 68" strokeWidth="3" opacity="0.5" fill="none" />

            {/* cuff */}
            <path
              d="M36 108 L32 120 L92 120 L90 106"
              fill="url(#gloveCuff)"
            />
          </g>

          {/* highlight on index finger */}
          <ellipse cx="46" cy="24" rx="4" ry="10" fill="white" opacity="0.75" />
        </svg>

      </div>
    </motion.div>
  );
}

/**
 * Pulsing highlight ring around whatever the user should tap.
 */
export function TapHighlight({
  active = true,
  rounded = "rounded-2xl",
  children,
  className = "",
}: {
  active?: boolean;
  rounded?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {active && (
        <motion.span
          aria-hidden="true"
          className={`pointer-events-none absolute -inset-1 z-0 ${rounded} border-2 border-hud-magenta/80`}
          animate={{
            opacity: [0.35, 1, 0.35],
            boxShadow: [
              "0 0 0px rgba(236,72,153,0)",
              "0 0 26px rgba(236,72,153,0.55)",
              "0 0 0px rgba(236,72,153,0)",
            ],
          }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
