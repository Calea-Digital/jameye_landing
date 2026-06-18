export type Locale = 'en';

export const SUPPORTED_LOCALES: Locale[] = ['en'];
export const DEFAULT_LOCALE: Locale = 'en';

const modules = import.meta.glob('/src/lang/**/*.json', { eager: true, import: 'default' });

export function t<T = unknown>(locale: Locale, section: string): T {
  const key = `/src/lang/${locale}/${section}.json`;
  const mod = modules[key];
  if (!mod) {
    throw new Error(`Missing translation file: ${key}`);
  }
  return mod as T;
}

// All content lives under the locale prefix (e.g. /en, /en/leaderboard).
export function localePath(locale: Locale, path: string = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized === '/') return `/${locale}`;
  return `/${locale}${normalized}`;
}
