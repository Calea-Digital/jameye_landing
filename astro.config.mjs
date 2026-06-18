// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

export default defineConfig({
  vite: {
    // Cast: @tailwindcss/vite is typed against a newer Vite than the one Astro
    // bundles, so the plugin types don't structurally match. Runtime is fine.
    plugins: [/** @type {any} */ (tailwindcss())],
  },

  site: 'https://jameye.com',
  // 'ignore' so routes resolve with or without a trailing slash (e.g.
  // /leaderboard and /leaderboard/), matching the nginx try_files fallback.
  trailingSlash: 'ignore',

  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
    },
  },

  // All content lives under /en (see src/pages/en). Redirect the bare root and
  // the legacy unprefixed routes to their /en equivalents.
  redirects: {
    '/': '/en',
    '/leaderboard': '/en/leaderboard',
    '/terms': '/en/terms',
    '/privacy': '/en/privacy',
    '/cookies': '/en/cookies',
  },

  integrations: [icon(), sitemap(), mdx(), react()],
});
