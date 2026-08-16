# Stories by Akshat — Current State & Architecture

> This document originally started as a speculative build brief (kept below,
> in §Original Build Brief, for historical context). Everything above that
> line reflects what's **actually built and running today**, including the
> real-world workarounds discovered along the way. Update this section
> whenever a meaningful architectural decision or gotcha changes.

---

## 1. What this is

A production wedding/portrait/event photography portfolio site for Akshat,
with a public marketing site plus a full `/admin` CMS so Akshat can manage
every piece of content himself without touching code — galleries, films,
photography, journal posts, testimonials, homepage/about copy, and site
settings.

Live at: `https://storiesbyakshat.vercel.app/`

## 2. Actual tech stack (deviations from the original brief noted)

| Concern | What's actually used | Note |
|---|---|---|
| Framework | **Next.js 16.3.0**, App Router, TypeScript, Turbopack | Not 14 as originally speculated. `proxy.ts` replaces `middleware.ts` in this version. |
| Database | **PostgreSQL on Neon** (serverless Postgres) | Started on SQLite during early scaffolding, migrated to Postgres/Neon before real use. |
| ORM | **Prisma 7** with the `@prisma/adapter-pg` driver adapter | Prisma 7 has no `url` in the `datasource` block — connection is wired through `prisma.config.ts` instead. Client output is generated to `lib/generated/prisma` (gitignored, regenerated via `postinstall`). |
| Image/video storage | **Cloudinary** (not AWS S3/CloudFront as originally planned) | Simpler to manage without provisioning AWS infra; built-in transformations, `resource_type: auto` handles photos and short films through one pipeline. |
| Uploads | **Direct browser → Cloudinary** signed uploads | Originally planned as file → Next.js API route → Cloudinary. Switched after discovering Vercel serverless functions cap request bodies at **4.5MB** — far below a real video clip. See §4 Workarounds. |
| Auth | Auth.js (NextAuth) v5 beta, Credentials provider, bcrypt-hashed password | As planned. `proxy.ts` (not `middleware.ts`) + a server-side layout check in `app/admin/(dashboard)/layout.tsx` both guard `/admin/**`. |
| Rich text | Tiptap | As planned, used for journal post bodies. |
| Email | **Gmail SMTP via Nodemailer only** | Resend was evaluated and fully removed — Gmail App Password is the sole email path (contact notifications, auto-replies, password-reset OTPs). |
| Styling | Tailwind CSS v4, custom warm/golden-hour theme | As planned — see palette table below, unchanged from the original design brief. |
| Animation | Framer Motion | As planned. |
| Masonry | `react-masonry-css` for Photography/Portfolio; a **custom asymmetric CSS grid** (not masonry) for Films — see §3. |
| Lightbox | `yet-another-react-lightbox`, but with its **`video` plugin removed** and replaced by a self-rendered video slide — see §4 Workarounds. |
| Deployment | Vercel | As planned. |

### Color palette (unchanged from original brief)
| Role | Name | Hex |
|---|---|---|
| Base background | Sun-Bleached Linen | `#F6EEE1` |
| Secondary surface | Warm Paper | `#EFE3D0` |
| Primary text/ink | Espresso | `#2B1B12` |
| Signature accent | Marigold (golden hour) | `#C98A3B` |
| Secondary accent | Rosewood | `#A85C4E` |
| Muted support | Faded Olive | `#7C7654` |

### Typography (one addition beyond the original brief)
- **Display:** Fraunces (variable, `opsz`/`SOFT`/`WONK` axes)
- **Body:** Inter
- **Accent (italic captions/dates):** Cormorant Garamond, italic-only — this
  font has **no upright face loaded**, which caused a real bug (see §4).
- **Script (added this build):** **Caveat**, used *only* for the "stories by"
  wordmark and the "with love, Akshat" footer signature — not the general
  accent font.

## 3. Actual data model

Beyond the original brief's `User`/`Gallery`/`GalleryImage`/`BlogPost`/
`ContactMessage`, the live schema (`prisma/schema.prisma`) adds a full CMS
layer so nothing is hard-coded in JSX:

- `Testimonial`, `PhilosophyItem`, `PageHeader`, `CategoryTeaser` — repeatable
  content blocks, each editable under `/admin/content`.
- `HomepageContent`, `AboutContent`, `SiteSettings` — singleton rows (one
  row each) holding hero copy, bio text, footer tagline/signature, site
  title/description, and the Instagram link.
