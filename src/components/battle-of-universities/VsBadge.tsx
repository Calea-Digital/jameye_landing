import { cn } from "./cn";

/**
 * The circular "VS" sticker that anchors every head-to-head matchup.
 *
 * Two looks:
 *  - `brand` — brand-gradient fill with an ink border and glow.
 *  - `glass` — dark translucent disc with a faint white hairline + soft halo
 *    (the look used in the Battle of Universities hero).
 *
 * `pulse` adds an animated halo while a match is forming.
 *
 * Ported from the app's `VsBadge`. The app's `bg-cta` / `shadow-cta` theme
 * tokens are inlined here so no app Tailwind config is required.
 */

const CTA_GRADIENT = "linear-gradient(95deg, #2962ff 0%, #7e3bff 55%, #d83bff 100%)";
const CTA_SHADOW = "0 12px 36px -10px rgba(126,59,255,0.6)";

export function VsBadge({
  size = "md",
  variant = "brand",
  pulse,
  label = "VS",
  className,
}: {
  size?: "sm" | "md";
  variant?: "brand" | "glass";
  pulse?: boolean;
  label?: React.ReactNode;
  className?: string;
}) {
  const glass = variant === "glass";
  return (
    <span className={cn("relative inline-grid shrink-0 place-items-center", className)}>
      {pulse && (
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-full",
            glass
              ? "-m-1 bg-white/10 blur-md motion-safe:animate-pulse"
              : "opacity-50 blur-sm motion-safe:animate-ping",
          )}
          style={glass ? undefined : { backgroundImage: CTA_GRADIENT }}
        />
      )}
      <span
        className={cn(
          "bou-display relative grid place-items-center rounded-full font-semibold leading-none text-white",
          glass
            ? "border border-white/15 bg-white/[0.04] text-white/85 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-md"
            : "border-2 border-[#0a1330]",
          size === "sm" ? "size-12 text-base" : "size-16 text-xl sm:size-20 sm:text-2xl",
        )}
        style={glass ? undefined : { backgroundImage: CTA_GRADIENT, boxShadow: CTA_SHADOW }}
      >
        {label}
      </span>
    </span>
  );
}
