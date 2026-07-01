# DevEvent

A Luma-style event platform for developers — discover, host, and manage hackathons, meetups, and conferences. Built with Next.js 16, MongoDB, and Tailwind CSS.

## Features

**For attendees**
- Event discovery with search, city filters, recommendations, and trending
- Free RSVP and paid ticketing (Razorpay + Stripe), promo codes
- Waitlists with automatic promotion when spots open
- Host-approval registration mode
- Add to Calendar (Google / Outlook / Apple `.ics`) + calendar invite attached to confirmation emails
- Custom registration questions (t-shirt size, dietary needs, ...)
- Guest list with avatars on event pages
- Post-event feedback (star ratings + comments)
- Follow organizers — get emailed when they publish a new event (one-click unsubscribe)
- Subscribe to an organizer's calendar feed (webcal/ICS)

**For organizers**
- Event drafts → publish workflow with validation
- Recurring events (weekly / biweekly / monthly series)
- Multi-tier ticket types, earnings, payouts (Stripe Connect), refunds
- QR + code check-in, attendee management, CSV export (incl. question answers)
- Email blasts to guests and email invitations
- Co-hosts (day-of management access without account ownership)
- Feedback dashboard, referral tracking, promo codes
- Dynamic OG share cards for every event page

**Platform**
- Admin review for organizer applications, payment risk view
- Rate limiting (Redis-backed with in-memory fallback)
- Mass-assignment-safe APIs, signed QR payloads, webhook signature verification
- Sentry error monitoring (optional), PostHog analytics
- SEO: sitemaps, JSON-LD structured data, canonical URLs, real 404s

## Tech stack

Next.js 16 (App Router) · React 19 · MongoDB/Mongoose 9 · NextAuth v5 · Tailwind CSS 4 · Resend (email) · Razorpay + Stripe · Redis (ioredis) · Cloudinary · PostHog · Vitest

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in at least MONGODB_URI and NEXTAUTH_SECRET
npm run dev                  # http://localhost:3000
```

Seed demo data (3 accounts + sample events):

```bash
npx tsx scripts/seed-demo-data.ts
# Demo accounts use +tags on a real inbox so emails deliver.
# Override the inbox with SEED_EMAIL_BASE=you@gmail.com
# Default accounts (password: Demo@1234):
#   Admin:     yashvarpe2005+admin@gmail.com
#   Organizer: yashvarpe2005+organizer@gmail.com
#   Attendee:  yashvarpe2005+attendee@gmail.com
```

> After changing any Mongoose model, restart the dev server — schemas are cached across hot reloads.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm test` | Vitest suite (uses in-memory MongoDB) |
| `npx tsc --noEmit` | Typecheck |
| `npm run db:indexes` | Ensure MongoDB indexes |
| `npm run preflight` | Pre-deploy validation (checks env vars + live service connections) |

## Environment variables

See [.env.example](.env.example) for the full list. The critical ones:

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | always | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | production | Auth/JWT + token signing |
| `NEXTAUTH_URL`, `NEXT_PUBLIC_BASE_URL` | production | Canonical URLs in auth, emails, ICS feeds |
| `CRON_SECRET` | production | Authorizes cron endpoints (sent by the GitHub Actions scheduler) |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME` | for email | Without these, emails log to console instead of sending |
| `REDIS_URL` | recommended | Cross-instance rate limiting + caching (falls back to in-memory) |
| `RAZORPAY_KEY_ID/SECRET`, `STRIPE_*` | for paid events | Payment processing |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | optional | Error monitoring (inert when unset) |

Missing critical variables abort a production boot (see [instrumentation.ts](instrumentation.ts)); recommended ones only warn because every integration degrades gracefully.

## Deployment (Vercel)

1. Import the repo into Vercel; framework auto-detects Next.js.
2. Set the environment variables above (Production + Preview).
3. Provision **MongoDB Atlas** and **Upstash Redis**; point `MONGODB_URI` / `REDIS_URL` at them.
4. Verify your sending domain in **Resend** (SPF + DKIM) and set `RESEND_FROM_EMAIL` to it — otherwise emails land in spam.
5. Scheduled jobs (event completion, lifecycle emails, payouts) run via GitHub Actions ([.github/workflows/cron-hourly.yml](.github/workflows/cron-hourly.yml), [cron-daily.yml](.github/workflows/cron-daily.yml)) which call the `/api/cron/*` endpoints with `Authorization: Bearer $CRON_SECRET`. Set repo secret `CRON_SECRET` and variable `PRODUCTION_URL`. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
6. Point Stripe/Razorpay webhooks at `/api/webhooks/stripe` and `/api/webhooks/razorpay`.
7. Verify the deployment is healthy: `GET /api/health` returns `200` with MongoDB + Redis status.

For the full step-by-step checklist (including MongoDB Atlas setup, secret generation, OAuth callbacks, Razorpay KYC, and post-deploy smoke tests), see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## CI

GitHub Actions ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs typecheck, the full test suite, and a production build on every push and PR. Recommended repo settings: protect the default branch and require the `verify` check before merging.

## Testing

Integration tests live in [`__tests__/`](__tests__) and run against an in-memory MongoDB (`mongodb-memory-server`) — no local database needed. Email sending is mocked; when adding a new export to [lib/email.ts](lib/email.ts), add it to the `vi.mock("@/lib/email", ...)` block in the test files.
