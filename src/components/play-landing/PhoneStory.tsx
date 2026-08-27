import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Explosion } from "./Explosion";

import customizable from "./assets/avatars/03-duel-customizable-fighter.svg?url";
import rapidFighter from "./assets/avatars/04-rapid-duel-fighter.svg?url";
import squadRival from "./assets/avatars/09-squad-row2-rival.svg?url";

import { CARDS, Card, type MarketCard } from "./MarketMosaic";

const SCENES = [6000, 5400, 6200];

const STORY_TITLES = [
  "Where will Enzo Fernandez transfer?",
  "Pro Football: 2027 Champion",
];

const STORY_CARDS: MarketCard[] = STORY_TITLES.map(
  (t) => CARDS.find((c) => c.title === t)!,
).filter(Boolean);

function StepLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex w-fit max-w-full items-center justify-center self-center whitespace-nowrap rounded-full bg-white/20 px-2.5 py-1 text-center text-[0.65rem] font-bold uppercase leading-tight tracking-wider text-white backdrop-blur-sm sm:px-3 sm:text-xs"
    >
      {children}
    </motion.div>
  );
}

/* ---------------- scene 1 : market cards ---------------- */

function SceneMarkets({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(false);

  /* Auto-play: card slides in → outcome gets picked → next card → hand over. */
  useEffect(() => {
    const t = setTimeout(
      () => {
        if (!picked) {
          setPicked(true);
        } else if (index < STORY_CARDS.length - 1) {
          setIndex((i) => i + 1);
          setPicked(false);
        } else {
          onDone();
        }
      },
      picked ? 1400 : 1900,
    );
    return () => clearTimeout(t);
  }, [index, picked, onDone]);

  const card = STORY_CARDS[index];

  return (
    <div
      className="flex h-full flex-col justify-center gap-3 overflow-hidden px-4"
    >
      <StepLabel>01 — Forecast</StepLabel>
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ x: 250, rotate: 9, opacity: 0 }}
            animate={{ x: 0, rotate: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0, transition: { duration: 0.4 } }}
            transition={{ duration: 0.85, ease: [0.22, 0.68, 0.16, 1] }}
            className="w-full"
          >
            <Card
              card={card}
              pick={picked ? index % (card.outcomes?.length ?? 1) : null}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}



/* ---------------- scene 2 : duel + explosion ---------------- */

const BOOM = 2.3;

function SceneDuel() {
  return (
    <div className="relative flex h-full flex-col px-5 py-2">
      <StepLabel>02 — Compete</StepLabel>

      <div className="relative mt-6 flex-1">
        <div className="relative flex w-full items-end justify-between pt-10">
          <motion.img
            src={rapidFighter}
            alt=""
            aria-hidden="true"
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: [-60, 0, 16, 0, -140], opacity: [0, 1, 1, 1, 0] }}
            transition={{ times: [0, 0.2, 0.42, 0.52, 0.72], duration: 4.8 }}
            className="h-24 w-auto drop-shadow-[0_10px_26px_rgba(236,72,153,0.5)]"
          />
          <motion.span
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
            transition={{ times: [0, 0.12, 0.44, 0.5], duration: 4.8 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 skew-x-[-12deg] bg-gradient-to-r from-[#EC4899] to-[#6366F1] px-3 py-1 font-heavy text-[0.75rem] tracking-[0.2em] text-white"
          >
            <span className="block">VS</span>
          </motion.span>
          <motion.img
            src={squadRival}
            alt=""
            aria-hidden="true"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: [60, 0, -16, 0, 140], opacity: [0, 1, 1, 1, 0] }}
            transition={{ times: [0, 0.2, 0.42, 0.52, 0.72], duration: 4.8 }}
            className="h-24 w-auto -scale-x-100 drop-shadow-[0_10px_26px_rgba(99,102,241,0.5)]"
          />
        </div>

        <Explosion delay={BOOM} />

        {/* winner */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 3.05, type: "spring", stiffness: 190, damping: 15 }}
          className="absolute inset-x-0 top-0 bottom-0 z-20 flex flex-col items-center justify-center gap-3"
        >
          <img
            src={customizable}
            alt=""
            aria-hidden="true"
            className="h-28 w-auto drop-shadow-[0_12px_30px_rgba(236,72,153,0.55)]"
          />
          <span className="skew-x-[-12deg] bg-gradient-to-r from-[#EC4899] to-[#6366F1] px-4 py-1.5 font-heavy text-[0.72rem] tracking-[0.22em] text-white shadow-[0_10px_28px_-10px_rgba(236,72,153,0.8)]">
            <span className="block skew-x-[12deg] text-center leading-tight">
              YOU ARE THE<br />WINNER!
            </span>
          </span>
        </motion.div>
      </div>
    </div>
  );
}

/* ---------------- scene 3 : podium ---------------- */

import { PrizePodium } from "./PrizePodium";

function ScenePodium() {
  return (
    <div className="relative flex h-full flex-col items-center px-4 py-2">
      <StepLabel>03 — Win</StepLabel>
      <PrizePodium className="mt-1 h-full" />
    </div>
  );
}

/* ---------------- phone shell ---------------- */

export function PhoneStory({ className }: { className?: string }) {
  const [scene, setScene] = useState(0);
  const next = () => setScene((s) => (s + 1) % SCENES.length);

  /* Duel and podium scenes advance on their own after their SCENES duration;
     the forecast scene (0) drives itself and calls `next` when its cards are done. */
  useEffect(() => {
    if (scene === 0) return;
    const t = setTimeout(next, SCENES[scene]);
    return () => clearTimeout(t);
  }, [scene]);

  return (
    <div className={`relative mx-auto -mt-6 w-[min(340px,88vw)] shrink-0 sm:mt-0 sm:w-[372px] ${className ?? ""}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-8 rounded-[3.5rem] bg-[radial-gradient(circle_at_50%_30%,rgba(236,72,153,0.35),rgba(99,102,241,0.18)_55%,transparent_75%)] blur-2xl"
      />
      <div className="relative rounded-[2.75rem] border border-white/20 bg-[#05060F] p-2.5 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]">
        <div className="relative h-[430px] overflow-hidden sm:h-[680px] rounded-[2.25rem] bg-[#070818]">
          <div aria-hidden="true" className="tactical-grid" />
          <div aria-hidden="true" className="tactical-top-line" />
          <div className="absolute left-1/2 top-2.5 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-black/85" />

          <AnimatePresence mode="wait">
            <motion.div
              key={scene}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 pt-9 pb-7"
            >
              {scene === 0 ? <SceneMarkets onDone={next} /> : null}
              {scene === 1 ? <SceneDuel /> : null}
              {scene === 2 ? <ScenePodium /> : null}
            </motion.div>
          </AnimatePresence>


          <div className="absolute inset-x-0 bottom-3.5 z-20 flex justify-center gap-1.5">
            {SCENES.map((_, i) => (
              <span
                key={i}
                className={`h-[3px] transition-all duration-300 ${
                  i === scene ? "w-6 bg-[#EC4899]" : "w-2 bg-white/25"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
