export type Locale = 'en' | 'es';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'es'];
export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  es: 'ES',
};

const modules = import.meta.glob('/src/lang/**/*.json', { eager: true, import: 'default' });

export function t<T = unknown>(locale: Locale, section: string): T {
  const key = `/src/lang/${locale}/${section}.json`;
  const mod = modules[key];
  if (!mod) {
    throw new Error(`Missing translation file: ${key}`);
  }
  return mod as T;
}

export function localePath(locale: Locale, path: string = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return normalized;
  if (normalized === '/') return `/${locale}/`;
  return `/${locale}${normalized}`;
}
