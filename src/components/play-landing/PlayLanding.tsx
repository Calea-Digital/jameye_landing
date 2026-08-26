import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import explorer from "./assets/avatars/02-edge-score-explorer.svg?url";
import customizable from "./assets/avatars/03-duel-customizable-fighter.svg?url";
import rapidFighter from "./assets/avatars/04-rapid-duel-fighter.svg?url";
import squadTrader from "./assets/avatars/05-squad-row1-trader.svg?url";
import squadCustom from "./assets/avatars/07-squad-row1-customizable.svg?url";
import squadRival from "./assets/avatars/09-squad-row2-rival.svg?url";
import { FiqRing } from "./FiqRing";
import { FiqLeaderboard } from "./FiqLeaderboard";
import { MarketFeatureStack, MarketMosaic } from "./MarketMosaic";
import { MarketOrbit } from "./MarketOrbit";
import { MarketReel } from "./MarketReel";

import { PhoneStory } from "./PhoneStory";


/* ---------------- reveal plumbing ---------------- */

const InViewContext = createContext(false);
const useSectionInView = () => useContext(InViewContext);

function useInView<T extends HTMLElement>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/** Text that writes itself in, word by word. */
function AnimatedText({
  text,
  className,
  delay = 0,
  step = 0.055,
}: {
  text: string;
  className?: string;
  delay?: number;
  step?: number;
}) {
  const inView = useSectionInView();
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block whitespace-pre">
          <span
            className={`inline-block ${inView ? "animate-word-in" : "opacity-0"}`}
            style={{ animationDelay: `${delay + i * step}s` }}
          >
            {w}
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

function Reveal({
  children,
  delay = 0,
  variant = "rise",
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  variant?: "rise" | "pop";
  className?: string;
}) {
  const inView = useSectionInView();
  return (
    <div
      className={`${className ?? ""} ${
        inView
          ? variant === "pop"
            ? "animate-pop-in"
            : "animate-rise-in"
          : "opacity-0"
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

/** Served from /public so the 11 MB clip is not run through the bundler. */
const HERO_VIDEO = "/video/hero-video.mp4";

/* ---------------- page ---------------- */

export function PlayLanding() {
  return (
    <main className="play-landing relative h-screen snap-y snap-mandatory overflow-y-scroll overflow-x-hidden scroll-smooth">
      {/* ---------------- HERO ---------------- */}
      <Section>
        <GradientCard
          videoBackground={HERO_VIDEO}
          layout="split"
          left={
            <>
              <Heading text="EXPLORE THE GLOBAL FORECASTING CHAMPIONSHIP!" className="lg:text-left" />
              <Body
                delay={0.5}
                className="mx-auto text-center lg:mx-0 lg:text-left"
                text="Predict anything from the next World Cup winner to tomorrow's biggest news. Challenge forecasters around the globe."
              />

            </>
          }
          right={
            <Reveal delay={0.9} className="w-full">
              <MarketReel />
            </Reveal>
          }
        />
      </Section>


      {/* ---------------- LIVE MARKETS MOSAIC ---------------- */}
      <Section>
        <GradientCard
          badge="Live markets"
          gradient="bg-gradient-to-br from-[#EC4899] via-[#6366F1] to-[#22D3EE]"
          layout="split"
          left={
            <div className="lg:hidden">
              <Heading text="Predict anything, anywhere" />
              <Body
                delay={0.45}
                text="Politics, sports, tech, culture — hundreds of live markets waiting for your call."
              />
            </div>
          }
          right={
            <Reveal delay={0.8} className="w-full lg:hidden">
              <div className="w-full min-w-0">
                <MarketMosaic />
              </div>
            </Reveal>
          }
        >
          <div className="hidden w-full text-center lg:block">
            <Heading text="Predict anything, anywhere" className="mx-auto max-w-3xl" />
            <Body
              delay={0.45}
              text="Politics, sports, tech, culture — hundreds of live markets waiting for your call."
            />
            <Reveal delay={0.8} className="w-full">
              <MarketMosaic />
            </Reveal>
          </div>
        </GradientCard>

      </Section>


      {/* ---------------- MEET YOUR FIQ ---------------- */}

      <Section>
        <GradientCard
          badge="Your skill score"
          gradient="bg-gradient-to-br from-[#22D3EE] via-[#8B5CF6] to-[#EC4899]"
        >
          {/* Avatar studying its score + live FIQ meter */}
          <div className="mt-2 flex items-end justify-center sm:mt-3">
            <Reveal variant="pop" delay={0.3}>
              <img
                src={customizable}
                alt=""
                aria-hidden="true"
                className="h-20 w-auto animate-avatar-cheer drop-shadow-[0_8px_24px_rgba(236,72,153,0.3)] sm:h-40"
              />
            </Reveal>
          </div>
          <Heading text="BUILD YOUR FIQ" delay={0.35} />
          <Body
            delay={0.6}
            text="FIQ — Forecasting IQ measures how accurate you are at predicting. Jameye scores your results across multiple predictions to make your FIQ robust, reliable, and globally recognized"
          />
          <Reveal variant="pop" delay={0.8} className="mt-4 flex justify-center sm:mt-8">
            <div className="origin-center scale-[0.72] -my-8 sm:scale-100 sm:my-0">
              <FiqRing />
            </div>
          </Reveal>
          <Reveal delay={1} className="mt-4 flex justify-center sm:mt-6">
            <FiqLeaderboard />
          </Reveal>


        </GradientCard>
      </Section>

      {/* ---------------- MODES ---------------- */}
      <Section>
        <GradientCard
          badge="Game modes"
          gradient="bg-gradient-to-br from-[#6366F1] via-[#EC4899] to-[#F59E0B]"
        >
          <MarketOrbit>
            <Heading text="Compete your way" />
            <ModeCarousel />
          </MarketOrbit>
        </GradientCard>
      </Section>


      {/* ---------------- NOT GAMBLING ---------------- */}
      <Section>
        <GradientCard
          badge="+18 ONLY"
          gradient="bg-gradient-to-br from-[#06B6D4] via-[#6366F1] to-[#A855F7]"
          layout="split"
          left={
            <>
              <Heading
                text={"A GLOBAL SKILL CHAMPIONSHIP! NOT GAMBLING"}
                className="-mt-6 text-[1.35rem] sm:mt-5 lg:text-left"
              />
              <Body
                delay={0.5}
                className="mx-auto hidden text-center lg:mx-0 lg:block lg:text-left"
                text="Subscribe, forecast, duel your rivals and climb the podium — pure skill, real prizes."
              />
            </>
          }
          right={
            <Reveal delay={0.9} className="flex w-full justify-center lg:justify-end">
              <PhoneStory />
            </Reveal>
          }
        />
      </Section>

      {/* ---------------- FINAL CTA ---------------- */}
      <Section>
        <GradientCard
          badge="Start now"
          gradient="bg-gradient-to-br from-[#EC4899] via-[#6366F1] to-[#22D3EE]"
        >
          <div className="mt-4 flex items-end justify-center gap-1.5 sm:gap-6">
            {[
              { src: squadTrader, h: "h-16 sm:h-28", act: "animate-avatar-think", d: 0.1 },
              { src: customizable, h: "h-24 sm:h-40", act: "animate-avatar-cheer", d: 0.25 },
              { src: squadRival, h: "h-16 sm:h-28", act: "animate-avatar-punch", d: 0.4 },
            ].map((a, i) => (
              <Reveal key={i} variant="pop" delay={a.d}>
                <img
                  src={a.src}
                  alt=""
                  aria-hidden="true"
                  className={`${a.h} ${a.act} w-auto shrink-0`}
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              </Reveal>
            ))}
          </div>
          <Heading text="Your forecasting journey starts now" delay={0.45} />
        </GradientCard>
      </Section>

      {/* ---------------- STICKY BOTTOM PLAY BAR ---------------- */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/20 bg-white/10 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:px-4 sm:py-5">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="whitespace-normal font-display text-sm font-black uppercase leading-tight tracking-wide text-white sm:text-xl">
              JOIN THE CHAMPIONCHIP!
            </p>
            <p className="text-xs text-white/80 sm:text-sm">
              Free to play. No download required.
            </p>
          </div>
          <button
            type="button"
            data-open-waitlist
            className="tactical-cta shrink-0 justify-center px-5 py-2.5 text-sm sm:px-9 sm:py-4 sm:text-base"
          >
            <span className="tactical-cta-inner font-extrabold">JOIN THE WAITLIST</span>
          </button>
        </div>
      </div>
    </main>
  );
}

// ---- building blocks ----------------------------------------------------

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView<HTMLElement>(0.35);
  return (
    <section
      ref={ref}
      className={`relative flex min-h-[100svh] w-full snap-start flex-col items-center justify-center text-center ${className ?? ""}`}
    >
      <InViewContext.Provider value={inView}>{children}</InViewContext.Provider>
    </section>
  );
}

function GradientCard({
  badge,
  gradient = "bg-gradient-to-br from-[#06B6D4] via-[#6366F1] to-[#EC4899]",
  videoBackground,
  decor,
  children,
  layout = "center",
  left,
  right,
}: {
  badge?: string;
  gradient?: string;
  videoBackground?: string;
  decor?: React.ReactNode;
  children?: React.ReactNode;
  layout?: "center" | "split";
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  const inView = useSectionInView();
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const seek = () => {
      v.currentTime = 20;
    };
    if (v.readyState >= 1) seek();
    v.addEventListener("loadedmetadata", seek);
    return () => v.removeEventListener("loadedmetadata", seek);
  }, []);
  const isSplit = layout === "split";
  return (

    <div
      className={`relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-5 pb-[calc(9.5rem+env(safe-area-inset-bottom))] sm:px-8 sm:py-28 ${videoBackground ? "pt-20 sm:pt-28" : "pt-14"} ${gradient}`}
    >
      {videoBackground ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            {...{ "webkit-playsinline": "true" }}
            preload="auto"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover brightness-[0.85] saturate-[1.05]"
            src={videoBackground}
            onLoadedMetadata={() => {
              const el = videoRef.current;
              if (!el) return;
              if (el.duration > 20) el.currentTime = 20;
            }}
            onLoadedData={() => {
              const el = videoRef.current;
              if (!el) return;
              el.muted = true;
              if (el.currentTime < 20 && el.duration > 20) el.currentTime = 20;
              void el.play?.().catch(() => {});
            }}
            onSeeked={() => {
              const el = videoRef.current;
              if (el?.paused) void el.play?.().catch(() => {});
            }}
            onCanPlay={() => {
              const el = videoRef.current;
              if (el?.paused) void el.play?.().catch(() => {});
            }}
            onTimeUpdate={() => {
              const el = videoRef.current;
              if (el && el.currentTime < 20 && el.duration > 20) el.currentTime = 20;
            }}
          />

          {/* light darkening base */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#05060F]/35 via-[#070A18]/25 to-[#05060F]/55"
          />
          {/* chroma gradient in brand colours */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-60 mix-blend-screen"
            style={{
              background:
                "radial-gradient(120% 80% at 15% 10%, rgba(99,102,241,0.45) 0%, rgba(99,102,241,0) 55%), radial-gradient(100% 70% at 90% 20%, rgba(34,211,238,0.32) 0%, rgba(34,211,238,0) 60%), radial-gradient(110% 80% at 60% 110%, rgba(236,72,153,0.40) 0%, rgba(236,72,153,0) 60%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,15,0.35)_0%,rgba(5,6,15,0)_40%,rgba(5,6,15,0.5)_100%)]"
          />
        </>
      ) : null}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 animate-orb-drift rounded-full bg-white/20 blur-[80px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 animate-orb-drift rounded-full bg-[#22D3EE]/25 blur-[80px]"
        style={{ animationDelay: "1.5s" }}
      />
      {decor}

      <div className={`relative z-10 w-full ${isSplit ? "max-w-7xl px-2 sm:px-10" : "max-w-3xl"}`}>
        {badge ? (
          <div
            className={`inline-flex max-w-full items-center rounded-full bg-white/20 px-2.5 py-1 text-[0.65rem] font-bold uppercase leading-tight tracking-wider text-white backdrop-blur-sm sm:px-3 sm:text-xs ${
              isSplit ? "mx-auto mb-5 flex w-fit lg:mx-0 lg:mb-8" : "mx-auto mb-4"
            } ${inView ? "animate-pop-in" : "opacity-0"}`}
          >

            {badge}
          </div>
        ) : null}
        {isSplit ? (
          <>
            <div className="grid items-center gap-5 sm:gap-8 lg:grid-cols-2 lg:gap-14">
              <div className="space-y-4 text-center sm:space-y-5 lg:text-left">
                {left}
              </div>
              <div className="flex min-w-0 items-center justify-center lg:justify-end">
                {right}
              </div>
            </div>

            {children}
          </>
        ) : children}

      </div>
    </div>
  );
}


function Heading({ text, delay = 0.15, className }: { text: string; delay?: number; className?: string }) {
  const inView = useSectionInView();
  return (
    <h2
      className={`font-heavy mt-4 text-balance text-center text-[1.6rem] uppercase leading-[1.05] tracking-tight text-white sm:mt-5 sm:text-5xl ${className ?? ""} ${inView ? "animate-word-in" : "opacity-0"}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {text}
    </h2>
  );
}

function Body({
  text,
  muted,
  delay = 0.4,
  className,
}: {
  text: string;
  muted?: boolean;
  delay?: number;
  className?: string;
}) {
  return (
    <p
      className={`mx-auto mt-4 max-w-lg text-center text-[0.875rem] font-medium leading-relaxed sm:mt-6 sm:text-lg ${
        muted ? "text-white/85" : "text-white"
      } ${className ?? ""}`}
    >
      {text}
    </p>
  );
}


function ModeCarousel() {
  const [active, setActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inView = useSectionInView();

  const cards = [
    {
      avatars: [explorer, squadTrader, squadRival],
      act: "animate-avatar-think",
      title: "Global Leaderboard",
      body: "Every week, the top players on the Global Leaderboard win prizes.",
    },
    {
      avatars: [rapidFighter, customizable, squadRival],
      act: "animate-avatar-punch",
      title: "Tournaments",
      body: "Jump into themed tournaments running all the time. Every tournament starts your FIQ at zero. Make predictions, climb the leaderboard, and top FIQs share the prizes.",
    },
    {
      avatars: [squadCustom, squadTrader, explorer],
      act: "animate-avatar-cheer",
      title: "Play with Friends",
      body: "Challenge your friends and family. Create your own private game, make predictions together, compete for Jameye Coins, and find out who really has the best FIQ.",
    },
  ];

  return (
    <div className="mt-8">
      <div
        ref={scrollRef}
        onScroll={(e) =>
          setActive(
            Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth),
          )
        }
        className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto"
      >
        {cards.map((card, i) => (
          <div key={i} className="w-full min-w-0 flex-shrink-0 snap-center px-1 sm:px-2">
            <div className={`relative mx-auto flex h-28 items-end justify-center gap-1 transition-opacity duration-500 sm:h-44 ${
                inView ? "opacity-100" : "opacity-0"
              }`}>
              {card.avatars.map((src, idx) => {
                const isCenter = idx === 1;
                return (
                  <img
                    key={idx}
                    src={src}
                    alt=""
                    aria-hidden="true"
                    className={`w-auto object-contain ${card.act} ${
                      isCenter
                        ? "h-24 -translate-y-2 sm:h-40 sm:-translate-y-3"
                        : "h-16 translate-y-2 opacity-90 sm:h-28 sm:translate-y-3"
                    }`}
                    style={{ animationDelay: `${idx * 0.12}s`, zIndex: isCenter ? 10 : 1 }}
                  />
                );
              })}
            </div>
            <h3 className="font-heavy mt-4 text-lg uppercase leading-tight tracking-tight text-white sm:mt-5 sm:text-2xl">
              <AnimatedText text={card.title} delay={0.45} />
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-[0.875rem] font-medium leading-relaxed text-white/90 sm:mt-4 sm:text-lg">
              <AnimatedText text={card.body} delay={0.65} step={0.02} />
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-center gap-2 sm:mt-6">
        {cards.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to card ${i + 1}`}
            onClick={() => {
              const el = scrollRef.current;
              if (el)
                el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-white" : "w-2 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default PlayLanding;