- `EditorialImage` — a shared model (with a `type: IMAGE | VIDEO` enum) that
  backs **both** the Photography and Films pages from one admin manager
  (`/admin/editorial`), rather than two separate models.
- `Gallery.order` — added later to support manual up/down reordering in the
  admin gallery list (no drag library — deliberately simple).
- `PasswordResetOtp` — email-based OTP flow for admin password resets
  (`onDelete: Cascade` from `User`).

Every `lib/content.ts` getter is wrapped in a `safeQuery()` helper: at
**build time** errors are re-thrown (so a broken build never ships
silently); at **runtime** they're caught and a typed fallback is returned
(empty array, `null`, or hard-coded launch copy) so a database hiccup
degrades gracefully instead of crashing the page.

Revalidation is `revalidatePath`-based (not tag-based) — see `lib/revalidate.ts`.
Every admin content type has a matching `revalidate*()` helper that purges
exactly the public routes it affects, called from the corresponding
`app/api/admin/**` mutation route. Pages are otherwise fully static
(no `export const revalidate`/`dynamic` anywhere) — content updates appear
instantly via on-demand revalidation, not time-based ISR.

## 4. Real-world workarounds discovered building this

These are the non-obvious things that broke (or would have broken) in
production, and how they were actually fixed — worth knowing before
changing related code:

