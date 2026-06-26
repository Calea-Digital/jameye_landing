/**
 * BouPromoBand — the app's "Battle of Universities" promo band, ported to the
 * landing page (see /bou-section-replica for the verbatim source it derives
 * from: components/MarketsPage.tsx lines 809–1083).
 *
 * Differences from the replica:
 *  - The school-color split (cyan left / magenta right) is re-tinted to the
 *    Jameye brand gradient (blue→violet on the left, magenta→pink on the right)
 *    so the band reads as ours, matching the rest of the landing.
 *  - The data that came from `api.getBouState()` is props:
 *      • `prizePool`    — number, renders "$100,000"
 *      • `seasonEndsAt` — ISO date; when set, the season countdown shows
 *      • `onJoin`       — fired by the "Join the Battle" CTA
 *  - Vertical rhythm is tightened so the whole band fits one viewport.
 *
 * Requires Tailwind + the --j-font-* tokens (aliased in global.css) and the
 * asset files served from `${assetBase}/...` (default /exports).
 */

import React from 'react';
import InfoTip from './InfoTip';
import FlagIcon from './FlagIcon';

export interface BouPromoBandProps {
  /** Total season prize money. Renders as `$100,000` style. Default 100000. */
  prizePool?: number;
  /** Fired by the "Join the Battle" CTA. */
  onJoin?: () => void;
  /** URL root the asset images are served from. Default "/exports". */
  assetBase?: string;
}

