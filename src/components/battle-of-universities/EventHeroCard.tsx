import { cn } from "./cn";
import { ArenaBackdrop, type ArenaTint } from "./ArenaBackdrop";

export type HeroGradient = "duels" | "squads" | "tournaments";

/* Map a hero gradient to its arena tint. */
const ARENA_TINT: Record<HeroGradient, ArenaTint> = {
  duels: "duels",
  squads: "squad",
  tournaments: "tournament",
};

/* Full-saturation brand gradients — one hue story per game mode. */
const GRADIENTS: Record<HeroGradient, string> = {
  duels: "linear-gradient(120deg, #2962ff 0%, #7e3bff 55%, #d83bff 100%)",
  squads: "linear-gradient(120deg, #7e3bff 0%, #d83bff 55%, #ff3ba8 100%)",
  tournaments:
    "linear-gradient(120deg, #06b6d4 0%, #2962ff 35%, #7e3bff 65%, #d83bff 100%)",
};

/* Loud arena CTA — amber pill with ink text, readable on any gradient. */
export const heroCtaClass =
  "bou-mono inline-flex items-center justify-center gap-2 rounded-full bg-[#facc15] px-8 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#0a1330] shadow-[0_12px_36px_-10px_rgba(250,204,21,0.55)] transition hover:-translate-y-px hover:brightness-105 active:translate-y-0 disabled:pointer-events-none disabled:opacity-60";

/* Glass sub-panel that reads on the gradient (always light-on-dark). */
export function HeroPanel({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/20 bg-white/12 backdrop-blur-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* One footer stat: mono eyebrow + value. */
export function HeroStat({
  label,
  children,
  className,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="bou-mono text-[10px] font-medium uppercase tracking-[0.22em] text-white/60">
        {label}
      </span>
      <span className="bou-mono text-xl font-medium tabular-nums text-white">
        {children}
      </span>
    </div>
  );
}

/* Boxed digit countdown — D / H / M / S tiles. */
export function HeroCountdown({ remainingMs }: { remainingMs: number }) {
  const total = Math.max(0, Math.floor(remainingMs / 1000));
  const units: [string, number][] = [
    ["D", Math.floor(total / 86400)],
    ["H", Math.floor((total % 86400) / 3600)],
    ["M", Math.floor((total % 3600) / 60)],
    ["S", total % 60],
  ];
  return (
    <div className="flex items-start gap-1.5">
      {units.map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center gap-0.5">
          <span className="bou-mono grid min-w-9 place-items-center rounded-md border border-white/25 bg-white/10 px-1.5 py-1 text-base font-medium tabular-nums text-white">
            {String(value).padStart(2, "0")}
          </span>
          <span className="bou-mono text-[9px] uppercase tracking-widest text-white/50">
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Saturated gradient event hero — the loud arena moment. Glass sub-panels and
 * content sit over a per-mode brand gradient; a translucent ink strip at the
 * bottom carries prize / countdown stats.
 */
export function EventHeroCard({
  gradient = "tournaments",
  gradientStyle,
  eyebrow,
  title,
  subtitle,
  cta,
  stats,
  dense,
  arena,
  watermark,
  className,
  children,
}: {
  gradient?: HeroGradient;
  /** Override the per-mode brand gradient with a custom CSS `background-image`
   *  (e.g. one painted from the competing orgs' colors). `gradient` still
   *  drives the arena tint. */
  gradientStyle?: string;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  cta?: React.ReactNode;
  stats?: React.ReactNode;
  dense?: boolean;
  arena?: boolean;
  /** Giant faint background word (e.g. "BOU") tinted near the background tone. */
  watermark?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={cn("relative overflow-hidden rounded-2xl shadow-xl", className)}
      style={{ backgroundImage: gradientStyle ?? GRADIENTS[gradient] }}
    >
      {/* Sheen + edge falloff so the gradient reads dimensional, not flat. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(900px circle at 50% -20%, rgba(255,255,255,0.22), transparent 55%), linear-gradient(180deg, transparent 60%, rgba(10,19,48,0.35) 100%)",
        }}
      />
      {arena && <ArenaBackdrop tint={ARENA_TINT[gradient]} washes={false} />}

      {/* Giant faint "BOU"-style watermark, nearly the same tone as the bg. */}
      {watermark && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden"
        >
          <span
            className="bou-display select-none font-black leading-[0.8] tracking-tighter text-white/[0.09]"
            style={{ fontSize: "clamp(9rem, 34vw, 26rem)", marginTop: "-0.12em" }}
          >
            {watermark}
          </span>
        </div>
      )}

      <div
        className={cn(
          "relative flex flex-col text-white",
          dense
            ? "gap-3 px-5 py-5 sm:px-6 sm:py-6"
            : "gap-6 px-6 py-8 sm:px-10 sm:py-10",
        )}
      >
        {(eyebrow || title || subtitle) && (
          <header className="flex flex-col items-center gap-2 text-center">
            {eyebrow && (
              <span className="bou-mono inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white/80 backdrop-blur">
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="bou-display text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm font-light text-white/75">{subtitle}</p>
            )}
          </header>
        )}

        {children}

        {cta && <div className="flex justify-center">{cta}</div>}

        {stats && (
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-xl bg-[#0a1330]/35 px-6 py-4 backdrop-blur sm:justify-between">
            {stats}
          </div>
        )}
      </div>
    </section>
  );
}
