import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://forbesproductions.us',
  output: 'static',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'auto', format: 'directory' },
  devToolbar: { enabled: false },
  integrations: [sitemap({ filter: (page) => !page.includes('/event-gallery') })],
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
});
