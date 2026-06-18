/**
 * Shared eye-blink stylesheet for the avatars (the player fighter + the boss).
 *
 * Extracted from the app's `fighterPointer.ts` — only the `ensureFighterStyles`
 * helper is needed here, because both avatars run their OWN cursor-tracking
 * rAF loops internally. Any element marked `data-fighter-eye` (eye whites,
 * irises) squashes vertically on the same rhythm. Self-disables under reduced
 * motion. Injected once per document.
 */

const FIGHTER_STYLES = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes fighterBlink {
    0%, 92%, 100% { transform: scaleY(1); }
    95%, 97%      { transform: scaleY(0.08); }
  }
  [data-fighter-eye] {
    transform-box: fill-box;
    transform-origin: center;
    animation: fighterBlink 4.8s ease-in-out infinite;
  }
}
`;

let stylesInjected = false;

/** Inject the shared blink stylesheet once. Safe to call from any avatar. */
export function ensureFighterStyles(): void {
  if (stylesInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.setAttribute("data-fighter-styles", "true");
  style.textContent = FIGHTER_STYLES;
  document.head.appendChild(style);
  stylesInjected = true;
}
