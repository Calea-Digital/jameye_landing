type SiteConfig = {
  title: string;
  description: string;
  author: string;
  siteUrl: string;
  appUrl: string;
  logo?: string;
  ogImage: string;
  locale: string;
  twitter: {
    site: string;
  };
};

export const APP_URL = 'https://staging.jameye.com/login';

/** The public beta — every "Try the beta" call to action points here. */
export const BETA_URL = 'https://play.jameye.com';
export const BETA_HOST = 'play.jameye.com';

export const TELEGRAM_URL = 'https://t.me/JameyeHQ';

export const CONTACT_EMAIL = 'hello@jameye.com';

export const SITE = (): SiteConfig => {
  return {
    title: 'Jameye — Forecast what’s next. Together.',
    description:
      'The creator-driven social forecasting platform. Make your own forecasts on culture, entertainment, sport, science and society, explain your thinking, and follow the outcome.',
    author: 'Jameye',
    siteUrl: 'https://jameye.com/',
    appUrl: APP_URL,
    // Served from public/ so it has a stable, hashless URL. The Layout
    // absolutises it (Open Graph/Twitter require absolute URLs) at render time.
    ogImage: '/images/og-image.webp',
    locale: 'en_US',
    twitter: {
      site: '@jameye',
    },
  };
};
