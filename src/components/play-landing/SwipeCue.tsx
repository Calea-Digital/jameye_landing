import { motion } from "framer-motion";

/**
 * Horizontal "swipe left" gesture cue: a fingertip dot glides across a
 * pill-shaped track leaving a soft trail, with chevrons pointing the way.
 * Replaces the pointing-hand glove wherever the interaction is a swipe.
 */
export function SwipeCue({ className = "", delay = 0.8 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`pointer-events-none flex items-center gap-2 ${className}`}
    >
      {/* chevrons */}
      <div className="flex items-center">
        {[0, 1, 2].map((i) => (
          <motion.svg
            key={i}
            width="10"
            height="14"
            viewBox="0 0 10 14"
            fill="none"
            className="-mr-1 text-white"
            animate={{ opacity: [0.15, 1, 0.15], x: [2, -2, 2] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.14 }}
          >
            <path d="M8 1 2 7l6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        ))}
      </div>

      {/* track + fingertip */}
      <div className="relative h-7 w-[72px] overflow-hidden rounded-full border border-white/25 bg-white/10 backdrop-blur-sm">
        {/* trail */}
        <motion.span
          className="absolute top-1/2 h-4 -translate-y-1/2 rounded-full"
          style={{
            right: 6,
            background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 100%)",
          }}
          animate={{ width: [0, 44, 0], opacity: [0, 0.9, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", times: [0, 0.55, 1] }}
        />
        {/* fingertip */}
        <motion.span
          className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.18),0_4px_14px_rgba(0,0,0,0.35)]"
          animate={{ left: [46, 4, 4, 46], scale: [0.85, 1, 1, 0.85], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: ["easeOut", "linear", "easeIn"],
            times: [0, 0.55, 0.75, 1],
          }}
        />
      </div>
    </motion.div>
  );
}

export default SwipeCue;
