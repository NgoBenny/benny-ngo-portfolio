# Benny Ngo: portfolio

A personal portfolio built with Astro, TypeScript, and plain CSS. Four project case studies sit in a two-column desktop grid and stack on mobile. The site generates static HTML and serves the supplied resume PDF without a backend, contact form, or running ML service.

Live site: https://benny-ngo-portfolio.vercel.app/ · Source: https://github.com/NgoBenny/benny-ngo-portfolio

## How it works

Markdown case studies pass through an Astro content collection with a typed schema, then generate project pages, navigation, and homepage cards. Shared components handle project previews, architecture diagrams, and the page layout. Astro optimizes screenshots at build time.

The site follows the system theme until a visitor chooses one. The choice is remembered when storage is available; theme switching still works when it is blocked. Native links and the mobile disclosure keep the content usable without JavaScript.

The case studies cover Common, Live NBA Win Probability, UFC Win Predictor, and Job Application Copilot. Their summaries distinguish public source, private source, archived model results, and provisional candidates. A portfolio page is not a live deployment or independent validation of the application it describes.

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

The Copilot dashboard image comes from [the public repository’s fabricated-data screenshots](https://github.com/NgoBenny/job-application-copilot-public/tree/f42b294d182032f9830c7766d39cc5341d72746e/docs/screenshots). It contains no real application data.

Private projects use `sourceVisibility: private` and cannot include `repositoryUrl`. A public demo is optional; add `demoUrl` only after checking it works without access to private accounts. Source ownership does not imply sole authorship. Keep quantitative results paired with model version and evaluation context. School source, private research and raw data do not belong in this repository or its assets.

## Browser verification

Build and start the preview first, then run `npm test` in another terminal. The smoke suite uses Node assertions, Playwright and axe. It tests responsive overflow, keyboard navigation, mobile disclosure, themes, blocked storage, reduced motion, JavaScript-disabled content, links/routes and private-source rules. It saves desktop/mobile/light/dark screenshots under ignored `output/verification/`.

The smoke suite also checks the four-card desktop grid, single-column mobile layout, and Copilot’s public repository link without a hosted-demo button. The visitor suite cycles through all four project pages and checks five routes at nine screen widths.

Run `npm run test:visitor` for adversarial visitor flows and failure cases. This suite can also target the deployed portfolio with `PORTFOLIO_URL=https://benny-ngo-portfolio.vercel.app/`. See [SECURITY_REVIEW.md](SECURITY_REVIEW.md) for the launch checklist, security scope and testing limits.

These are bounded checks for a public static site. CSP, response headers, and rejected private-path probes do not establish the security of an authenticated application or database. They are not load testing, a full penetration test, or a guarantee that all accessibility issues are absent.

On Windows it uses installed Microsoft Edge. Elsewhere run `npx playwright install chromium` once. `PLAYWRIGHT_CHANNEL` can select an installed supported browser. Local-only URL override: `PORTFOLIO_URL=http://127.0.0.1:4321`.

Lighthouse can use installed Edge with `CHROME_PATH` set to the Edge executable:

```sh
npx lighthouse http://127.0.0.1:4321 --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless" --output=json --output-path=output/verification/lighthouse.json
```

## Hosting

Source: https://github.com/NgoBenny/benny-ngo-portfolio. Deploy `dist/` to Vercel Hobby: framework Astro, install `npm ci`, build `npm run build`, output `dist`. There is no runtime adapter or secret requirement. Use a free generated domain; enable no paid add-ons. The build uses Vercel's production-domain environment variable for canonical links, social-image URLs, sitemap and robots. Set `SITE_URL` explicitly if the canonical domain changes. Before an origin is configured, local output omits absolute canonical/social URLs and generates an empty sitemap.

The Vercel project is connected to this repository's `main` branch. Pushing to `main` automatically creates a production deployment; other branches receive preview deployments. Production access is public. No paid services, forms or analytics are enabled.

For GitHub Pages set `SITE_URL=https://ngobenny.github.io` and `BASE_PATH=/benny-ngo-portfolio/` for this project site, or `/` for a user site. Build with the official Astro Pages action. Internal links/assets use the configured base.

Verify all project routes, resume, contact links, metadata and asset URLs on the hosted domain. Git history and Vercel deployment history provide rollback. Update the resume and claims when their source evidence changes. No recurring automation or analytics is configured.

If a contact form is added later, use server-side validation, server-verified bot protection, persistent rate limits, size limits and delivery quotas. Honeypots alone do not prevent abuse. Do not expose email-provider credentials in client code.
