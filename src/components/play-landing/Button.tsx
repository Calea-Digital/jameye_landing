import * as React from "react";
import { cn } from "./utils";

/**
 * Minimal port of the mockup's shadcn Button — only the variants the landing
 * actually uses (`tactical` / `tacticalGhost` / default).
 */
type Variant = "default" | "tactical" | "tacticalGhost";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-[13px] font-semibold uppercase tracking-[0.14em] cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC4899]/60 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

const VARIANTS: Record<Variant, string> = {
  default:
    "h-9 px-4 py-2 bg-[#EC4899] text-white shadow-[0_8px_24px_-10px_var(--color-hud-magenta)] hover:brightness-110",
  tactical: "tactical-cta",
  tacticalGhost: "tactical-ghost",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    if (variant === "tactical") {
      return (
        <button className={cn(BASE, VARIANTS.tactical, className)} ref={ref} {...props}>
          <span className="tactical-cta-inner">{children}</span>
        </button>
      );
    }
    return (
      <button className={cn(BASE, VARIANTS[variant], className)} ref={ref} {...props}>
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export default Button;
