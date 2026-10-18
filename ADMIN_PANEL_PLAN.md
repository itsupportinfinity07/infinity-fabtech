# Admin Panel Plan — Infinity Fabtech Website

Goal: let an admin edit site content, add projects (with map location + site photos + info that feed the Projects page, map, and detail page), and post jobs — without touching code.

## 1. What the site is today (verified in code)

Next.js 15 (App Router) + React 19 + Tailwind 4, no backend, no database, no `/api` routes. All content is **static TypeScript in `src/data/`**, imported directly by pages and components. Images live in `public/`. Any edit currently = code change + redeploy.

### Content inventory → what the admin must control

| Area | Source today | Shape | Consumed by |
|---|---|---|---|
| Home page copy (hero, stats, why-us, applications, process, CTA labels) | `data/landing.ts` | nested object | Hero, CompanyOverview, WhyChooseUs, ProductApplications, ManufacturingExcellence, ProjectsOverview, RequestQuoteCTA… |
| Company profile (name, address, phones, emails, WhatsApp, hours, map embed, history, mission/vision, core values, infrastructure, go-green, standards, stats) | `data/company.ts` | object | Navbar, Footer, Contact, About, SEO schema |
| About page copy | `data/about.ts` + **hardcoded in `app/about/page.tsx`** (leadership names/bios/photos, awards + factory images, standards short names) | mixed | About |
| Contact / Footer / Careers page copy | `data/contact.ts`, `footer.ts`, `careers.ts` (hero, perks) | objects | respective pages |
| Products (8) | `data/products.ts` | `Product` (slug, specs map, features, images[]…) | /products, /products/[slug], home, quote form, sitemap |
| Services (5) + page copy | `data/services.ts` | `Service`, icon name | /services, home |
| Testimonials (4) | `data/testimonials.ts` | array | `TestimonialsSection` — **currently commented out on the home page** |
| **Projects (10)** | `data/projects.ts` | `Project` (id, name, location *string*, client, type, area, year, description, highlights[], scope[], image, gallery[]) | /projects, /projects/[id], home (first 2), sitemap |
| **Map locations (17 cities, ~35 clients)** | `data/clientLocations.ts` | `{id, city, state, lat, lng, clients[]}` | `IndiaClientMap` (Leaflet + clustering) on /projects |
| **Jobs (4 placeholders)** | `data/careers.ts` → `openings` | slug, title, department, location, type, experience, summary, responsibilities[], requirements[] | /careers, /careers/[slug], sitemap. Apply = `mailto:` link |
| Navigation | hardcoded in `Navbar.tsx`, `footerContent` | arrays | layout |
| Page SEO titles/descriptions | hardcoded per page via `constructMetadata` | strings | every page |

### Key findings that shape the plan

1. **Projects and the map are disconnected.** The 10 projects only have a free-text `location` string (no coordinates). The map is driven by a *separate* client list (`clientLocations.ts`). Adding a project today would **not** put it on the map. This is the main data-model fix.
2. **Many consumers are `"use client"` components that import data directly** (Hero, ProjectsOverview, FeaturedProducts, IndiaClientMap, Footer, Navbar…). They must receive data as props from server components instead.
3. **Forms are fake.** `ContactForm` and `QuoteForm` only `setTimeout` + `console.log` — no inquiry is stored or emailed. Success text still says "GIDC Ahmedabad office" (wrong; company is in Indore).
4. **Job apply is `mailto:`** — works, but no tracking.
5. **Out of scope for admin editing (leave in code):** the interactive engineering tools — `RoofExplorer`, `WallElevation`, `frames3d/*` (3D models, ~2,500 lines). They're technical configurators, not content.
6. Existing bugs worth fixing while here: 7 missing About images (award1–3, factory1–4), missing `logo.png` (SEO schema), sitemap lists dead `/industries` and omits nothing else of note, boilerplate README. (`SITE_ANALYSIS.md` is partly stale: the map uses Leaflet, not react-simple-maps, and the quote form is `components/quote/QuoteForm.tsx`.)

## 2. Recommended architecture

**Keep it inside the same Next.js app** under `/admin` (no separate project): shares types, zod schemas and UI classes, and deploys together.

