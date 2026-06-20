/**
 * Landing-side wrapper for the app's Battle of Universities promo band.
 *
 * Astro islands can't take function props, so `onJoin` is wired here
 * (client-side): the "Join the Battle" button opens the waitlist modal via the
 * page's existing `[data-open-waitlist]` control.
 */
import BouPromoBand from "./BouPromoBand";

export default function BattleIsland({ prizePool }: { prizePool?: number }) {
  const onJoin = () =>
    document.querySelector<HTMLElement>("[data-open-waitlist]")?.click();
  return <BouPromoBand prizePool={prizePool} onJoin={onJoin} />;
}
