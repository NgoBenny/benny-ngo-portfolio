import { defineConfig } from 'astro/config';

// Set SITE_URL when publishing; local builds do not invent a production domain.
const site = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);
export default defineConfig({
  ...(site ? { site } : {}),
  base: process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
