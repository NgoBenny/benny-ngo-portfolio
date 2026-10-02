# Benny Ngo — portfolio

Static Astro, TypeScript and CSS portfolio with three project case studies, system-aware light/dark themes, accessible mobile navigation and an unchanged resume PDF. No backend, form or live ML service is required.

## Local commands

Use Node 22.23.3 (or compatible Node 24 LTS), then:

```sh
npm ci
npm run dev
npm run build
npm run preview
```

The dev server uses port 4321. The preview serves the production `dist/` build. `npm run check` performs Astro/TypeScript and content-schema checks.

## Edit content

- `src/data/profile.ts`: biography, education, experience, socials and skills.
- `src/content/projects/*.md`: project metadata and case-study prose; order controls the homepage.
- `src/assets/`: reviewed project screenshots, optimized by Astro at build time.
- `src/styles/global.css`: shared design tokens and responsive layouts.
- `public/resume.pdf`: replace with the canonical PDF without changing its contents.

Private projects use `sourceVisibility: private` and cannot include `repositoryUrl`. A public demo is optional; add `demoUrl` only after checking it works without access to private accounts. Source ownership does not imply sole authorship. Keep quantitative results paired with model version and evaluation context. School source, private research and raw data do not belong in this repository or its assets.

## Browser verification

Build and start the preview first, then run `npm test` in another terminal. The smoke suite uses Node assertions, Playwright and axe. It tests responsive overflow, keyboard navigation, mobile disclosure, themes, blocked storage, reduced motion, JavaScript-disabled content, links/routes and private-source rules. It saves desktop/mobile/light/dark screenshots under ignored `output/verification/`.

On Windows it uses installed Microsoft Edge. Elsewhere run `npx playwright install chromium` once. `PLAYWRIGHT_CHANNEL` can select an installed supported browser. Local-only URL override: `PORTFOLIO_URL=http://127.0.0.1:4321`.

Lighthouse can use installed Edge with `CHROME_PATH` set to the Edge executable:

```sh
npx lighthouse http://127.0.0.1:4321 --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless" --output=json --output-path=output/verification/lighthouse.json
```

## Publish later

Deploy `dist/` to Vercel Hobby: framework Astro, install `npm ci`, build `npm run build`, output `dist`. There is no runtime adapter or secret requirement. Use a free generated domain; enable no paid add-ons. Configure `SITE_URL` to the final HTTPS origin and rebuild. Canonical links, social-image URLs, sitemap and robots then use that origin. Before an origin is configured, local output deliberately omits absolute canonical/social URLs and generates an empty sitemap.

For GitHub Pages set `SITE_URL=https://ngobenny.github.io` and `BASE_PATH=/repository-name/` for a project site, or `/` for the user site. Build with the official Astro Pages action. Internal links/assets use the configured base. No hosting has been connected by this implementation.

Verify all project routes, resume, contact links, metadata and asset URLs on the hosted domain. Git history and Vercel deployment history provide rollback. Update the resume and claims when their source evidence changes. No recurring automation or analytics is configured.

If a contact form is added later, use server-side validation, server-verified bot protection, persistent rate limits, size limits and delivery quotas. Honeypots alone do not prevent abuse. Do not expose email-provider credentials in client code.
