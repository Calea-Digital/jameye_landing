/**
 * EdgeScoreBuilder — drop-in section that reproduces the app's Edge Score
 * Builder page (header + glow card + the expedition scene), minus any app
 * chrome (no sidebar, no router). Self-contained for a landing page.
 *
 *   import { EdgeScoreBuilder } from "./edge-score-builder-export";
 *   import "./edge-score-builder-export/edge-score-builder.css";
 *
 *   <EdgeScoreBuilder onStart={() => scrollToSignup()} />
 *
 * Requirements in the host app: React 18+, react-dom, and Tailwind CSS.
 * If you only want the scene (no header/card), import `LoopExpeditionScene`
 * directly instead.
 */

import { LoopExpeditionScene } from "./LoopExpeditionScene";
import { GlowCard, PageGlow } from "./ui";

export function EdgeScoreBuilder({ onStart }: { onStart?: () => void }) {
  return (
    <section className="esb-root relative mx-auto w-full max-w-6xl px-6 py-10">
      <PageGlow />

      <header className="relative flex w-full flex-col items-center gap-3 px-1 pt-1 text-center sm:items-start sm:text-left">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.28em] text-white/70">
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "#7e3bff", boxShadow: "0 0 10px #7e3bff" }}
          />
          Edge Score Builder · Season 1
        </span>

        <h1 className="text-balance font-sans text-[34px] font-light leading-[0.96] tracking-[-0.025em] text-white sm:text-[44px] md:text-[56px] lg:text-[64px]">
          Build your <span className="esb-title-accent">Edge Score</span>.
        </h1>

        <p className="max-w-xl text-[13px] font-normal text-white/60 sm:text-[14px]">
          Six chapters. Thirty calibrated forecasts. Earn your way onto the leaderboard — one resolution at a time.
        </p>
      </header>

      <GlowCard glow className="mt-10 overflow-hidden px-2 py-8 sm:px-4">
        <LoopExpeditionScene onStart={onStart} />
      </GlowCard>
    </section>
  );
}

export default EdgeScoreBuilder;
