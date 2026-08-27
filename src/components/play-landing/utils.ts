/** Tiny class joiner (stand-in for clsx + tailwind-merge in the mockup). */
export function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}
