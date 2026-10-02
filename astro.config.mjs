import { defineConfig } from 'astro/config';

// Set SITE_URL when publishing; local builds do not invent a production domain.
const site = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);
export default defineConfig({
  ...(site ? { site } : {}),
  base: process.env.BASE_PATH || '/',
  output: 'static',
  redirects: { '/projects/reddit-clone/': '/projects/common/' },
  markdown: { syntaxHighlight: false },
  security: { csp: { directives: ["default-src 'self'", "img-src 'self' data:", "font-src 'self'", "connect-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'none'"] } },
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
