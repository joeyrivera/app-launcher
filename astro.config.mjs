// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

// Custom-domain GitHub Pages deploy. Update `site` to the final subdomain
// (must match public/CNAME). base stays '/' for a custom domain.
export default defineConfig({
  site: 'https://apps.myexperiments.app',
  base: '/',
  integrations: [mdx(), sitemap(), tailwind()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
