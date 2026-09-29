# CampusHub

> Your campus, connected. — verified student community platform (work in progress)

Student-only community for a college campus: feed, deals, events, resources,
marketplace, lost & found, and study groups — gated by manual campus
verification and a role-based admin.

Built with Next.js 16 (App Router), TypeScript, Tailwind 4, Prisma 6 + PostgreSQL.

## Status

Under active development. See `docs/` once architecture notes land.

## Environment

Copy `.env.example` → `.env` and fill in:

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — session signing secret (`openssl rand -base64 32`)
- `ADMIN_EMAIL` — Google account that becomes the platform admin

## Local development

```bash
npm install
npx prisma migrate dev
npm run db:seed   # once seed script exists
npm run dev
```
