/**
 * Landing-side wrapper for the app's Battle of Universities hero.
 *
 * Astro islands can't take function props, so `onCta` is wired here
 * (client-side): the "Join the battle" button opens the waitlist modal via the
 * page's existing `[data-open-waitlist]` control.
 *
 * `closesAt` is set to ~12 days from first render so the "Season ends in"
 * countdown stays healthy and evergreen (rather than a build-time-fixed date
 * that would eventually go negative).
 */
import { useState } from "react";
import { BattleOfUniversities } from "./BattleOfUniversities";
import type { BattleData } from "./types";

export default function BattleIsland({ data }: { data: Omit<BattleData, "closesAt"> }) {
  const [closesAt] = useState(() => Date.now() + (12 * 24 + 5) * 60 * 60 * 1000);
  const onCta = () => document.querySelector<HTMLElement>("[data-open-waitlist]")?.click();
  return <BattleOfUniversities data={{ ...data, closesAt }} onCta={onCta} />;
}