| Concern | Choice | Why |
|---|---|---|
| Database | **Cloud Firestore** (via `firebase-admin`, server-side only) | Your choice; document model fits this content (nested arrays, JSON-like pages) |
| Auth | **Firebase Authentication** (email + password); admin/editor role as a custom claim | No custom auth code |
| Images | **Base64 stored in Firestore**, one image per document in an `images` collection (see below) | Your choice; no separate storage bucket |
| Forms/validation | existing **react-hook-form + zod** | Already installed |
| Mutations | **Server Actions** + zod re-validation; session cookie verified with Firebase Admin | No REST layer to maintain |
| Cache | Next **ISR + `revalidateTag`** on every save | Public site stays fast; edits go live in ~1s |
| New deps | `firebase-admin`, `firebase` (client, login only), `@dnd-kit/sortable`, `browser-image-compression` | Small set |

### Base64 images in Firestore — how to do it safely
- **1 MiB per document limit** (base64 is ~1.33× the file size) → every image is compressed in the browser before upload to **≤ ~600 KB binary / ~800 KB base64** (e.g. max 1600 px wide, WebP, quality ~0.8), and the upload is rejected above that. Cover/gallery photos at this size look fine on the site.
- **Never embed images inside the project/page document.** A project stores only image IDs; each image is its own doc `images/{id} = {data: "<base64>", mime, w, h, alt, size}`. This keeps project docs tiny and fast to read.
- **Serve images through a route handler** `GET /api/img/[id]`: reads the doc, decodes the base64 and returns binary with `Cache-Control: public, max-age=31536000, immutable` (IDs are never reused). The CDN/browser cache means Firestore is read once per image, not per visitor. Pages reference `/api/img/<id>`, so `next/image` and the existing `ProjectGallery` work unchanged.
- **Cost/limits:** Firestore free tier is 1 GiB storage and 50k reads/day. At ~500 KB per photo that is ~2,000 photos, far more than needed; with caching the read quota is not a concern. Worth knowing: if the site grows to hundreds of large photos, moving to Firebase Storage or Cloudinary later only means changing the `/api/img` handler.
- **Cleanup:** deleting a project/photo deletes its image docs; the media library flags unreferenced images.

Alternative considered and set aside: Firebase or Prisma+Neon. Not needed now that Firestore is chosen. (Assumption: hosted on Vercel or similar, confirm.)

### Public-site data layer (the central change)
Create `src/lib/content/` with one function per entity (`getProjects()`, `getProject(slug)`, `getLocations()`, `getJobs()`, `getPage("landing")`, `getSettings()`…), each wrapped in `unstable_cache` with a tag. Pages/components call these instead of importing `@/data/*`. The old `src/data/*.ts` files become the **seed + fallback** (if DB is unreachable, site still renders).

## 3. Data model (Firestore collections)

```
users/{uid}                role: 'admin'|'editor', email          (mirrors the auth custom claim)

settings/{key}             company, contact, footer, nav, seo     -- one doc each, nested fields as today
pages/{page}               content{}, seo{}, updatedAt/By         -- home, about, services, contact, careers, projects
                           (zod schema per page = today's TS shape)

locations/{id}             city, state, lat, lng, showOnMap, legacyClients[{name, year}]
                           -- the existing 17 cities / ~35 client names become seed data

projects/{id}              slug, name, client, type, area, year, description,
                           highlights[], scope[], locationId, locationLabel,
                           coverImageId, imageIds[] (ordered), imageMeta[{id, alt, caption}],
                           isFeatured, sortOrder, status: draft|published,
                           seoTitle, seoDesc, createdAt, updatedAt

jobs/{id}                  slug, title, department, location, type, experience,
                           summary, responsibilities[], requirements[],
                           status: draft|open|closed, postedAt, closesAt

products/{id}  services/{id}  testimonials/{id}      same fields as today + sortOrder, status/isVisible
inquiries/{id}             source: contact|quote, payload{}, product, status: new|read|replied, createdAt
images/{id}                data (base64), mime, width, height, alt, size, uploadedBy, createdAt
auditLog/{id}              user, entity, entityId, action, at     (optional)
```

