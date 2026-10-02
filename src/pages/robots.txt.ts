import type { APIRoute } from 'astro';
export const GET: APIRoute = ({ site }) => new Response(
  `User-agent: *\nAllow: /\n${site ? `Sitemap: ${new URL(import.meta.env.BASE_URL + 'sitemap.xml', site).href}\n` : ''}`,
  { headers: { 'Content-Type': 'text/plain' } },
);
