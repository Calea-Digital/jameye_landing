import { cn } from "./cn";

export type ArenaTint = "duels" | "squad" | "tournament";

/* Radial washes per game mode. The app composes these from `--accent-*` CSS
   vars; here the brand hex values are inlined so no app theme is required.
   NOTE: the Battle hero renders with `washes={false}` (the gradient already
   supplies color), so these only matter if you enable washes elsewhere. */
const WASH: Record<ArenaTint, string> = {
  duels:
    "radial-gradient(820px circle at 50% -5%, color-mix(in oklch, #d83bff 32%, transparent), transparent 55%), radial-gradient(620px circle at 10% 95%, color-mix(in oklch, #2962ff 22%, transparent), transparent 55%), radial-gradient(620px circle at 90% 12%, color-mix(in oklch, #a78bff 22%, transparent), transparent 55%)",
  squad:
    "radial-gradient(820px circle at 50% -5%, color-mix(in oklch, #ff3ba8 30%, transparent), transparent 55%), radial-gradient(620px circle at 10% 95%, color-mix(in oklch, #a78bff 22%, transparent), transparent 55%), radial-gradient(620px circle at 90% 12%, color-mix(in oklch, #d83bff 22%, transparent), transparent 55%)",
  tournament:
    "radial-gradient(820px circle at 50% -5%, color-mix(in oklch, #5b8dff 30%, transparent), transparent 55%), radial-gradient(620px circle at 10% 95%, color-mix(in oklch, #2962ff 22%, transparent), transparent 55%), radial-gradient(620px circle at 90% 12%, color-mix(in oklch, #a78bff 22%, transparent), transparent 55%)",
};

/**
 * Atmospheric arena layer — layered brand-hue radial washes plus drifting
 * diagonal speed-lines. Purely decorative (`pointer-events-none`).
 *
 * - `washes` (default on): the colored radial bloom. Turn OFF when the host
 *   already supplies color (e.g. inside the gradient `EventHeroCard`), leaving
 *   just the speed-lines.
 */
export function ArenaBackdrop({
  tint = "duels",
  washes = true,
  className,
}: {
  tint?: ArenaTint;
  washes?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {washes && (
        <div
          className="absolute inset-0 opacity-80"
          style={{ backgroundImage: WASH[tint] }}
        />
      )}
      <div className="bou-speed-lines absolute inset-0 opacity-[0.06] mix-blend-screen" />
    </div>
  );
}