Security rules: **deny all direct client reads/writes** (`allow read, write: if false`). All access goes through the server using the Admin SDK, so the public site and admin never expose the database to browsers. Role checks happen in server actions. (Firestore has no joins: the project page does one read for the project plus the image URLs it needs; `/api/img` reads each photo separately.)

## 4. How "add a project" works end-to-end (the core requirement)

Admin form `/admin/projects/new`, tabbed:

1. **Info** — name, slug (auto from name), client, type (select + free text), area, year, description (paragraphs; blank line = new paragraph, matching how the detail page splits text), highlights (add/remove/reorder list), scope (same).
2. **Location** — search box (geocode via OpenStreetMap Nominatim, already the tile provider) + **click/drag pin on a Leaflet map** (Leaflet is already installed). Saves lat/lng, city, state. If a `locations` doc exists within ~5 km / same city, reuse it, so multiple projects in one city share one pin (matches today's "count on pin" UI). Toggle "show on map".
3. **Images** — drag-and-drop multi-upload, client-side resize/compress to ≤1600px WebP (≤~600 KB each, base64 stored as separate `images` docs), drag to reorder, pick **cover**, alt text. First/cover image feeds the card + hero; the rest feed the gallery.
4. **Publish** — Draft / Published, featured toggle (home page shows featured, replacing hardcoded `slice(0,2)`), SEO overrides, **Preview** link, Save → `revalidateTag('projects')`.

What the public site then shows automatically:
- **/projects grid** card (cover, type, location, area, year).
- **/projects/[slug]** hero, overview, highlights, scope, "Project Snapshot" sidebar, **gallery + lightbox** (existing `ProjectGallery` unchanged).
- **Map pin** at the project's coordinates. `IndiaClientMap` side panel is extended: clicking a pin lists *projects at that location* (thumbnail + link to the detail page) above the legacy client names. Pin count = projects + legacy clients.
- Sitemap + SEO metadata + home "featured projects".

## 5. Jobs

`/admin/jobs`: list with status chips, create/edit form (title, department, location, type, experience, summary, responsibilities[], requirements[], closing date), actions Publish / Close / Duplicate / Delete. Public `/careers` lists `status='open'` and not past `closes_at`; `/careers/[slug]` and sitemap follow. Add `JobPosting` JSON-LD (free Google Jobs visibility).
Applications: the `mailto:` apply button stays (confirmed); no in-site application form.

## 6. Editing the rest of the content

- **Page editors (`/admin/content/[page]`)**: one form per page generated from a zod schema mirroring today's objects (hero, badges, titles, CTA labels, stat tiles, process steps, core values, standards list, perks, etc.). Repeaters for arrays, character counters, "reset to default" per field. Icon fields use a dropdown of the allowed Lucide names (the components resolve icon names through maps).
- **Company & contact settings**: phones, emails, WhatsApp number/message, address, hours, Google Maps embed URL, social links — one place; feeds Navbar, Footer, Contact, JSON-LD.
- **Leadership, awards, factory gallery** (currently hardcoded in `about/page.tsx`) move into `page_content.about` with image uploaders — this also fixes the 7 broken images by letting the client upload real ones.
- **Products / Services / Testimonials**: CRUD lists with reorder; testimonials get a "visible" toggle and the home section is re-enabled once ≥1 is visible.
- **Navigation & footer links**: editable lists (label, href, visible).
- **SEO**: per-page title/description/OG image.
- **Media library** `/admin/media`: browse/upload/delete, shows where each file is used before delete.
- **Inquiries inbox**: contact + quote submissions with status; email notification to `info@infinityfabtech.com`.

## 7. Admin app structure

```
src/app/(admin)/admin/
  login/            layout.tsx (auth guard, sidebar)   page.tsx (dashboard: counts, recent inquiries)
  projects/         list · new · [id]/edit
  jobs/             list · new · [id]/edit
  content/[page]/   home · about · services · contact · careers · projects
  products/ services/ testimonials/
  inquiries/ media/ settings/ users/
src/app/api/inquiries/route.ts        (public contact + quote submit, rate-limited)
src/lib/content/*                     (cached public readers)
src/lib/admin/schemas.ts              (zod, shared by form + server action)
src/lib/firebase/{admin,client}.ts
src/app/api/img/[id]/route.ts          (serves base64 image docs as cached binary)
middleware.ts                         (protect /admin, noindex header)
```
Admin UI reuses the site's Tailwind tokens; sidebar layout, tables, toasts. `robots.ts` disallows `/admin`.

## 8. Security

- Firestore rules deny all client access; only server code (Admin SDK) touches data. Service-account key only in server env vars.
- Middleware + server-side `requireRole()` (verifying the Firebase session cookie) in every action; never rely on the UI hiding buttons.
- Zod validation server-side; all content stored as plain text (no raw HTML → no stored XSS).
- Upload checks: MIME allowlist (jpg/png/webp), hard size cap per image (to respect the 1 MiB doc limit), base64 validated server-side.
- Rate-limit login and the public inquiry/application endpoints; honeypot field on forms.
- Roles: `admin` (everything incl. users/settings) vs `editor` (content, projects, jobs). First admin created manually via script.

## 9. Delivery phases

| Phase | Scope | Result |
|---|---|---|
| **0 – Foundations** (~2 d) | Firebase project, Firestore + rules, env, `lib/content` layer with seed fallback, seed script that imports current `src/data/*` (and converts the current product/project images to base64 `images` docs) | DB holds today's exact content |
| **1 – Auth + shell** (~1.5 d) | Firebase login, session cookie, middleware, role guard, admin layout/dashboard, image upload (compress → base64) component and `/api/img/[id]` | Admin can sign in |
| **2 – Projects + Map** (~4 d) | Project CRUD, location picker, image manager, convert `/projects`, `/projects/[slug]`, home featured, `IndiaClientMap` (server wrapper + props), sitemap | **Headline feature live** |
| **3 – Jobs** (~2 d) | Job CRUD, careers pages from DB, JSON-LD, sitemap | Admin can post jobs |
| **4 – Content editors** (~5 d) | Settings, page editors (home/about/services/contact/careers/projects), nav/footer, products, services, testimonials, SEO; refactor client components to take props | All copy editable |
| **5 – Inquiries** (~2 d) | Real contact/quote submit, inbox, email notify, fix "Ahmedabad" text (job applications stay as `mailto:`) | Leads captured |
| **6 – Hardening** (~1.5 d) | Audit log, preview mode, image-in-use checks, backups doc, README, QA on mobile | Handover |

≈ 18 working days solo; phases 0–3 (≈ 9–10 d) deliver exactly the three things you asked for first: projects with map, project galleries, and jobs.

## 10. Files that change on the public site

Replace `@/data/*` imports with `lib/content` calls in: `app/page.tsx` and all `components/home/*` (Hero, ProjectsOverview, FeaturedProducts, ServicesOverview, CompanyOverview, WhyChooseUs, ManufacturingExcellence, ProductApplications, TestimonialsSection, RequestQuoteCTA), `app/{about,contact,services,projects,products,careers}/page.tsx` + `[id]`/`[slug]` pages (add `dynamicParams`/ISR), `components/layout/{Navbar,Footer}.tsx`, `components/projects/IndiaClientMap.tsx`, `components/{contact,quote}/*Form.tsx`, `app/sitemap.ts`, `app/robots.ts`, `lib/seo.ts`, `next.config.ts` (allow `/api/img/*` local images). Route `/projects/[id]` → `/projects/[slug]` with 301s from the old ids (they're already slug-like, so URLs stay the same).

## 11. Decisions (confirmed)

1. **Hosting:** Vercel.
2. **Database:** Firebase Firestore, free (Spark) plan, plus Firebase Auth. Images as base64 documents.
3. **Map:** shows both new projects and the existing client list.
4. **Job applications:** stay as an email (`mailto:`) link. The `jobApplications` collection and resume upload are dropped from scope.

Still open (defaults assumed, tell me to change): who the admins are (default: 1 admin plus optional editor accounts), draft/preview workflow (default: drafts supported, publish on save), and whether to switch the testimonials section back on (default: leave off until at least one testimonial is marked visible).

## 12. Needed from you to start phase 0

- A Firebase project (Firestore in production mode, Authentication with email/password enabled).
- A service-account key (Project settings > Service accounts > Generate key) and the web app config, to be put in `.env.local` and in Vercel environment variables. Never commit these.
- The first admin's email address.
