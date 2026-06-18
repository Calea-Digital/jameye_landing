/**
 * Prize formatting + a ticking clock — ported from the app's
 * `lib/cash-tournament-format.ts` (just the two helpers the Battle hero needs),
 * with no dependency on the API schemas.
 */

import { useEffect, useState } from "react";

/** Cents → compact whole-dollar prize ("$50", "$1.2K", "$2M"). */
export const formatPrize = (cents: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Math.round(cents / 100));

/** A ticking clock that re-renders on `intervalMs` so countdowns stay live.
 *  Defaults to 1s here (the app uses 60s) so the landing countdown visibly
 *  ticks its seconds digit. */
export const useNow = (intervalMs = 1000): number => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
};
