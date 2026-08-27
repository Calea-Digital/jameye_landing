import React from "react";
import { CARDS, Card } from "./MarketMosaic";


/**
 * PrizePicks "Ways to Pick" style orbit: market cards arranged on a circle
 * that slowly rotates around the section content.
 */
export function MarketOrbit({
  children,
  count = 10,
  className,
  style,
}: {
  children?: React.ReactNode;
  count?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const cards = CARDS.slice(0, count);

  return (
    <div
      className={`relative w-full [--orbit-r:70px] [--orbit-s:0.3] sm:[--orbit-r:340px] sm:[--orbit-s:0.72] ${className || ""}`}
      style={style}
    >
      {/* orbit layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0 animate-orbit-spin"
      >
        {cards.map((card, i) => {
          const angle = (360 / cards.length) * i;
          return (
            <div
              key={i}
              className="absolute left-0 top-0 h-0 w-0"
              style={{ transform: `rotate(${angle}deg) translateY(calc(-1 * var(--orbit-r)))` }}
            >
              <div
                className="w-[290px] -translate-x-1/2 -translate-y-1/2 opacity-75 [&_*]:!shadow-none [&>div]:!h-auto [&>div]:!min-h-0 sm:[&>div]:!h-[400px]"
                style={{ transform: `translate(-50%,-50%) scale(var(--orbit-s))` }}
              >
                <Card card={card} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative z-10 [text-shadow:0_2px_18px_rgba(5,6,15,0.55)]">{children}</div>


    </div>
  );
}

export default MarketOrbit;
