/**
 * Org branding-as-data helpers, ported from the app's
 * `components/game-modes/organizations/brand.ts` (trimmed to what the Battle
 * surface uses). Org colors are data, so inline style is the sanctioned channel.
 */

import type { CSSProperties } from "react";

/** Minimal color-pair shape every org provides. */
export type BrandColors = {
  color_primary: string;
  color_secondary: string;
};

/** Expose the org's color pair as CSS custom properties. */
export const brandVars = (b: BrandColors): CSSProperties =>
  ({
    "--org-primary": b.color_primary,
    "--org-secondary": b.color_secondary,
  }) as CSSProperties;

/** Filled gradient from the org color pair — crest discs, accent fills. */
export const brandGradientStyle = (b: BrandColors): CSSProperties => ({
  ...brandVars(b),
  background:
    "linear-gradient(135deg, var(--org-primary) 0%, var(--org-secondary) 100%)",
});

/** Wide hero gradient painted from the competing orgs' PRIMARY colors only —
 *  one stop per org, evenly spaced, so the Battle surface flows through each
 *  org's signature color. Returns a CSS `background-image` string. */
export const battleGradient = (orgs: readonly BrandColors[]): string => {
  const colors = orgs.map((o) => o.color_primary).filter(Boolean);
  if (colors.length === 0) return "";
  if (colors.length === 1) {
    return `linear-gradient(120deg, ${colors[0]} 0%, ${colors[0]} 100%)`;
  }
  const stops = colors
    .map((c, i) => `${c} ${Math.round((i / (colors.length - 1)) * 100)}%`)
    .join(", ");
  return `linear-gradient(120deg, ${stops})`;
};

/** Up-to-two-letter monogram for the crest fallback disc. */
export const orgMonogram = (org: { name: string; short_name: string }) => {
  const source = (org.short_name || org.name).trim();
  const words = source.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
};
