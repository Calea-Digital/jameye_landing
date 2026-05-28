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

export const SITE = (): SiteConfig => {
  return {
    title: 'Jameye — The prediction market tournament',
    description:
      'Jameye ranks the world\'s sharpest minds. Forecast elections, markets, AI and culture. Climb the leaderboard and compete for a $100K+ prize pool.',
    author: 'Jameye',
    siteUrl: 'https://jameye.com/',
    appUrl: APP_URL,
    ogImage: '/src/assets/images/og-image.webp',
    locale: 'en_US',
    twitter: {
      site: '@jameye',
    },
  };
};