export default function BouPromoBand({
  prizePool = 100000,
  onJoin,
  assetBase = '/exports',
}: BouPromoBandProps) {
  return (
    /* Battle of Universities — promo band, tinted to the Jameye brand gradient
       (deep navy → indigo → violet → magenta) so it reads as ours. */
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-white/[0.12] shadow-[0_24px_88px_rgba(0,0,0,0.5)]"
      style={{
        background:
          'radial-gradient(120% 130% at 50% -20%, #7e3bff 0%, transparent 55%), linear-gradient(120deg, #16235e 0%, #3a1d7a 38%, #6d28d9 66%, #b21fd1 100%)',
      }}
    >
      {/* Top gloss — "lit from above" radial */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(255,255,255,0.28),transparent_60%)]" />
      {/* Center seam halo — soft white wash directly behind the VS pill. */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 -z-0 -ml-[18%] w-[36%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.18),transparent_70%)]" />
      {/* BOU watermark — boosted opacity + size + overlay blend mode so the
          wordmark reads as a brand stamp across the gradient. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-[14%] -left-[3%] select-none font-semibold uppercase leading-none tracking-[-0.04em] text-white/[0.22]"
        style={{
          fontFamily: 'var(--j-font-display)',
          fontSize: 'clamp(15rem,38vw,38rem)',
          textRendering: 'geometricPrecision',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          mixBlendMode: 'overlay',
        }}
      >
        BOU
      </span>

      {/* Inner container — single centered column. */}
      <div className="relative mx-auto flex w-full max-w-[1080px] flex-col items-center px-5 py-7 sm:px-8 sm:py-9 md:px-12 md:py-10">
        {/* Headline */}
        <h2
          className="w-full text-center text-[30px] font-semibold uppercase leading-[0.95] tracking-[-0.025em] text-white drop-shadow-[0_12px_40px_rgba(0,0,0,0.35)] sm:text-[46px] md:text-[56px]"
          style={{ fontFamily: 'var(--j-font-display)' }}
        >
          Battle of Universities
        </h2>

        {/* One line — detail lives in the ⓘ. */}
        <p
          className="mt-3 inline-flex items-center gap-1.5 text-center text-[14px] font-semibold leading-[1.55] text-white/90 sm:text-[15px]"
          style={{ textShadow: '0 1px 10px rgba(0,0,0,0.35)' }}
        >
          <InfoTip content="Your university is your squad. Place predictions on any market, hit 30 resolved to qualify, and lift your school's average Edge. The university with the highest average claims the trophy.">
            Your university is your squad
          </InfoTip>
        </p>

        {/* Arena — two avatar clusters facing each other across a VS pill. */}
        <div className="mt-6 flex w-full flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-4 md:gap-8">
          {/* Left crew — Sweden, blue/violet-tinted halo */}
          <div className="relative flex flex-1 flex-col items-center gap-3 rounded-2xl border border-white/15 bg-black/25 px-4 py-4 shadow-xl backdrop-blur-md">
            <div className="absolute inset-0 -z-0 rounded-2xl bg-[radial-gradient(ellipse_at_50%_60%,rgba(41,98,255,0.45),transparent_70%)]" />
            {/* Brand medallion — Sweden flag framed by the blue/violet gradient. */}
            <div
              className="relative flex h-[76px] w-[76px] items-center justify-center rounded-full p-[3px] shadow-[0_14px_34px_rgba(41,98,255,0.55)] sm:h-[88px] sm:w-[88px]"
              style={{ backgroundImage: 'linear-gradient(135deg, #2962ff 0%, #7e3bff 100%)' }}
            >
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
                <FlagIcon flag="🇸🇪" className="h-auto w-[64%]" />
              </div>
            </div>
            <div className="relative flex items-center gap-2">
              <span className="text-center text-[14px] font-semibold uppercase tracking-[0.18em] text-white [font-family:var(--j-font-mono)]">
                Sweden
              </span>
            </div>
            <div className="relative flex items-end justify-center gap-1 sm:gap-2">
              {/* Animated chibis — each SVG carries its own internal arm-only
                  keyframes (gated behind prefers-reduced-motion). */}
              {[
                `${assetBase}/bou-animated/01-open-market-trader.svg`,
                `${assetBase}/bou-animated/02-edge-score-explorer.svg`,
                `${assetBase}/bou-animated/03-duel-customizable-fighter.svg`,
              ].map((src) => (
                <div
                  key={src}
                  className="relative h-16 w-12 sm:h-20 sm:w-16"
                  style={{ filter: 'drop-shadow(0 8px 18px rgba(41,98,255,0.55))' }}
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* VS disc — editorial glass token with a soft pulsing halo. */}
          <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_14px_38px_rgba(0,0,0,0.35)] backdrop-blur-md sm:h-16 sm:w-16 md:h-20 md:w-20">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -m-2 animate-pulse rounded-full bg-white/15 blur-md"
            />
            <span
              className="relative text-[26px] font-semibold uppercase leading-none tracking-[-0.02em] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] sm:text-[32px] md:text-[36px]"
              style={{ fontFamily: 'var(--j-font-display)' }}
            >
              VS
            </span>
          </div>

          {/* Right crew — USA, magenta/pink-tinted halo */}
          <div className="relative flex flex-1 flex-col items-center gap-3 rounded-2xl border border-white/15 bg-black/25 px-4 py-4 shadow-xl backdrop-blur-md">
            <div className="absolute inset-0 -z-0 rounded-2xl bg-[radial-gradient(ellipse_at_50%_60%,rgba(216,59,255,0.45),transparent_70%)]" />
            {/* Brand medallion — USA flag framed by the magenta/pink gradient. */}
            <div
              className="relative flex h-[76px] w-[76px] items-center justify-center rounded-full p-[3px] shadow-[0_14px_34px_rgba(216,59,255,0.55)] sm:h-[88px] sm:w-[88px]"
              style={{ backgroundImage: 'linear-gradient(135deg, #d83bff 0%, #ff3ba8 100%)' }}
            >
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
                <FlagIcon flag="🇺🇸" className="h-auto w-[64%]" />
              </div>
            </div>
            <div className="relative flex items-center gap-2">
              <span className="text-[14px] font-semibold uppercase tracking-[0.18em] text-white [font-family:var(--j-font-mono)]">
                USA
              </span>
            </div>
            <div className="relative flex items-end justify-center gap-1 sm:gap-2">
              {[
                `${assetBase}/bou-animated/06-squad-row1-explorer.svg`,
                `${assetBase}/bou-animated/09-squad-row2-rival.svg`,
                `${assetBase}/bou-animated/10-squad-row2-rapid.svg`,
              ].map((src) => (
                <div
                  key={src}
                  className="relative h-16 w-12 sm:h-20 sm:w-16"
                  style={{ filter: 'drop-shadow(0 8px 18px rgba(216,59,255,0.55))' }}
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Primary CTA — the band's single action. */}
        <button
          type="button"
          onClick={onJoin}
          aria-label="Enter the Battle of Universities — verify your student email to join your university's Official Squad and predict for your school"
          className="mt-6 inline-flex h-12 w-full max-w-[360px] items-center justify-center gap-2 rounded-xl border border-white/40 bg-amber-300 px-8 text-[13px] font-semibold uppercase tracking-[0.18em] text-zinc-950 shadow-lg transition hover:translate-y-[-1px] hover:bg-amber-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 [font-family:var(--j-font-mono)]"
        >
          Join the Battle →
        </button>
        {/* What entering requires lives in the ⓘ, not a paragraph. */}
        <span className="mt-3 inline-flex text-white/80">
          <InfoTip content="Verify your student email and you're automatically on your university's Official Squad — then place predictions to lift your school's average Edge." />
        </span>

        {/* Meta footer — prize pool collected into one calm glass row. */}
        <div className="mt-6 flex w-full flex-wrap items-center justify-center gap-x-7 gap-y-3 rounded-xl border border-white/25 bg-black/30 px-5 py-4 shadow-lg backdrop-blur-md sm:px-6">
          {[
            {
              label: 'Prize Pool',
              value: `$${prizePool.toLocaleString('en-US')}`,
              info: 'Total prize money for the season, awarded to the university that finishes with the highest average Edge across its qualified members.',
            },
          ].map((tile, i) => (
            <span key={tile.label} className="inline-flex items-center gap-x-7">
              {i > 0 && <span aria-hidden className="hidden h-5 w-px bg-white/30 sm:block" />}
              <span className="inline-flex items-baseline gap-2.5 text-white">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 [font-family:var(--j-font-mono)]">
                  <InfoTip content={tile.info}>{tile.label}</InfoTip>
                </span>
                <span
                  className="text-[20px] font-semibold leading-none tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] sm:text-[22px]"
                  style={{ fontFamily: 'var(--j-font-display)' }}
                >
                  {tile.value}
                </span>
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
