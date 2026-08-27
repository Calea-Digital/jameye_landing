import React from "react";
import { CARDS, Card, type MarketCard } from "./MarketMosaic";

/** Cards that have listed outcomes — those can show a "pick" highlight. */
const REEL_CARDS: MarketCard[] = CARDS.filter((c) => (c.outcomes?.length ?? 0) > 0);

type Phase = "in" | "pick" | "out";

const TIMINGS: Record<Phase, number> = {
  in: 1800, // slide in from the right + beat
  pick: 2200, // one outcome gets selected
  out: 900, // slide down and away
};

/**
 * PrizePicks-style reel: a market card slides in from the right,
 * one outcome is marked, then the card slides down and the next one enters.
 */
export function MarketReel() {
  const [index, setIndex] = React.useState(0);
  const [phase, setPhase] = React.useState<Phase>("in");

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      if (phase === "in") setPhase("pick");
      else if (phase === "pick") setPhase("out");
      else {
        setIndex((i) => (i + 1) % REEL_CARDS.length);
        setPhase("in");
      }
    }, TIMINGS[phase]);
    return () => window.clearTimeout(t);
  }, [phase]);

  const card = REEL_CARDS[index];
  const pickIndex =
    phase === "in" ? null : index % Math.max(card.outcomes?.length ?? 1, 1);

  return (
    <div className="-mt-2 flex w-full flex-col items-center sm:mt-6">
      {/* stage */}
      <div className="relative h-[340px] w-full max-w-[402px] overflow-hidden sm:h-[450px]">
        <div
          key={`${index}-${phase === "out" ? "out" : "in"}`}
          className={`absolute inset-x-0 top-0 ${
            phase === "out" ? "animate-reel-out" : "animate-reel-in"
          }`}
        >
          <Card card={card} pick={pickIndex} />
        </div>
      </div>
    </div>
  );
}

export default MarketReel;
