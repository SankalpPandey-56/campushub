# CampusHub

> Your campus, connected.

CampusHub is a verified student community platform for a college campus. One place for deals around campus, events, shared notes, a student marketplace, lost & found, and study groups — gated by manual campus verification so every member is a real student.

**Live site:** _deploy to Vercel (see below), then add the URL here_

---

## Features

**For students**

- **Community feed** — For You / Campus / Deals / Events / Resources / Marketplace / Lost & Found tabs; posts with images, locations, likes, comments, saves, share, report; edit and delete your own posts
- **Deals** — share real offers with original/discounted price, auto-computed discount %, expiry ("Last day", "Ends tomorrow"), expired section, like/save/share/report
- **Events** — date-block cards, RSVP, registration links, upcoming + past sections, category filters
- **Resources** — notes and guides with subject search and filters
- **Marketplace** — list items with condition and price, mark sold, and a safe-contact button that opens a message thread (no payments, no exposed numbers)
- **Lost & Found** — lost/found posts with location and approximate date, message the poster
- **Study groups** — create, join, and post on a group wall; creator auto-membership
- **Search** — one search across posts, deals, events, resources, groups, and listings
- **Notifications** — comments, RSVPs, group joins, verification and moderation updates, mark-as-read
- **Messages** — 1:1 threads with unread badges
- **Profiles** — bio, course/year, contribution counts, recent posts, safe contact button

**For the admin** (`/admin`, separate dark-themed surface)

- Overview with real metrics (pending verifications, approved members, active this week, posts 24h, active deals, events this week, open reports)
- Verification requests queue — approve/reject with review notes; decision emails; rate of approvals visible per status
- User management — search, expand details, suspend/restore with reason
- Content moderation — delete posts/deals/events/resources/listings
- Report triage — view flagged content, dismiss, remove content, or suspend the reported user; every action recorded
- Settings — environment status (no secret values), campus management

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 + a small custom token layer (warm paper, pine & marigold accents) |
| Motion | Framer Motion (restrained: tabs, sheets, toasts) |
| Database | PostgreSQL + Prisma ORM |
| Auth | Custom JWT sessions (jose, HS256, httpOnly cookie) + Google OAuth + phone OTP (Twilio Verify or console mode) |
| Email | Nodemailer over SMTP |
| Validation | Zod on every server action |
| Deployment | Vercel + any managed Postgres |

No auth libraries, no UI kit, no state library — the dependency list stays readable.

---

## Architecture

```
app/
  (auth)/            login, campus verification + their server actions
  (app)/             the member surface — feed, deals, events, resources,
                     marketplace, lost-found, groups, explore, messages,
                     notifications, saved, profile
  (admin)/admin/     separate admin surface (own layout, dark theme)
  api/auth/          Google OAuth start + callback, signout
components/          shell, cards, feed, auth, admin, moderation, UI primitives
lib/                 db, auth (session/guard/otp/google), email, constants, format
prisma/              schema, migrations, seed
middleware.ts        cookie-presence gate for community routes
scripts/             smoke-test token helper
```

Principles:

- **Server components by default.** Client components exist only where interaction demands it (optimistic likes, sheets, forms).
- **Server Actions with Zod validation** for every mutation; the server re-checks identity, verification status, and ownership on each call.
- **Authorization is server-side.** `requireMember()` / `requireAdmin()` run in layouts and every action; a non-admin hitting `/admin` gets a 404, not a redirect they can reason about.

---

## Authentication flow

1. **Google OAuth**: `/api/auth/google` sets a state cookie and redirects to Google → callback verifies state, upserts the user, derives the role from `ADMIN_EMAIL`, sets the session JWT, and routes: admin → `/admin`, approved → `/feed`, everyone else → `/verify`.
2. **Phone OTP**: enter an Indian mobile number → 6-digit code (Twilio Verify in production, printed to server logs in console mode) → hashed codes stored with attempt limits and resend rate limiting → session issued.
3. Sessions are signed JWTs in an httpOnly, SameSite=Lax cookie (30 days). No passwords anywhere.

