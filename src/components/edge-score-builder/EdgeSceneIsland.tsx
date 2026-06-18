/**
 * Landing-side wrapper for the app's Edge Score Builder scene.
 *
 * Astro islands can't receive function props, so `onStart` is wired here
 * (client-side): tapping the START node / "Tap to play" opens the waitlist
 * modal by triggering the page's existing `[data-open-waitlist]` control.
 *
 * Renders the scene inside the same `GlowCard` the app uses, so it's a 1:1
 * match. The bilingual header lives in HowItWorks.astro (i18n), matching the
 * app's header copy.
 */
import { LoopExpeditionScene } from "./LoopExpeditionScene";
import { GlowCard } from "./ui";

export default function EdgeSceneIsland() {
  const onStart = () => {
    const opener = document.querySelector<HTMLElement>("[data-open-waitlist]");
    opener?.click();
  };

  return (
    <GlowCard glow className="overflow-hidden px-2 py-8 sm:px-4">
      <LoopExpeditionScene onStart={onStart} />
    </GlowCard>
  );
}