1. **Vercel's 4.5MB request body limit vs. wedding film clips.**
   Routing uploads through a Next.js API route meant every file had to fit
   inside Vercel's serverless function body-size cap — fine for photos,
   useless for a video. Fixed by having the browser upload **directly** to
   Cloudinary using a short-lived signed request
   (`app/api/admin/upload-signature`) — only that tiny signature payload
   touches our server. Real ceiling is now Cloudinary's own account limits:
   **10MB photos / 100MB video** (confirmed live via the account's usage API).

2. **`yet-another-react-lightbox`'s `video` plugin caps playback to the
   thumbnail's stored pixel dimensions.** It never upscales a small source
   video, so a portrait clip shot at low resolution looked tiny even in
   fullscreen. Fixed by dropping the plugin and self-rendering the video
   slide (`VideoLightboxSlide` in `components/gallery/EditorialGrid.tsx`),
   using CSS (`max-h-[88vh] max-w-[94vw] object-contain`) and manually
   driving play/pause off the lightbox's `offset` prop.

3. **Cormorant Garamond (the italic accent font) has no upright face at
   all.** A plain hyphen in italic captions rendered as a steep diagonal
   slash. Setting `font-style: normal` on it did **nothing** — the browser
   has no non-italic glyphs for that family to fall back to. The actual fix
   (`components/ui/UprightHyphen.tsx`) swaps just the hyphen character to a
   *different font entirely* (the upright body font), not just a style flag.

4. **Orphaned Cloudinary assets on delete.** Deleting a gallery/post/photo
   in admin used to only remove the database row — the actual file stayed
   in Cloudinary forever (storage cost, quota creep). Every delete/replace
   path now also calls Cloudinary's `destroy` API
   (`lib/cloudinary.ts: deleteFromCloudinary` / `deleteManyFromCloudinary`),
   best-effort and non-blocking so a Cloudinary hiccup never blocks a DB
   delete the admin is waiting on.

5. **Long-running Turbopack dev sessions can desync server/client HTML.**
   After many rounds of hot-reloaded edits in one `next dev` session, the
   dev server can serve stale server-rendered HTML while the client bundle
   has already updated, throwing a hydration mismatch that looks like a
   real bug but isn't. Fix is always: stop the dev server, `rm -rf .next`,
   restart. Not a production issue — production builds don't carry dev-time
   hot-reload state.

6. **`.env.example` was being silently ignored by git.** The blanket
   `.env*` rule in `.gitignore` also matched `.env.example`, so it was never
   actually tracked despite existing on disk. Fixed with an explicit
   `!.env.example` exception.

7. **Next's image cache and framework-default headers were implicit.**
   `next.config.ts` now explicitly sets `images.minimumCacheTTL` (30 days)
   and `Cache-Control` headers for `/_next/image`, `/_next/static/*`, and
   plain static files, rather than relying on undocumented framework
   defaults — verified live via response headers, not just assumed.

## 5. Known, accepted limitations (not bugs — deliberate tradeoffs)

- **Contact form rate limiting is in-memory** (`lib/rate-limit.ts`), not
  distributed. Fine for a single low-traffic site; resets on redeploy/cold
  start and won't hold a hard line across multiple concurrent Vercel
  instances. Revisit with Upstash Redis or similar if traffic/scale grows.
- **Seed/demo content ships in `prisma/seed.ts` and schema defaults**
  (Unsplash stock photos, sample testimonials, a placeholder film URL).
  This is intentional so a fresh database isn't empty during development —
  **it must be replaced via `/admin` before treating the site as fully
  launched** (homepage hero, About photo, testimonials, and the sample
  galleries in particular).
- **`CategoryTeaser` has no dedicated admin UI** — editable only directly in
  the database today.

## 6. Site map (as actually built)

```
/                          Home — hero, featured masonry, category teasers, testimonials, CTA
/portfolio                 Full gallery grid, filterable by category
/portfolio/[slug]           Single gallery "story" — cover hero, images, narrative text
/photography                Standalone photo grid (EditorialImage, type=IMAGE)
/films                       Asymmetric 2:1 landscape:portrait video grid (EditorialImage, type=VIDEO)
/journal                     Blog/journal listing
/journal/[slug]              Single blog post
/about                        Bio, philosophy items, CTA
/contact                      Contact form (DB save + two independent email channels)

/admin/login                  Sign-in (not linked from public nav)
/admin/forgot-password         Email-OTP password reset flow
/admin                         Dashboard
/admin/galleries                List + create/edit galleries, reorder, image management
/admin/editorial                 Shared manager for Photography + Films uploads
/admin/journal                    List + create/edit blog posts (Tiptap)
/admin/messages                    Contact form submissions inbox
/admin/content                      Homepage / About / Testimonials / Philosophy / Page headers / Site settings
```

---

## Original Build Brief

> Kept for historical context — this is the original speculative plan the
> project started from. Several decisions here (AWS S3, Next 14, masonry
> everywhere) were superseded during the actual build; see the sections
> above for what's really running.

# Build Prompt: "Stories By Akshat" — Photography Portfolio Website

> Paste everything below into opencode as the task brief. It's written as a direct instruction set so an agent can execute it phase by phase. Where a choice was made for you (library, service, schema), it's marked **[assumption]** — swap freely if you already have a preference.

---

## 1. Project Summary

Build **"Stories By Akshat,"** a photography studio website (primary focus: wedding photography, plus portraits/events) using **Next.js 14+ (App Router, TypeScript)**. The site should feel warm, editorial, and story-driven — like flipping through a beautifully shot wedding album, not browsing a generic portfolio template. Visual discovery should feel like Pinterest: dense, masonry-style image grids that invite scrolling and exploration.

Two audiences, two experiences:
1. **Public visitors** — browse galleries/stories, read the wedding blog/journal, learn about Akshat, and submit a contact inquiry.
2. **Akshat (admin)** — log into a protected `/admin` area to publish new galleries and blog posts, upload photos, and read incoming contact inquiries — without needing to touch code.

---

## 2. Design Direction (do not default to generic AI-template styling)

Avoid the two most common AI-generated design clichés: (a) cream background + terracotta/clay accent (`#D97757`-ish), and (b) near-black background with one neon accent. Both are overused defaults, not choices made for this brief. Instead, ground the palette and motion in **the actual subject: film photography and the golden-hour light of wedding photography.**

### Color tokens **[assumption — adjust to taste, but keep the relationships]**
| Role | Name | Hex |
|---|---|---|
| Base background | Sun-Bleached Linen | `#F6EEE1` |
| Secondary surface | Warm Paper | `#EFE3D0` |
| Primary text/ink | Espresso | `#2B1B12` |
| Signature accent | Marigold (golden hour) | `#C98A3B` |
| Secondary accent | Rosewood | `#A85C4E` |
| Muted support | Faded Olive | `#7C7654` (used sparingly — for tags, dividers, never large fills) |

Keep the palette warm-dominant throughout, per the brief. Olive exists only to prevent the page from reading as monotone amber-on-cream; it should never compete with Marigold/Rosewood as an accent.

### Typography **[assumption]**
- **Display face:** `Fraunces` (variable, use optical sizing + slight negative letter-spacing at large sizes) — warm, slightly quirky serif with real character, good for headlines and pull quotes.
- **Body face:** `Inter` or `General Sans` — clean humanist sans for readability in blog copy and UI.
- **Accent/caption face:** a genuine handwritten script (`Caveat` or `Instrument Serif Italic`) used **only** for small story captions, date stamps, and the signature element below — never for body copy or navigation.

### Layout concept
Pinterest-style responsive masonry (variable-height cards, not a rigid grid) for all gallery/portfolio surfaces. Generous negative space around images so photos stay the hero, not the chrome. Editorial full-bleed hero on the homepage — a single striking image or slow-panning short loop, not a stat-and-gradient hero.

### Signature element **[the one thing this site should be remembered for]**
**"Developing" photo reveal:** when a gallery image scrolls into view or finishes loading, it fades in from a soft desaturated/lightly blurred state into full color and sharpness over ~600–800ms — mimicking a photograph developing in a darkroom. This ties directly to the medium and to the "Stories" branding (each gallery is presented as a photo story, literally coming to life). Use this consistently but don't over-animate everything else around it — respect `prefers-reduced-motion` and disable/simplify the effect for users who request it.

### Motion principles
- One orchestrated moment (the developing-photo reveal) does more work than many small scattered effects.
- Hover states: subtle scale (1.0 → 1.03) + a hand-written-style caption sliding up from the bottom of the card.
- Page transitions: soft cross-fade, no jarring slides.
- Sticky nav that condenses (shrinks height, background goes from transparent-over-hero to solid Warm Paper) on scroll.

### Accessibility floor (non-negotiable)
- Responsive down to 320px width.
- Visible keyboard focus states on every interactive element.
- `prefers-reduced-motion` respected everywhere motion is used.
- Color contrast checked for Espresso-on-Linen and white-on-Marigold text combinations.

---

## 3. Tech Stack **[assumption — all swappable]**

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 14+, App Router, TypeScript | SSR/ISR for SEO-heavy content, file-based routing fits admin/public split cleanly |
| Styling | Tailwind CSS with a custom theme extending the token table above | Fast to keep consistent, easy to hand off |
| Animation | Framer Motion | Scroll reveals, hover states, page transitions, the "developing" effect |
| Masonry grid | `react-masonry-css` or a custom `ResizeObserver`-based layout | True Pinterest layout needs measured column-balancing, not just CSS columns (CSS `columns` breaks image order top-to-bottom oddly) |
| Lightbox | `yet-another-react-lightbox` | Swipeable, keyboard-accessible, mobile-friendly |
| Database/ORM | PostgreSQL + Prisma | Typed schema, easy migrations, works well with galleries/blogs relational data |
| Image storage | AWS S3 + CloudFront (fits your existing AWS/ECS/S3 experience) — Cloudinary as a simpler fallback if you want built-in transformations without managing infra | Signed upload URLs from an API route; CloudFront in front for caching/CDN |
| Auth (admin) | Auth.js (NextAuth) with Credentials provider, bcrypt-hashed password, JWT session, role field on User | Protect `/admin/**` via `middleware.ts`, not just client-side checks |
| Rich content editor | Tiptap (or MDX if you're comfortable authoring in Markdown instead of a WYSIWYG) | For wedding blog posts written from the admin panel |
| Email delivery | Gmail SMTP via Nodemailer (App Password) | Contact form → API route → email to Akshat's inbox |
| Deployment | Vercel for the Next.js app (simplest for ISR/edge) — or your existing ECS Fargate pipeline if you want everything in one AWS account | Either works; Vercel is less ops overhead for a marketing/portfolio site |

---

## 4. Site Map

```
/                        → Home (hero, featured masonry, category teasers, testimonials, CTA)
/portfolio                → Full masonry gallery, filterable by category (Wedding / Portrait / Event)
/portfolio/[slug]         → A single "story" — sequence of images + narrative copy + event details
/journal                  → Wedding blog / journal listing
/journal/[slug]           → Single blog post
/about                     → About Akshat (bio, philosophy, behind-the-scenes)
/contact                   → Contact form
/admin/login                → Admin sign-in (not linked from public nav)
/admin                      → Dashboard (recent inquiries, quick stats, quick links)
/admin/galleries             → List + create/edit galleries, manage image order & captions
/admin/journal                → List + create/edit blog posts (rich text editor)
/admin/messages               → View/manage contact form submissions (mark read/responded)
```

`/admin/**` must return a 404-like "not found" or redirect-to-login for unauthenticated users at the middleware level — don't just hide the link in the nav.

---

## 5. Data Model (Prisma draft)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  role          Role     @default(ADMIN)
  createdAt     DateTime @default(now())
}

enum Role {
  ADMIN
}

model Gallery {
  id           String        @id @default(cuid())
  title        String
  slug         String        @unique
  category     Category
  coverImageUrl String
  storyText    String?       @db.Text
  eventDate    DateTime?
  location     String?
  published    Boolean       @default(false)
  images       GalleryImage[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model GalleryImage {
  id         String   @id @default(cuid())
  galleryId  String
  gallery    Gallery  @relation(fields: [galleryId], references: [id])
  url        String
  width      Int
  height     Int
  caption    String?
  order      Int      @default(0)
}

enum Category {
  WEDDING
  PORTRAIT
  EVENT
}

model BlogPost {
  id           String   @id @default(cuid())
  title        String
  slug         String   @unique
  coverImageUrl String
  content      String   @db.Text  // HTML from Tiptap, or MDX source
  excerpt      String?
  tags         String[]
  published    Boolean  @default(false)
  publishedAt  DateTime?
  createdAt    DateTime @default(now())
}

model ContactMessage {
  id         String    @id @default(cuid())
  name       String
  email      String
  phone      String?
  eventType  String?
  eventDate  DateTime?
  message    String    @db.Text
  status     MsgStatus @default(NEW)
  createdAt  DateTime  @default(now())
}

enum MsgStatus {
  NEW
  READ
  RESPONDED
}
```

---

## 6. Contact Us Flow (this is the "Akshat gets an email" requirement)

1. `/contact` renders a form: Name, Email, Phone (optional), Event Type (dropdown: Wedding / Portrait / Event / Other), Event Date (optional), Message. Client-side validation (required fields, email format) via `react-hook-form` + `zod`.
2. Include an invisible **honeypot field** for basic bot protection, plus a simple rate limit on the API route (e.g. per-IP, in-memory or via a lightweight store) so the form can't be spammed.
3. On submit, POST to `POST /api/contact`:
   - Validate payload server-side (never trust client validation alone).
   - Save the message to the `ContactMessage` table.
   - Send an email to **Akshat's inbox** (`ADMIN_EMAIL` env var) via Gmail SMTP (Nodemailer), containing all submitted fields, formatted plainly and clearly.
   - **[assumption]** Also send a short auto-reply confirmation email to the consumer ("Thanks for reaching out, Akshat will get back to you within X days") — nice UX touch, easy to add via the same email call.
4. Show a warm, on-brand success state after submission (not just a generic toast) — this is a good place for the "developing photo" motif again, e.g. a small illustrative confirmation.
5. Submissions also show up in `/admin/messages` for Akshat to triage even without checking email.

---

## 7. Admin Panel

- **Auth:** Auth.js Credentials provider. Seed one admin user via a script (`scripts/seed-admin.ts`) rather than building public signup — this is a single-photographer site, not multi-tenant.
- **Route protection:** `middleware.ts` checks the session/JWT on every `/admin/**` request and redirects unauthenticated users to `/admin/login`.
- **Dashboard (`/admin`):** count of new contact messages, count of published/draft galleries and posts, quick "New Gallery" / "New Post" buttons.
- **Gallery management:** create/edit gallery metadata (title, category, story text, event date, location), drag-to-reorder image upload with captions, publish/unpublish toggle, delete with confirmation.
- **Image upload:** direct-to-S3 upload via a signed URL generated by an API route (avoids routing large files through the Next.js server); generate/resize a display + thumbnail variant, or lean on CloudFront + on-the-fly resizing if you want to skip manual resizing.
- **Blog management:** Tiptap rich text editor (bold/italic/headings/images/links/quote), cover image upload, tags, publish toggle, live preview.
- **Messages:** list of contact submissions, mark as read/responded, basic filtering by status.

---

## 8. Responsiveness & Interaction Details

- Mobile-first Tailwind breakpoints. Masonry columns: 1 (mobile, <640px) → 2 (tablet, 640–1024px) → 3–4 (desktop, 1024px+).
- Mobile nav: full-screen warm-toned overlay menu (not a cramped dropdown), large touch targets.
- Lightbox on mobile: swipe gesture support, pinch-to-zoom if the library supports it.
- Sticky nav condenses on scroll (see Motion principles above).
- All interactive elements (buttons, cards, form fields) have visible hover **and** focus states — don't only style `:hover`.

---

## 9. Performance & SEO

- `next/image` everywhere, with blur placeholders generated from actual image data (not a generic gray box).
- ISR (`revalidate`) on `/portfolio/[slug]` and `/journal/[slug]` so published content updates without a full redeploy.
- Dynamic `generateMetadata` per gallery/blog post — title, description, and Open Graph image pulled from the cover photo, so shared links look good on socials (this matters a lot for a Pinterest-adjacent, shareable photography site).
- `sitemap.xml` and `robots.txt` generated via Next's built-in metadata routes.
- Target Lighthouse 90+ on Performance/Accessibility/SEO for the public pages.

---

## 10. Suggested Folder Structure

```
app/
  (public)/
    page.tsx                → Home
    portfolio/page.tsx
    portfolio/[slug]/page.tsx
    journal/page.tsx
    journal/[slug]/page.tsx
    about/page.tsx
    contact/page.tsx
  admin/
    login/page.tsx
    page.tsx                → dashboard
    galleries/page.tsx
    galleries/[id]/page.tsx
    journal/page.tsx
    journal/[id]/page.tsx
    messages/page.tsx
  api/
    contact/route.ts
    admin/upload/route.ts
    admin/galleries/route.ts
    admin/journal/route.ts
    auth/[...nextauth]/route.ts
components/
  ui/                        → Button, Input, Badge, etc.
  gallery/MasonryGrid.tsx
  gallery/GalleryCard.tsx
  gallery/Lightbox.tsx
  layout/Nav.tsx
  layout/Footer.tsx
lib/
  prisma.ts
  auth.ts
  email.ts
  s3.ts
prisma/
  schema.prisma
  seed-admin.ts
middleware.ts
```

---

## 11. Environment Variables

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GMAIL_USER=              # Gmail account that sends the mail
GMAIL_APP_PASSWORD=      # Google App Password (not your login password)
ADMIN_EMAIL=            # Akshat's inbox — where contact form emails land
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_CLOUDFRONT_URL=
NEXT_PUBLIC_SITE_URL=
```

---

## 12. Phased Build Plan (execute in this order)

1. **Setup:** `create-next-app` (TS, App Router, Tailwind), configure Tailwind theme with the token table from §2, install Framer Motion, Prisma, Auth.js, react-hook-form + zod, react-masonry-css, yet-another-react-lightbox.
2. **Design system:** typography scale, Button/Input/Badge components, Nav + Footer, base layout shell. Get this reviewed/screenshotted before moving on — it sets the tone for everything else.
3. **Public gallery core:** `MasonryGrid` + `GalleryCard` (with the "developing photo" reveal) + Lightbox, backed by placeholder/mock data first.
4. **Home page:** hero, featured masonry pull, category teasers, testimonials section, CTA to contact.
5. **Portfolio + individual story pages, Journal list + post pages** — wire to Prisma/mock data.
6. **Contact page + `/api/contact`** — form, validation, email send, DB write, success state.
7. **Auth + middleware** — admin login, protected `/admin/**`, seed script for Akshat's account.
8. **Admin CRUD** — galleries (with image upload), blog posts (Tiptap), messages inbox.
9. **Responsiveness + motion polish pass** across all breakpoints; verify reduced-motion behavior.
10. **SEO/performance pass** — metadata, sitemap, image optimization audit, Lighthouse check.
11. **Deploy** — Vercel (or your ECS pipeline), set env vars, run Prisma migrations, seed admin user.

---

## 13. Open Questions to Resolve Before/During Build **[flag these to the user if opencode needs decisions]**

- Final call on image hosting: AWS S3+CloudFront vs. Cloudinary. **Resolved: Cloudinary.**
- Whether blog posts are authored via Tiptap (WYSIWYG, stored as HTML) or MDX (Markdown files in-repo) — Tiptap is friendlier for a non-developer admin, MDX is friendlier for version control. **Resolved: Tiptap.**
- Whether testimonials/reviews are static content Akshat provides, or need their own admin-editable model. **Resolved: own admin-editable model (`Testimonial`).**
- Whether the contact form should also support file attachments (e.g., a Pinterest inspo board link or reference images) — not in scope above unless requested. **Not implemented — still out of scope.**
