import { cn } from "./cn";
import { brandGradientStyle, orgMonogram, type BrandColors } from "./brand";

type CrestOrg = BrandColors & {
  name: string;
  short_name: string;
  logo?: string | null;
};

const sizeClass = {
  xs: "size-3.5 text-[7px]",
  sm: "size-7 text-[10px]",
  md: "size-11 text-sm",
  lg: "size-16 text-lg",
} as const;

/** Org crest: the logo when present, otherwise a monogram disc filled with the
 *  org's brand gradient. Ported from the app's `Crest`; `ring-glass-border`
 *  token swapped for a concrete `ring-white/15`. */
export function Crest({
  org,
  size = "md",
  className,
}: {
  org: CrestOrg;
  size?: keyof typeof sizeClass;
  className?: string;
}) {
  if (org.logo) {
    return (
      <img
        src={org.logo}
        alt=""
        aria-hidden
        className={cn(
          "shrink-0 rounded-full object-cover ring-1 ring-white/15",
          sizeClass[size],
          className,
        )}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={brandGradientStyle(org)}
      className={cn(
        "bou-mono grid shrink-0 place-items-center rounded-full font-bold uppercase text-white ring-1 ring-white/15",
        sizeClass[size],
        className,
      )}
    >
      {orgMonogram(org)}
    </span>
  );
}
