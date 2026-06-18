/** Tiny classnames joiner — local replacement for the app's `@/lib/utils` `cn`
 *  so this folder has zero external dependencies. Filters falsy values and
 *  joins with spaces. (No tailwind-merge: the components don't rely on
 *  conflicting-class resolution.) */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
