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

  // No Astro i18n routing: the single 'en' locale is just a physical folder
  // (src/pages/en → /en/...) and localisation is handled by the custom helper
  // in src/utils/i18n. Astro i18n with prefixDefaultLocale:false made the dev
  // server 404 every /en route (it expects the default locale to be unprefixed)
  // even though the build still emitted them.

  // Content lives under /en (see src/pages/en). The bare root (src/pages/index)
  // renders the homepage directly — NOT a redirect — so crawlers get real OG
  // tags. The legacy unprefixed routes below still redirect to their /en homes.
  redirects: {
    '/about': '/en/about',
    '/leaderboard': '/en/leaderboard',
    '/terms': '/en/terms',
    '/privacy': '/en/privacy',
    '/cookies': '/en/cookies',
  },

  integrations: [icon(), sitemap(), mdx(), react()],
});
