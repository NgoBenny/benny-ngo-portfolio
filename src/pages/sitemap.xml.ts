import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
export const GET: APIRoute = async ({ site }) => {
  const paths = ['', ...(await getCollection('projects')).map(p => `projects/${p.id}/`)];
  const base = import.meta.env.BASE_URL;
  const entries = site ? paths.map(path => `<url><loc>${new URL(base + path, site).href.replaceAll('&', '&amp;')}</loc></url>`).join('') : '';
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`, { headers: { 'Content-Type': 'application/xml' } });
};
