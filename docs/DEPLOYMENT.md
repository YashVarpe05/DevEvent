# Deployment checklist (Vercel)

A step-by-step guide to ship DevEvent to production. Work top to bottom.

---

## 0. Before you deploy (local, one time)

- [ ] **Rotate the MongoDB password** (Atlas → Database Access → Edit → Autogenerate). The old one was exposed in chat.
- [ ] **Name the database** — your `MONGODB_URI` must include a db name before the `?`:
      `mongodb+srv://USER:PASS@cluster0.sopalze.mongodb.net/devevents?appName=Cluster0`
- [ ] **Seed the fresh database** once: `npx tsx scripts/seed-demo-data.ts`
- [ ] **Allow Atlas network access** — Atlas → Network Access → add `0.0.0.0/0` (Vercel uses dynamic IPs), or Vercel's IP ranges if you prefer tighter control.
- [ ] **Run the preflight** and confirm all green: `npm run preflight`
- [ ] **Push to GitHub** — make sure `.env.local` is NOT committed (it's gitignored; `.env.example` is the only env file that should be tracked).

---

## 1. Import the project into Vercel

- [ ] vercel.com → Add New → Project → import the GitHub repo.
- [ ] Framework preset: **Next.js** (auto-detected). Leave build/output settings default.
- [ ] Don't deploy yet — add environment variables first (next step).

---

## 2. Environment variables

Add these in Vercel → Project → Settings → Environment Variables. Set each for
**Production** and **Preview** (Preview gives you per-PR test deploys).

> Paste values WITHOUT surrounding quotes in the Vercel UI.

### Critical — the app won't boot in production without these
| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | Atlas connection string, **with `/devevents` db name** |
| `NEXTAUTH_SECRET` | generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | your production URL, e.g. `https://devevents.dev` |
| `NEXT_PUBLIC_BASE_URL` | same production URL |
| `NEXT_PUBLIC_APP_URL` | same production URL |
| `CRON_SECRET` | generate: `openssl rand -base64 32` |

### Redis (Upstash) — needed for correct rate limiting in production
| Variable | Where to get it |
|---|---|
| `UPSTASH_REDIS_REST_URL` | Upstash console → DB → REST tab |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash console → DB → REST tab |

### Email (Resend) — domain `devevents.dev` already verified
| Variable | Value |
|---|---|
| `RESEND_API_KEY` | Resend → API Keys |
| `RESEND_FROM_EMAIL` | `noreply@devevents.dev` |
| `RESEND_FROM_NAME` | `DevEvent` |

### Payments — Razorpay (India-first). Use TEST keys until verified, then LIVE.
| Variable | Where to get it |
|---|---|
| `RAZORPAY_KEY_ID` | dashboard.razorpay.com → API Keys |
| `RAZORPAY_KEY_SECRET` | same |

### Auth providers / media / analytics (recommended)
| Variable | Where to get it |
|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud Console → OAuth credentials |
| `CLOUDINARY_URL` | Cloudinary dashboard |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | PostHog project settings |

### Stripe (optional — only if you enable global card payments)
`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_CLIENT_ID`

### Error monitoring (optional but recommended)
`SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` — from a free Sentry project.

### Platform fees (copy from `.env.example` as-is unless you change pricing)
`PLATFORM_FEE_RATE_FREE`, `PLATFORM_FEE_RATE_PRO`, `PROCESSOR_FEE_ESTIMATE_RATE`, `PROCESSOR_FEE_ESTIMATE_FIXED_MINOR`, `NEXT_PUBLIC_PLATFORM_FEE_PREVIEW_RATE`, `NEXT_PUBLIC_PLATFORM_FEE_PREVIEW_FIXED_MINOR`, etc.

---

## 3. First deploy

- [ ] Click **Deploy**. Wait for the build (CI also runs typecheck + tests on the GitHub side).
- [ ] If the build fails on a missing critical env var, `instrumentation.ts` will tell you which one — add it and redeploy.

---

## 4. Custom domain

- [ ] Vercel → Settings → Domains → add `devevents.dev` (and `www`).
- [ ] Update your DNS (A/CNAME) as Vercel instructs.
- [ ] After it resolves, confirm `NEXTAUTH_URL` / `NEXT_PUBLIC_BASE_URL` match the final domain. Redeploy if you changed them.

---

## 5. Wire external callbacks (after the domain is live)

- [ ] **Google OAuth** — Google Cloud Console → Credentials → Authorized redirect URI:
      `https://devevents.dev/api/auth/callback/google`
- [ ] **Razorpay webhook** — dashboard → Webhooks → add `https://devevents.dev/api/webhooks/razorpay`. Subscribe to payment events.
- [ ] **Stripe webhook** (only if using Stripe) — `https://devevents.dev/api/webhooks/stripe`; copy the signing secret into `STRIPE_WEBHOOK_SECRET` and redeploy.

---

## 6. Cron jobs (GitHub Actions, not Vercel)

Vercel's Hobby plan caps cron jobs at once-per-day, so scheduled work runs from
GitHub Actions instead — free, and lets the lifecycle emails run hourly. Two
workflows are committed: `.github/workflows/cron-hourly.yml` (lifecycle emails)
and `.github/workflows/cron-daily.yml` (event cleanup + payouts).

- [ ] In GitHub → repo → Settings → Secrets and variables → Actions:
  - [ ] Add **secret** `CRON_SECRET` — the exact same value as in Vercel.
  - [ ] Add **variable** `PRODUCTION_URL` — your live URL, e.g. `https://devevents.dev`.
- [ ] The schedules only run once the workflows are on your **default branch**.
- [ ] Test now: Actions tab → "Cron — hourly" → Run workflow. A green run means
      the endpoint accepted the secret and processed.
- [ ] (Optional, upgrade path) If you later move to Vercel Pro, you can re-add a
      `vercel.json` `crons` block and disable these workflows.

---

## 7. Razorpay go-live (for paid events)

- [ ] Razorpay requires public **Terms**, **Privacy**, and **Refund/Cancellation** policies — already live at `/terms`, `/privacy`, `/refund-policy`.
- [ ] Submit your business KYC in the Razorpay dashboard.
- [ ] Once approved, swap TEST keys for LIVE keys in Vercel env and redeploy.

---

## 8. Post-deploy smoke test

- [ ] Sign up with a real email → confirm verification email arrives (not spam).
- [ ] Create an event as the organizer account → publish it.
- [ ] Register for it as an attendee → confirm the ticket email + `.ics` arrive.
- [ ] Open the ticket page → QR renders → scan/verify check-in works.
- [ ] Check Vercel → Logs for errors, and Sentry (if configured) for exceptions.

---

## Quick reference: generate secrets

```bash
openssl rand -base64 32   # for NEXTAUTH_SECRET and CRON_SECRET
```
