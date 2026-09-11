/**
 * Vertical colour coding for the forecast landing. Each market vertical owns a
 * hue (brand book: sports rose, politics mint, economy gold, e-sport hot pink,
 * film orchid); `accent` is the full brand sweep used for the emphasised tile.
 */
export type Tone = 'sports' | 'politics' | 'economy' | 'esport' | 'film' | 'accent';

export const TONE_VAR: Record<Tone, string> = {
  sports: 'var(--fx-sports)',
  politics: 'var(--fx-politics)',
  economy: 'var(--fx-economy)',
  esport: 'var(--fx-esport)',
  film: 'var(--fx-film)',
  accent: 'var(--fx-pink)',
};

export const toneColor = (tone?: string): string => TONE_VAR[(tone as Tone) ?? 'accent'] ?? 'var(--fx-pink)';
