// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  site: 'https://jameye.com',
  // 'ignore' so routes resolve with or without a trailing slash (e.g.
  // /leaderboard and /leaderboard/), matching the nginx try_files fallback.
  trailingSlash: 'ignore',

  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
    },
  },

  integrations: [icon(), sitemap(), mdx(), react()],
});
