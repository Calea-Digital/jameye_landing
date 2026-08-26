import React from "react";

import img196 from "./assets/markets/market-196.png?url";
import img197 from "./assets/markets/market-197.png?url";
import img198 from "./assets/markets/market-198.png?url";
import img199 from "./assets/markets/market-199.png?url";
import img200 from "./assets/markets/market-200.png?url";
import img201 from "./assets/markets/market-201.png?url";
import img202 from "./assets/markets/market-202.png?url";
import img203 from "./assets/markets/market-203.png?url";
import img204 from "./assets/markets/market-204.png?url";
import img205 from "./assets/markets/market-205.png?url";
import img206 from "./assets/markets/market-206.png?url";

export type Outcome = { label: string; pct: number; bar?: string };

export type MarketCard = {
  title: string;
  emoji: string;
  image?: string;
  count?: string;
  outcomes?: Outcome[];
  binary?: { yes: number };
  more?: string;
  closes: string;
  bar: string;
};

export const CARDS: MarketCard[] = [
  {
    title: "US–Iran ceasefire continues through…?",
    emoji: "🇺🇸",
    image: img197,
    count: "3 outcomes",
    outcomes: [
      { label: "August 22", pct: 96 },
      { label: "August 25", pct: 94 },
      { label: "August 31", pct: 86 },
    ],
    closes: "Oct 1",
    bar: "linear-gradient(90deg,#3B82F6,#A855F7)",
  },
  {
    title: "US announces end of Iranian blockade by…?",
    emoji: "🚢",
    image: img199,
    count: "3 outcomes",
    outcomes: [
      { label: "December 31", pct: 67 },
      { label: "October 31", pct: 44 },
      { label: "September 30", pct: 25 },
    ],
    closes: "Sep 1",
    bar: "linear-gradient(90deg,#3B82F6,#8B5CF6)",
  },
  {
    title: "Strait of Hormuz traffic returns to normal by…",
    emoji: "🌊",
    image: img200,
    binary: { yes: 6 },
    closes: "Sep 30",
    bar: "linear-gradient(90deg,#3B82F6,#EC4899)",
  },
  {
    title: "FDA approves skin cancer vaccine by…?",
    emoji: "🧬",
    image: img205,
    binary: { yes: 68 },
    closes: "Jan 1",
    bar: "linear-gradient(90deg,#3B82F6,#EC4899)",
  },
  {
    title: "Who will Trump pick as the next Press Secretary?",
    emoji: "🎙️",
    image: img196,
    count: "3 outcomes",
    outcomes: [
      { label: "Scott Jennings", pct: 37 },
      { label: "Anna Kelly", pct: 14 },
      { label: "Steven Cheung", pct: 9 },
    ],
    closes: "Jan 1",
    bar: "linear-gradient(90deg,#3B82F6,#6366F1)",
  },
  {
    title: "Clarity Act (H.R.3633) signed into law in 2026?",
    emoji: "🏛️",
    image: img202,
    binary: { yes: 28 },
    closes: "Jan 1",
    bar: "linear-gradient(90deg,#3B82F6,#EC4899)",
  },
  {
    title: "Anthropic IPO by ___?",
    emoji: "🤖",
    image: img203,
    count: "3 outcomes",
    outcomes: [
      { label: "December 31, 2026", pct: 89 },
      { label: "October 31, 2026", pct: 83 },
      { label: "September 30, 2026", pct: 23 },
    ],
    closes: "Jul 1",
    bar: "linear-gradient(90deg,#F59E0B,#FCD34D)",
  },
  {
    title: "Where will Enzo Fernandez transfer?",
    emoji: "⚽",
    image: img201,
    count: "3 outcomes",
    outcomes: [
      { label: "Chelsea", pct: 63 },
      { label: "Manchester City", pct: 31 },
      { label: "Real Madrid", pct: 1 },
    ],
    closes: "Sep 2",
    bar: "linear-gradient(90deg,#EC4899,#A855F7)",
  },
  {
    title: "Which party will win the Senate in 2026?",
    emoji: "🗳️",
    image: img204,
    count: "3 outcomes",
    outcomes: [
      { label: "Democratic Party", pct: 51 },
      { label: "Republican Party", pct: 50 },
      { label: "Independent", pct: 2 },
    ],
    closes: "Nov 3",
    bar: "linear-gradient(90deg,#3B82F6,#6366F1)",
  },
  {
    title: "Next round of US–Iran peace talks by…?",
    emoji: "🗺️",
    image: img206,
    count: "3 outcomes",
    outcomes: [
      { label: "March 31, 2027", pct: 64 },
      { label: "December 31, 2026", pct: 45 },
      { label: "September 30, 2026", pct: 21 },
    ],
    closes: "Aug 1",
    bar: "linear-gradient(90deg,#3B82F6,#8B5CF6)",
  },
  {
    title: "Pro Football: 2027 Champion",
    emoji: "🏈",
    image: img198,
    count: "3 outcomes",
    outcomes: [
      { label: "Kansas City Chiefs", pct: 6 },
      { label: "Los Angeles Chargers", pct: 4 },
      { label: "Houston Texans", pct: 4 },
    ],
    closes: "Feb 15",
    bar: "linear-gradient(90deg,#EC4899,#A855F7)",
  },
];

