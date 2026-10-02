# Portfolio launch checklist review

Reviewed October 1, 2026. This is a static Astro portfolio, with no visitor accounts, database, submission form, file uploads, application API or runtime ML service. The checklist supplied by the user is assessed against that actual scope.

| # | Checklist item | Portfolio status |
|---|---|---|
| 1 | Hide API keys | No runtime API keys. Source and Git history scanned for credential patterns before publication. |
| 2 | Purge Git secrets | No secrets found in reviewed Git objects; no purge required. Research, environment files and private evidence are ignored. |
| 3 | Use public DB key | Not applicable: no database or DB client. A public key alone would not secure database access. |
| 4 | Enable row-level security | Not applicable: no database records. |
| 5 | Encrypt sensitive data | HTTPS and HSTS active. No visitor data is stored. The supplied resume and professional contact details are intentionally public. |
| 6 | Enforce server-side auth | Not applicable: all portfolio pages are public; no protected application routes. |
| 7 | Lock record access | Not applicable: no records or user accounts. |
| 8 | Block field tampering | Not applicable: no state-changing submission endpoints. |
| 9 | Secure session cookies | Not applicable: portfolio code creates no authentication sessions or cookies. Local storage contains only a theme preference. |
| 10 | Hash passwords | Not applicable: portfolio never receives or stores passwords. |
| 11 | Rate-limit login | Not applicable: no login endpoint. |
| 12 | Add bot protection | No login, contact form or uploads to protect. No CAPTCHA was added to static page browsing. This does not guarantee immunity to traffic abuse. |
| 13 | Parameterize queries | Not applicable: no database queries. |
| 14 | Validate all input | Theme preference accepts only `light` or `dark`; corrupt/blocked storage tested. Project metadata validated at build time. Unexpected query strings and malformed URLs tested. |
| 15 | Escape user content | No visitor-generated content is rendered. Static Astro output uses framework escaping; the theme initializer is a trusted constant, registered with a CSP hash. An unapproved inline-script probe is blocked. |
| 16 | Restrict file uploads | Not applicable: no upload interface or endpoint. |
| 17 | Trim API responses | Not applicable: no application API. Robots and sitemap are static build artifacts. |
| 18 | Add security headers | Added CSP restrictions, anti-framing, MIME-sniffing protection, referrer policy and disabled camera/microphone/location permissions. Astro generates CSP hashes for approved scripts. |
| 19 | Force HTTPS | HTTP redirects to HTTPS; Vercel supplies HSTS. |
| 20 | Scan dependencies | `npm audit` reports zero known vulnerabilities against the committed lockfile. |

## Visitor testing

Run `npm run build`, start `npm run preview`, then run `npm test` and `npm run test:visitor`. The latter can target only localhost or the approved production domain using `PORTFOLIO_URL`.

Checks include mobile-menu selection/outside click/Escape/resize, rapid theme changes, corrupt and blocked storage, browser back/forward, cycling through project pages, case-study anchors, 320–1920px layouts including the 760/761px breakpoint, JavaScript-disabled content, reduced motion, missing fonts, unexpected fragments/query strings, rejected private/source/API paths, a real 404 recovery flow, resume integrity and CSP enforcement. Screenshots and machine-readable results are written to ignored `output/verification/`.

Tests use Microsoft Edge on Windows. They are bounded browser and HTTP checks, not load testing, a complete penetration test, native Safari/Firefox coverage or proof that every future vulnerability is absent. Dependency audits cover published advisories, not unknown or malicious-package behavior.

## Image correction

The original UFC `.png` was actually a compressed 1425×891 JPEG. It was replaced with a reviewed 2880×2000 lossless capture of the running application. Case-study image variants now extend to 2320px when the source supports it; cards include 1160px variants. Responsive sizes reflect the rendered layout. No application source or dataset was added to the public repository.

The review also caught a malformed `robots.txt`: escaped newline text was emitted instead of line breaks. It now emits separate crawler directives, with a regression assertion in the visitor check.

Configuration references: [Astro CSP](https://docs.astro.build/en/reference/configuration-reference/#securitycsp), [Vercel response headers](https://vercel.com/docs/project-configuration/vercel-json#headers).
