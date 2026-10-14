# Site Analysis — Infinity Fabtech Pvt. Ltd. Website

> Note: This project folder is named "Madhu Ratna Industry", but the actual site (package name `infinity-fabtech`, domain `www.infinityfabtech.com`) is built for **Infinity Fabtech Pvt. Ltd.**, a pre-engineered steel building (PEB) manufacturer based in Indore, MP. The folder name appears unrelated to the site's content.

## Tech Stack

- **Framework:** Next.js 15.5.18 (App Router), React 19.1.0, TypeScript 5 (strict mode), built with `--turbopack`
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Forms:** react-hook-form + zod + @hookform/resolvers
- **Other libraries:** framer-motion (animations), lucide-react (icons), react-simple-maps + d3-geo (India map)
- **Lint:** ESLint 9 flat config extending `next/core-web-vitals` and `next/typescript`
- No test framework, no CI configuration
- `README.md` is still the default, unmodified `create-next-app` boilerplate

## Site Structure / Pages

App Router (`src/app`):

- `/` — Home: Hero, CompanyOverview, RoofExplorer, FeaturedProducts, ServicesOverview, WhyChooseUs, ProjectsOverview, ManufacturingExcellence, ProductApplications, RequestQuoteCTA
  - ⚠️ `TestimonialsSection` is imported but **commented out** — testimonial content exists but isn't rendered
- `/about` — largest page (595 lines): company history, mission/vision, leadership, standards, facility gallery, awards
- `/products` — product listing
- `/products/[slug]` — product detail pages (9 products defined)
- `/projects` — projects/portfolio, including a "Pan-India Footprint" map
- `/services` — services listing (5 services)
- `/contact` — contact form + WhatsApp panel
- `not-found.tsx` — custom 404
- `robots.ts`, `sitemap.ts` — dynamically generated

### Sitemap issue
`sitemap.ts` lists a static `/industries` route that has no corresponding page (dead link, will 404), and it **omits** `/projects` even though that page exists and is linked from nav/footer.

## Content Status

`CONTENT_REQUIREMENTS.md` and `OTHER_CONTENT_REQUIREMENTS.md` are essentially blank client-intake templates asking for products/projects/services/page copy. However, `src/data/*.ts` is **already fully populated** with real content, so these docs look stale/superseded:

- `products.ts` — 8 products, full descriptions/features/specs
- `projects.ts` — 10 named real projects (ALIMCO, Tata Motors, Transworld, DBL, Macleods Pharma, etc.) + 35-entry client list
- `services.ts` — 5 services
- `testimonials.ts` — 4 testimonials (unused, see above)
- `company.ts`, `about.ts`, `landing.ts`, `contact.ts`, `footer.ts` — company history, mission/vision, standards (MBMA/AISC/IS codes), addresses, phone numbers

**Recommendation:** confirm with the client whether the two requirements docs should still be used for a content review/verification pass, or archived as done.

## Assets (public/)

Present: 9 product images, 2 leadership photos (`amit_sankhla.png`, `ganesh_sankhla.png`), `hero-bg.png`, `india-map.svg`, `india-states.json`. Unused Next.js boilerplate SVGs (`file.svg`, `globe.svg`, etc.) can be removed.

### Missing images (referenced in code, absent on disk — will show broken images)
- `/images/about/award1.png`, `award2.png`, `award3.png` (About page awards section)
- `/images/about/factory1.png`–`factory4.png` (About page facility gallery)
- `logo.png` — referenced in `src/lib/seo.ts` JSON-LD Organization schema; hurts SEO rich-result rendering

`src/crop-images.py` was meant to generate the factory1–4 crops but points to a personal `~/.gemini` temp path that doesn't exist in this repo — that's why those images never landed.

## Utility Scripts

| Script | Purpose |
|---|---|
| `generate-map.js` | Reads `public/india-states.json`, fixes polygon winding, projects via d3-geo Mercator, writes `public/india-map.svg` for the Projects page map |
| `copy-images.js` | Misleadingly named — actually a debug script logging "huge coordinate" states after projection; not part of the build |
| `src/crop-images.py` | One-off Pillow script to crop a screenshot into factory1–4.png; hardcoded personal path, not reproducible |
| `delete-old-files.js` | Dead file — just a comment, no code |

None of these are wired into `package.json` scripts; all run manually.

## Notable Issues (priority order)

1. **7 broken image references** on the About page (3 awards + 4 factory photos) — highest priority visual bug.
2. **Contact form & Quote modal don't submit anywhere real.** Both just `await new Promise(setTimeout)` + `console.log` ("Simulate API call") — no `/api` route, email service, or CRM webhook. **Real customer inquiries are currently not captured or delivered anywhere.** This should be fixed before launch.
3. **Missing `logo.png`** for JSON-LD structured data — impacts SEO.
4. **TestimonialsSection commented out** on homepage despite having real content — confirm if intentional.
5. **Sitemap inconsistency** — dead `/industries` entry, missing `/projects` entry.
6. **README.md** is unedited boilerplate — should document this project/setup/deploy process.
7. **Stale content-intake docs** (`CONTENT_REQUIREMENTS.md`, `OTHER_CONTENT_REQUIREMENTS.md`) — content already implemented in `src/data`.
8. **Dead/misnamed root scripts** (`copy-images.js`, `delete-old-files.js`) clutter the repo — candidates for removal.
9. **Git history** is mostly uninformative — 6 of 8 commits are titled "new update" with no detail.
10. **`next.config.ts`** is an empty scaffold — fine while all images are local, but revisit if external image domains are added.

## Key File References

- `src/app/about/page.tsx` — missing image refs (~lines 277-279, 387-390)
- `src/components/contact/ContactForm.tsx` (~line 44-49) — simulated submit
- `src/components/common/QuoteModal.tsx` (~line 70-75) — simulated submit
- `src/app/sitemap.ts` — route list issue
- `src/lib/seo.ts` — missing `logo.png` reference
- `src/crop-images.py`, `copy-images.js`, `delete-old-files.js` — script cleanup candidates
