/**
 * BattleOfUniversities — the full-width "Battle of Universities" hero, ported
 * for a landing page. Two org panels (crest, flag + name, a squad of fighters,
 * city · country) flank the VS badge, over the prize pool and a live countdown.
 *
 * Decoupled from the app:
 *   • The app drives this from live API hooks (`useFeaturedBattle`,
 *     `useCashTournament`, `useOrganizations`, `useJoinCashTournament`). Here it
 *     takes a single `data: BattleData` prop (with a demo default), and an
 *     optional `onCta` callback — no data layer, no router.
 *   • Real member avatars (the DB-driven `FighterAvatar` subsystem) are replaced
 *     by the self-contained `SquadFighter`, tinted to each org's brand color.
 *
 * Requires Tailwind in the host app + the bundled `battle-of-universities.css`.
 */

// Inline arrow (was lucide-react's <ArrowRight/>) so the landing needs no extra dep.
function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

import { Crest } from "./Crest";
import { SquadFighter } from "./SquadFighter";
import {
  EventHeroCard,
  HeroCountdown,
  HeroPanel,
  HeroStat,
  heroCtaClass,
} from "./EventHeroCard";
import { VsBadge } from "./VsBadge";
import { countryToFlag } from "./country-flag";
import { formatPrize, useNow } from "./format";
import type { BattleData, BattleOrg } from "./types";

const ROSTER_LIMIT = 3;

/* Deep, on-brand arena gradient (Jameye blue → violet → magenta) — replaces the
 * school-color gradient so the card reads as ours, not the universities'. */
const BRAND_GRADIENT =
  "radial-gradient(120% 130% at 50% -20%, #7e3bff 0%, transparent 55%), linear-gradient(120deg, #16235e 0%, #3a1d7a 38%, #6d28d9 66%, #b21fd1 100%)";

/* Hair palettes so the (up to) three fighters per side aren't identical. */
const HAIR_PALETTES: [string, string][] = [
  ["#7e3bff", "#0b0606"],
  ["#1e293b", "#020617"],
  ["#b45309", "#431407"],
];

/** Demo data so the component renders something on its own. Replace via the
 *  `data` prop with your real marketing copy / orgs. */
export const DEMO_BATTLE: BattleData = {
  title: "Battle of Universities",
  subtitle: "Your org is your squad",
  prizeCents: 5_000_000, // $50,000
  closesAt: Date.now() + 1000 * 60 * 60 * 24 * 12 + 1000 * 60 * 60 * 5, // ~12d 5h
  canJoin: true,
  orgs: [
    {
      name: "Stanford University",
      shortName: "Stanford",
      colorPrimary: "#8c1515",
      colorSecondary: "#b1040e",
      city: "Stanford",
      country: "USA",
    },
    {
      name: "University of Oxford",
      shortName: "Oxford",
      colorPrimary: "#002147",
      colorSecondary: "#1d4e89",
      city: "Oxford",
      country: "United Kingdom",
    },
    { name: "ETH Zürich", shortName: "ETH", colorPrimary: "#1f6fb2", colorSecondary: "#0a3d62", city: "Zürich", country: "Switzerland" },
  ],
};

export function BattleOfUniversities({
  data = DEMO_BATTLE,
  onCta,
}: {
  data?: BattleData;
  onCta?: () => void;
}) {
  const now = useNow(1000);

  const roster = data.orgs ?? [];
  if (roster.length < 2) return null;

  const [left, right, ...rest] = roster;
  const canJoin = data.canJoin ?? true;
  const prizeLabel =
    data.prizeLabel ?? formatPrize(data.prizeCents ?? 0);
  const remaining = data.closesAt
    ? new Date(data.closesAt).getTime() - now
    : 0;
  const ctaLabel = data.ctaLabel ?? (canJoin ? "Join the battle" : "View slate");

  return (
    <EventHeroCard
      gradient="tournaments"
      gradientStyle={BRAND_GRADIENT}
      watermark="BOU"
      title={data.title}
      subtitle={data.subtitle ?? "Your org is your squad"}
      cta={
        <button type="button" onClick={onCta} className={heroCtaClass}>
          {ctaLabel} <ArrowRight className="size-4" />
        </button>
      }
      stats={
        <>
          <HeroStat label="Prize pool">{prizeLabel}</HeroStat>
          <div className="flex items-center gap-3">
            <span className="bou-mono text-[10px] font-medium uppercase tracking-[0.22em] text-white/60">
              Season ends in
            </span>
            <HeroCountdown remainingMs={remaining} />
          </div>
        </>
      }
    >
      <div className="grid items-stretch gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <OrgSquadPanel org={left} side="left" />
        <div className="flex items-center justify-center">
          <VsBadge variant="glass" pulse={canJoin} />
        </div>
        <OrgSquadPanel org={right} side="right" />
      </div>

      {rest.length > 0 && (
        <p className="bou-mono text-center text-[10px] uppercase tracking-[0.22em] text-white/70">
          +{rest.length} more {rest.length === 1 ? "org" : "orgs"} in the battle
        </p>
      )}
    </EventHeroCard>
  );
}

/** One side of the battle: crest, flag + name, the squad of fighters, location. */
function OrgSquadPanel({ org, side }: { org: BattleOrg; side: "left" | "right" }) {
  const flag = countryToFlag(org.country);
  const location = [org.city, org.country].filter(Boolean).join(" · ");
  const count = Math.max(0, Math.min(ROSTER_LIMIT, org.squadSize ?? ROSTER_LIMIT));
  const facing = side === "left" ? "right" : "left";
  const avatars = org.avatars ?? [];

  const crestOrg = {
    color_primary: org.colorPrimary,
    color_secondary: org.colorSecondary,
    name: org.name,
    short_name: org.shortName ?? org.name,
    logo: org.logo,
  };

  return (
    <HeroPanel className="flex flex-col items-center gap-4 px-5 py-6">
      <span className="rounded-full shadow-xl ring-4 ring-white/60">
        <Crest org={crestOrg} size="lg" />
      </span>

      <div className="flex items-center gap-2 text-center">
        {flag && (
          <span className="text-base leading-none" aria-hidden>
            {flag}
          </span>
        )}
        <span className="bou-mono line-clamp-2 max-w-[12rem] text-sm font-bold uppercase tracking-[0.16em] text-white">
          {org.shortName || org.name}
        </span>
      </div>

      <div className="flex min-h-16 items-end justify-center gap-1.5">
        {avatars.length > 0 ? (
          // Distinct avatar per squad member; left side faces right and vice
          // versa so the two squads square off across the VS badge.
          avatars.slice(0, ROSTER_LIMIT).map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              aria-hidden
              loading="lazy"
              className="h-16 w-12 shrink-0 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)]"
              style={{ transform: facing === "left" ? "scaleX(-1)" : undefined }}
            />
          ))
        ) : count > 0 ? (
          Array.from({ length: count }).map((_, i) => {
            const [hairFrom, hairTo] = HAIR_PALETTES[i % HAIR_PALETTES.length];
            return (
              <span key={i} className="h-16 w-12 shrink-0">
                <SquadFighter
                  uid={`${side}-${i}`}
                  jersey={org.colorPrimary}
                  hairFrom={hairFrom}
                  hairTo={hairTo}
                  facing={facing}
                />
              </span>
            );
          })
        ) : (
          <span className="bou-mono text-[10px] uppercase tracking-widest text-white/50">
            Roster forming
          </span>
        )}
      </div>

      {location && (
        <span className="bou-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
          {location}
        </span>
      )}
    </HeroPanel>
  );
}

export default BattleOfUniversities;
