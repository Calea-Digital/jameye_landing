/** Public data shape for the Battle of Universities hero. Everything the app
 *  fetches from its API (tournament, org directory, leaderboard) is reduced to
 *  this plain object so the landing page can pass static/marketing data. */

export interface BattleOrg {
  /** Display name, e.g. "Stanford University". */
  name: string;
  /** Short name shown on the panel (falls back to `name`). */
  shortName?: string;
  /** Logo URL. When absent, a monogram disc is drawn from the brand colors. */
  logo?: string | null;
  /** Brand colors — drive the crest, the squad jerseys, and the hero gradient. */
  colorPrimary: string;
  colorSecondary: string;
  city?: string;
  /** Free-text country or ISO-2 code; resolved to a flag emoji when possible. */
  country?: string;
  /** How many squad fighters to draw (0–3). Defaults to 3. */
  squadSize?: number;
  /** Explicit avatar image URLs for the squad (one per member, up to 3). When
   *  set, these render instead of the recolored chibi `SquadFighter`. */
  avatars?: string[];
}

export interface BattleData {
  /** Tournament / event name — the hero title. */
  title: string;
  /** Sub-headline under the title. Defaults to "Your org is your squad". */
  subtitle?: string;
  /** Prize in cents; formatted to a compact label ("$50K"). */
  prizeCents?: number;
  /** Pre-formatted prize label — overrides `prizeCents` if provided. */
  prizeLabel?: string;
  /** Countdown target. Accepts a Date, epoch ms, or ISO string. */
  closesAt?: string | number | Date;
  /** Launch-event stat — label + value shown next to the prize pool. */
  launchLabel?: string;
  launchValue?: string;
  /** Competing orgs. The first two flank the VS badge; any extras roll into a
   *  "+N more orgs in the battle" line. Needs at least 2 to render. */
  orgs: BattleOrg[];
  /** CTA button label. Defaults to "Join the battle". */
  ctaLabel?: string;
  /** When true, the VS badge pulses and the default CTA reads "Join the battle"
   *  (vs. "View slate"). Defaults to true. */
  canJoin?: boolean;
}
