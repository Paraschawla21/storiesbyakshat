# Stories by Akshat

Wedding, portrait, and event photography portfolio site for Akshat — a
public marketing site plus a full `/admin` CMS so every piece of content
(galleries, films, photography, journal posts, testimonials, homepage/about
copy, site settings) can be managed without touching code.

Live at: **https://storiesbyakshat.vercel.app/**

For the full architecture, real-world workarounds, and design brief, see
[`plan.md`](./plan.md).

## Tech stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **PostgreSQL on Neon** via **Prisma 7** (driver adapter, no connection
  string in `schema.prisma` — see `prisma.config.ts`)
- **Cloudinary** for photo/video storage — uploads go directly from the
  browser to Cloudinary (signed request), not through the Next.js server
- **Auth.js (NextAuth) v5** — Credentials provider, bcrypt-hashed password
- **Tailwind CSS v4** — custom warm/golden-hour theme
- **Framer Motion**, **Tiptap**, **react-hook-form + zod**,
  **yet-another-react-lightbox**, **Nodemailer (Gmail SMTP)**

## Getting started

### 1. Install dependencies

```bash
npm install
```

This also runs `prisma generate` via `postinstall`.

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `NEXTAUTH_SECRET` | Auth.js session secret |
| `NEXTAUTH_URL` | Full site URL (must match your deployment) |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | Gmail SMTP sender (use a Google App Password, not your login password) |
| `ADMIN_EMAIL` | Where contact-form notifications are sent |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, used for metadata/OG tags |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary account credentials |

### 3. Set up the database

```bash
npx prisma migrate deploy   # apply migrations
npx prisma db seed          # optional: seed demo content into an empty DB
```

> The seed script only inserts data if the relevant tables are empty — it
> won't overwrite real content. See `plan.md` §5 for what still needs
> replacing via `/admin` before a fresh database is truly launch-ready.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run dev`/`build`/`start` all set `NODE_OPTIONS=--use-system-ca` — this
is required on machines behind corporate TLS-inspecting proxies; harmless
otherwise.

## Admin access

Sign in at `/admin/login`. There's no public signup — seed one admin user
directly (see `prisma/seed.ts`) or via the database. Forgot-password uses an
emailed OTP code (`/admin/forgot-password`), not a reset link.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start the production server (after `build`) |
| `npm run lint` | ESLint |
| `npx prisma studio` | Browse/edit the database directly |
| `npx prisma migrate dev` | Create + apply a new migration in development |

## Project structure

```
app/                    Routes — public pages, /admin (CMS), /api (route handlers)
components/
  ui/                   Generic building blocks (Button, Badge, SafeImage, BackLink, ...)
  gallery/              Masonry/lightbox/grid components for galleries, photography, films
  layout/               Nav, Footer, Logo
  admin/                Admin forms and managers (one per content type)
  contact/              Contact form
lib/                    Prisma client, content getters (with fallback handling),
                        Cloudinary, email, auth helpers, revalidation
prisma/                 schema.prisma, migrations, seed.ts
```

## Deployment

Deployed on Vercel, auto-deploying from `main`. After deploying:

1. Confirm `DATABASE_URL`, `NEXTAUTH_URL`, and the Cloudinary/Gmail env vars
   are set in the Vercel project settings — they are **not** inherited from
   local `.env`.
2. Run `npx prisma migrate deploy` against the production database if
   migrations haven't been applied automatically.
3. Replace placeholder/seed content via `/admin` (homepage hero image, About
   photo, testimonials, sample galleries) before treating the site as fully
   live — see `plan.md` §5.

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- Architecture notes, design brief, and known workarounds: [`plan.md`](./plan.md)