export function Card({ card, pick = null }: { card: MarketCard; pick?: number | null }) {
  return (
    <div className="relative flex min-h-[260px] w-full flex-col overflow-hidden rounded-[1.25rem] border border-white/55 bg-white/45 p-2 pb-2.5 text-left shadow-[0_10px_30px_-10px_rgba(0,0,0,0.35)] backdrop-blur-md sm:h-[400px] sm:min-h-0 sm:rounded-[2rem] sm:p-3 sm:pb-4">
      {/* Large, fixed image area like the game-section cards */}
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl ring-1 ring-black/10 sm:aspect-[16/10]">
        {card.image ? (
          <img src={card.image} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-[3rem] sm:text-[5rem]"
            style={{ backgroundImage: card.bar }}
          >
            {card.emoji}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {pick !== null && card.outcomes?.[pick] ? (
          <span
            className="animate-reel-pick-glow pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl"
            style={{ background: card.bar }}
          />
        ) : null}

        <div className="absolute bottom-2 left-2 right-2 sm:bottom-3">
          <p className="line-clamp-2 text-[0.85rem] font-black leading-tight text-white drop-shadow sm:text-[1.05rem]">
            {card.title}
          </p>
          {card.count ? (
            <p className="mt-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white/80 sm:text-[0.75rem]">
              {card.count}
            </p>
          ) : null}
        </div>
      </div>

      {/* Probabilities — picked outcome becomes a full YOU PICKED bar */}
      {card.outcomes ? (
        <div className="relative mt-2 space-y-1.5 sm:mt-2 sm:space-y-2">
          {card.outcomes.map((o, i) => {
            const isPicked = pick === i;
            const payout = Math.max(1.01, 100 / Math.max(o.pct, 1));
            return (
              <div
                key={o.label}
                className={[
                  "relative overflow-hidden rounded-lg px-2 py-1 transition-all duration-300 sm:px-2.5 sm:py-1.5",
                    isPicked
                    ? "animate-reel-pick bg-gradient-to-r from-hud-magenta to-hud-violet shadow-[0_0_24px_rgba(236,72,153,0.35)]"
                    : "bg-white/40 hover:bg-white/50",

                ].join(" ")}
              >
                <div className={[
                  "relative flex items-center justify-between gap-2 text-[0.68rem] font-bold sm:text-[0.78rem]",
                  isPicked ? "text-white" : "text-hud-panel",
                ].join(" ")}>
                  <span className="flex min-w-0 items-center gap-1 truncate">
                    <span>{isPicked ? "YOU PICKED" : o.label}</span>
                  </span>
                  {isPicked ? (
                    <span className="shrink-0 rounded bg-white/20 px-1 py-0 text-[0.55rem] font-black uppercase tracking-[0.06em] text-white sm:text-[0.6rem]">
                      WIN {payout.toFixed(2)}×
                    </span>
                  ) : (
                    <span className="shrink-0">{o.pct}%</span>
                  )}
                </div>
                <div className="relative mt-1 h-1 w-full overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(o.pct, 1)}%`,
                      backgroundImage: isPicked
                        ? "linear-gradient(90deg,rgba(255,255,255,0.85),rgba(255,255,255,0.35))"
                        : card.bar,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {card.binary ? (
        <div className="relative mt-2 rounded-lg bg-white/25 px-2 py-1.5 sm:mt-2 sm:px-2.5 sm:py-2">
          <div className="flex items-baseline justify-between text-[0.68rem] font-bold uppercase tracking-wider text-hud-panel/80 sm:text-[0.78rem]">
            <span>Yes <span className="text-yes">{card.binary.yes}%</span></span>
            <span><span className="text-no">{100 - card.binary.yes}%</span> No</span>
          </div>
          <div className="mt-1 flex h-1 w-full overflow-hidden rounded-full bg-black/10">
            <div className="h-full" style={{ width: `${card.binary.yes}%`, background: "var(--color-yes)" }} />
            <div className="h-full flex-1" style={{ background: "var(--color-no)" }} />
          </div>
        </div>
      ) : null}

      {card.more ? (
        <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-hud-panel/60 sm:text-[0.75rem]">
          {card.more}
        </p>
      ) : null}
    </div>
  );
}


/* ---------------- scroll parallax ----------------
   Columns drift up/down as the page scrolls past the mosaic. Driven by the
   `.play-landing` scroll container (the page body itself never scrolls) and
   written straight to the DOM from a rAF so React never re-renders. */
const PARALLAX_DIRS = [1, -1, 1, -1, 1, -1, 1];

function useMosaicParallax(
  rootRef: React.RefObject<HTMLElement | null>,
  colsRef: React.MutableRefObject<(HTMLElement | null)[]>,
  amplitude: number,
) {
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scroller = (root.closest(".play-landing") as HTMLElement | null) ?? window;

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight || 1;
      const r = root.getBoundingClientRect();
      // 0 when the mosaic is centred in the viewport, ±1 one viewport away.
      const progress = Math.max(-1.5, Math.min(1.5, (r.top + r.height / 2 - vh / 2) / vh));
      colsRef.current.forEach((col, i) => {
        if (!col) return;
        const dir = PARALLAX_DIRS[i % PARALLAX_DIRS.length];
        const factor = 0.7 + ((i * 37) % 5) * 0.15; // 0.7 … 1.3 — uneven speeds
        col.style.transform = `translate3d(0, ${(progress * amplitude * dir * factor).toFixed(1)}px, 0)`;
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    scroller.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      scroller.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [rootRef, colsRef, amplitude]);
}

/** Fixed-size, non-overlapping 1 · 2 · 3 · 2 · 1 mosaic. */
export function MarketMosaic() {
  const mobileScrollRef = React.useRef<HTMLDivElement>(null);
  const [activeColumn, setActiveColumn] = React.useState(2);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const mobileColRefs = React.useRef<(HTMLElement | null)[]>([]);
  const desktopColRefs = React.useRef<(HTMLElement | null)[]>([]);
  useMosaicParallax(rootRef, mobileColRefs, 34);
  useMosaicParallax(rootRef, desktopColRefs, 150);

  const mobileColumns: { cards: MarketCard[]; offset: string }[] = [
    { cards: [CARDS[0]], offset: "pt-8" },
    { cards: [CARDS[1], CARDS[4]], offset: "pt-4" },
    { cards: [CARDS[2], CARDS[6], CARDS[10]], offset: "pt-0" },
    { cards: [CARDS[3], CARDS[7]], offset: "pt-4" },
    { cards: [CARDS[8]], offset: "pt-8" },
  ];

  React.useEffect(() => {
    const center = () => {
      const el = mobileScrollRef.current;
      if (!el) return;
      const mid = el.querySelector<HTMLElement>('[data-index="2"]');
      if (!mid) return;
      const elRect = el.getBoundingClientRect();
      const midRect = mid.getBoundingClientRect();
      el.scrollLeft += midRect.left - elRect.left - (elRect.width - midRect.width) / 2;
    };
    const raf = requestAnimationFrame(() => requestAnimationFrame(center));
    const t = window.setTimeout(center, 300);
    window.addEventListener("resize", center);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      window.removeEventListener("resize", center);
    };
  }, []);

  React.useEffect(() => {
    const el = mobileScrollRef.current;
    if (!el) return;
    const cols = el.querySelectorAll("[data-mosaic-col]");
    if (!cols.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const idx = Number(visible[0].target.getAttribute("data-index"));
          if (!Number.isNaN(idx)) setActiveColumn(idx);
        }
      },
      { root: el, threshold: 0.55 }
    );
    cols.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  /* Desktop: organic staggered mosaic — 7 columns, uneven counts + offsets. */
  const desktopColumns: { cards: MarketCard[]; offset: string }[] = [
    { cards: [CARDS[0], CARDS[7]], offset: "pt-[220px]" },
    { cards: [CARDS[1], CARDS[3]], offset: "pt-[110px]" },
    { cards: [CARDS[2], CARDS[4], CARDS[10]], offset: "pt-0" },
    { cards: [CARDS[5], CARDS[6], CARDS[9]], offset: "pt-[140px]" },
    { cards: [CARDS[8], CARDS[7], CARDS[1]], offset: "pt-[40px]" },
    { cards: [CARDS[9], CARDS[2]], offset: "pt-[170px]" },
    { cards: [CARDS[10], CARDS[3]], offset: "pt-[80px]" },
  ];



  return (
    <div ref={rootRef} className="mt-4 w-full min-w-0 px-1 pb-2 sm:mt-8 sm:pb-12">
      {/* Mobile: horizontally scrollable columns, snap to each column */}
      <div
        ref={mobileScrollRef}
        className="relative -mx-5 max-h-[46svh] overflow-y-hidden overflow-x-auto scrollbar-hide sm:mx-0 sm:max-h-none sm:hidden snap-x snap-mandatory"
        style={{ ["--mcol" as string]: "min(268px, 72vw)" }}
      >
        <div
          className="flex w-max gap-2.5"
          style={{
            paddingLeft: "max(12px, calc((100% - var(--mcol)) / 2))",
            paddingRight: "max(12px, calc((100% - var(--mcol)) / 2))",
          }}
        >
          {mobileColumns.map((column, index) => (
            <div
              key={index}
              data-mosaic-col
              data-index={index}
              className={`flex shrink-0 snap-center flex-col transition-opacity duration-300 ${column.offset} ${
                index === activeColumn ? "" : "opacity-70"
              }`}
              style={{ width: "var(--mcol)" }}
            >
              <div
                ref={(el) => {
                  mobileColRefs.current[index] = el;
                }}
                className="flex flex-col gap-2.5 will-change-transform"
              >
                {column.cards.map((card) => (
                  <Card key={card.title} card={card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile scroll indicator */}
      <div className="mt-4 flex items-center justify-center gap-1.5 sm:hidden">
        {mobileColumns.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeColumn ? "w-5 bg-white" : "w-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* Desktop: full-width staggered composition, scaled to fit the section. */}
      <div className="relative left-1/2 hidden h-[820px] w-screen -translate-x-1/2 items-start justify-center overflow-hidden sm:flex">

        <div
          className="flex gap-5 origin-top"
          style={{ transform: "scale(0.5)" }}
        >
          {desktopColumns.map((column, index) => (
            <div
              key={index}
              ref={(el) => {
                desktopColRefs.current[index] = el;
              }}
              className={`flex w-[402px] shrink-0 flex-col gap-5 will-change-transform ${column.offset}`}
            >
              {column.cards.map((card, cardIndex) => (
                <Card key={`${index}-${cardIndex}-${card.title}`} card={card} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export function MarketFeatureStack() {
  const featured = CARDS[2];
  const small1 = CARDS[0];
  const small2 = CARDS[1];
  return (
    <div className="relative flex w-full max-w-[1040px] flex-col items-center justify-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="w-full sm:w-[28%] sm:translate-y-8 sm:scale-95 sm:opacity-90">
        <Card card={small1} />
      </div>
      <div className="w-full sm:w-[36%] sm:z-10 sm:scale-105">
        <Card card={featured} />
      </div>
      <div className="w-full sm:w-[28%] sm:translate-y-8 sm:scale-95 sm:opacity-90">
        <Card card={small2} />
      </div>
    </div>
  );
}

export default MarketMosaic;
