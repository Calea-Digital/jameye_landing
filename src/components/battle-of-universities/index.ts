/**
 * Battle of Universities — public exports.
 *
 * Remember to import the stylesheet once in your app:
 *   import "./battle-of-universities-export/battle-of-universities.css";
 */

export { BattleOfUniversities, DEMO_BATTLE, default } from "./BattleOfUniversities";
export type { BattleData, BattleOrg } from "./types";

// Building blocks, exported in case you want to compose your own layout:
export { EventHeroCard, HeroPanel, HeroStat, HeroCountdown, heroCtaClass } from "./EventHeroCard";
export { ArenaBackdrop, type ArenaTint } from "./ArenaBackdrop";
export { VsBadge } from "./VsBadge";
export { Crest } from "./Crest";
export { SquadFighter } from "./SquadFighter";
export { battleGradient, brandGradientStyle, orgMonogram, type BrandColors } from "./brand";
export { countryToFlag } from "./country-flag";
export { formatPrize, useNow } from "./format";
