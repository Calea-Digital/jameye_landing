/**
 * Self-contained layout wrappers for the Edge Score Builder, ported from the
 * app's `GlowCard` / `PageGlow` / `PageShell` with NO external dependencies
 * (no `cn`, no `@/` aliases). They rely on the classes defined in
 * `edge-score-builder.css` (`.glass`, `.shadow-glow`, `.brand-hairline`) plus
 * Tailwind utilities. Drop them in or swap for your landing page's own
 * containers — only `GlowCard` is used by the default `EdgeScoreBuilder`.
 */

import type { ReactNode, CSSProperties } from "react";

function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/** Translucent glass slab. `glow` adds the lilac bloom; `topAccent` adds the
 *  brand-gradient hairline across the top edge. */
export function GlowCard({
  glow,
  topAccent,
  className,
  children,
  style,
}: {
  glow?: boolean;
  topAccent?: boolean;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cx(
        "esb-glass rounded-2xl",
        glow ? "esb-shadow-glow" : "shadow-lg",
        topAccent && "relative overflow-hidden",
        className,
      )}
      style={style}
    >
      {topAccent && (
        <span
          aria-hidden
          className="esb-brand-hairline pointer-events-none absolute inset-x-0 top-0 h-px"
        />
      )}
      {children}
    </div>
  );
}

/** Atmospheric background bloom — blurred brand-colored blobs behind content.
 *  Fixed + non-interactive. Drop once near the top of the section. */
export function PageGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[42rem] rounded-full bg-[#7e3bff]/10 blur-[140px]" />
      <div className="absolute top-1/3 -right-24 size-[32rem] rounded-full bg-[#2962ff]/8 blur-[140px]" />
      <div className="absolute -bottom-20 -left-10 size-[28rem] rounded-full bg-[#d83bff]/6 blur-[140px]" />
    </div>
  );
}
