# Kahani Clicks — with **Living Memories**

A premium photography-studio site (Next.js 16 App Router) that now includes
**Living Memories** — a "living photograph" service:

1. The studio uploads a **poster photo** + a **video** for a couple/event.
2. The system creates a **unique public page** and a **QR code**.
3. The QR is printed on the physical photo / album / card.
4. A guest **scans the QR → opens the page → the still photo comes alive and plays the video** (Harry-Potter-style moving photo).

## Surfaces

| Route       | What it is                                                         |
| ----------- | ----------------------------------------------------------------- |
| `/`         | The existing Kahani Clicks marketing site (unchanged).            |
| `/studio`   | Private studio dashboard — create & manage memories, get QR codes.|
| `/m/[slug]` | Public cinematic memory page (what a guest sees after scanning).  |

> **Note:** the build spec described `/` as a short Living-Memories landing.
> Because this repo already ships a full Kahani Clicks website at `/`, that
> homepage was **preserved**. Living Memories lives at `/studio` + `/m/[slug]`.

## Tech

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS v4**
- **Prisma 7 + PostgreSQL** (via the `@prisma/adapter-pg` driver adapter)
- **Cloudinary** for image + video storage/delivery
- **`qrcode`** for server-side QR PNG generation
- **`nanoid`** for short public slugs · **`zod`** for validation · **`sonner`** for toasts

## Setup

### 1. Install

```bash
npm install
```

### 2. Environment

Copy the example and fill it in:

```bash
cp .env.example .env
```

| Var                     | Required  | Notes                                                           |
| ----------------------- | --------- | --------------------------------------------------------------- |
| `DATABASE_URL`          | ✅        | Hosted Postgres (Neon / Supabase / Railway). Include `sslmode`. |
| `NEXT_PUBLIC_BASE_URL`  | ✅ (prod) | Absolute base URL used to build QR codes + copy-links.          |
| `CLOUDINARY_CLOUD_NAME` | ✅        | Cloudinary dashboard.                                           |
| `CLOUDINARY_API_KEY`    | ✅        | Cloudinary dashboard.                                           |
| `CLOUDINARY_API_SECRET` | ✅        | **Server only** — never exposed to the client.                  |

### 3. Database (Prisma)

The Prisma 7 datasource URL lives in `prisma.config.ts` (read from `DATABASE_URL`).
Create the schema:

```bash
npx prisma migrate dev --name init   # creates the migration + applies it
# or, against an existing/managed DB:
npx prisma db push
```

The client is generated on install; regenerate manually with `npx prisma generate`.

### 4. Run

```bash
npm run dev        # http://localhost:3002
```

Open `/studio`, create a memory (poster + video), then **Open** / scan the QR.

## How it works

- **Create** — `POST /api/memories` (multipart): validates with zod, uploads the
  poster (image) and video to Cloudinary in parallel, mints a unique `slug`
  (`nanoid`), and saves a `Memory` row. Both Cloudinary `secure_url` and
  `public_id` are stored so assets can be deleted later.
- **List** — `GET /api/memories` (newest first).
- **Single** — `GET /api/memories/[slug]` returns one memory and increments `views`.
- **QR** — `GET /api/qr/[slug]` returns a PNG encoding `${NEXT_PUBLIC_BASE_URL}/m/[slug]`.
- **Public page** — `/m/[slug]` is a server component; it counts a view, renders a
  full-screen poster with a slow Ken-Burns drift, and on tap cross-fades into the
  video playing inline **with sound**. Ends → fade back + Replay + studio credit.
  Uses the Cloudinary still-frame as the `<video poster>` and preconnects to Cloudinary.
- **Delete** — `DELETE /api/memories/[slug]` destroys both Cloudinary assets and
  removes the DB row.

No app data is stored in `/public` or `localStorage` — everything is in Postgres
+ Cloudinary.

## Data model

```prisma
model Memory {
  id        String   @id @default(cuid())
  slug      String   @unique
  title     String
  subtitle  String?
  eventType String?
  posterUrl String
  posterId  String
  videoUrl  String
  videoId   String
  views     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Deploy (Vercel)

1. Set all env vars in the Vercel project (production Postgres URL and
   `NEXT_PUBLIC_BASE_URL=https://yourdomain.com`).
2. Run migrations on deploy (e.g. `npx prisma migrate deploy` in a build step).
3. Deploy, then scan a printed QR on a real phone to confirm `/m/[slug]` plays with sound.