## Verification flow

Signing in is **not** membership. After auth, every new user lands on `/verify`:

> Full name · email · course · year · campus · optional college email · optional context

Submitting creates a `VerificationRequest`, notifies the admin by email (with a review link) and in-app, and gates all community routes until the admin approves. Rejected users can resubmit. Suspended users hit a dedicated gate page. Approval flips `verificationStatus` to `APPROVED` in a transaction and emails the student.

Adding automatic verification later only needs an email-domain check where `collegeEmail` ends with an approved domain — the data is already structured for it.

---

## Database

PostgreSQL via Prisma. Core models:

- **User** (auth identity, role, verification status, campus) · **Campus** · **VerificationRequest** · **OtpToken**
- **Post**, **Comment**, **Like**, **SavedPost**, **SavedDeal**
- **Deal**, **Event** + **EventAttendee**, **Resource**
- **Group** + **GroupMember** + **GroupPost**, **MarketplaceListing**, **LostFoundItem**
- **Report** (polymorphic on content type), **Notification**
- **Conversation** + **ConversationMember** + **Message**

All content tables carry `campusId` with composite indexes on `(campusId, createdAt)`; join tables have unique constraints for idempotent toggles.

---

## Local setup

```bash
git clone https://github.com/SankalpPandey-56/campushub
cd campushub
npm install

# Postgres (or point DATABASE_URL anywhere else)
docker run -d --name campushub-postgres \
  -e POSTGRES_PASSWORD=campushub -e POSTGRES_USER=campushub \
  -e POSTGRES_DB=campushub -p 5434:5432 postgres:16-alpine

cp .env.example .env          # fill in the values below
npx prisma migrate dev        # create tables
npm run db:seed               # demo campus + realistic content
npm run dev
```

Seeded members log in with any seeded phone number — in console mode the OTP prints in the dev-server log.

### Environment variables

See [.env.example](.env.example) for the full annotated list:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | session signing secret (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_APP_URL` | public URL, used for OAuth callbacks and email links |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth (redirect: `{APP_URL}/api/auth/callback/google`) |
| `ADMIN_EMAIL` | the Google account that becomes platform admin |
| `SMTP_HOST/PORT/USER/PASS`, `EMAIL_FROM` | outbound email (optional — falls back to in-app admin notifications) |
| `PHONE_AUTH_PROVIDER` | `console` (dev) or `twilio` |
| `TWILIO_ACCOUNT_SID/AUTH_TOKEN/VERIFY_SERVICE_SID` | SMS OTP in production |

`.env` files are gitignored and were never committed.

---

## Admin setup

1. Set `ADMIN_EMAIL` to the Google address that should administer the platform.
2. Sign in with that Google account. On every login the server compares the verified email to `ADMIN_EMAIL` and assigns the `ADMIN` role — the role cannot be self-assigned.
3. You land on `/admin`. Add your campus under **Settings → Campuses**, then approve the incoming verification requests.

---

## Deployment (Vercel)

1. Push to GitHub, then import the repo on [vercel.com/new](https://vercel.com/new).
2. Attach a Postgres database (Vercel Postgres, Neon, Supabase…) and copy its connection string into `DATABASE_URL`.
3. Set the remaining env vars from the table above — `NEXT_PUBLIC_APP_URL` must be the final Vercel domain.
4. Add the authorized redirect URI `{APP_URL}/api/auth/callback/google` in the Google Cloud console.
5. Deploy, then run migrations against the production database: `npx prisma migrate deploy`.
6. Put the live URL at the top of this README.

---

## Android app

The Android build wraps the production site with Capacitor — the web app stays the single source of truth (push a fix once, the app inherits it). See `android/README.md` in the repo for build steps, signing instructions, and the release checklist.

---

## Screenshots

_Add screenshots of the feed, deals, and admin overview here after deployment._

---

## Project status

v1.0.0 — feature-complete for a single campus launch. Payments, file uploads (beyond URLs), and automatic college-domain verification are deliberate non-goals for this version.
