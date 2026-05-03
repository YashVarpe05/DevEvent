# Feature 5: Paid Ticketing Revenue Core

## Architecture decision

### Stripe Connect mode selected

**Chosen:** destination charges with Checkout (`payment_intent_data.transfer_data.destination` + `application_fee_amount`).

### Why this mode

1. Lower operational complexity than separate charges/transfers for single organizer settlement per order.
2. Native marketplace fee collection through `application_fee_amount`.
3. Checkout + webhooks gives robust asynchronous payment finalization.
4. Refund behavior supports `reverse_transfer=true` and `refund_application_fee=true` which aligns with organizer + platform revenue reversal.
5. Better fit for current DevEvent model where each order belongs to one organizer/event.

### Benchmarking insights applied (Luma + Eventbrite + Stripe docs)

1. **Fee transparency at checkout**: show subtotal, platform fee, and total before redirect.
2. **Plan-based monetization**: support fee-rate differences by organizer plan (free/pro style).
3. **Webhook-first fulfillment**: never trust client redirect for ticket confirmation.
4. **Onboarding readiness gate**: paid publish/checkout blocked until Connect capabilities are enabled.
5. **Risk queue and disputes visibility**: admin risk page surfaces payment_failed/chargeback/refund states.

## Database changes

### Existing models extended

- `database/order.model.ts`
  - Added `refunds[]` audit entries (reason, initiator, timestamps, external id, status).
  - Added indexes:
    - `{ organizerId: 1, createdAt: -1 }`
    - `{ buyerUserId: 1, createdAt: -1 }`
    - `{ eventId: 1, status: 1, createdAt: -1 }`
    - `{ idempotencyKey: 1, buyerUserId: 1, eventId: 1 }`
- `database/payment-transaction.model.ts`
  - Added indexes:
    - `{ organizerId: 1, occurredAt: -1 }`
    - `{ buyerUserId: 1, occurredAt: -1 }`
    - unique sparse `{ type: 1, externalRef: 1 }`

### New model

- `database/stripe-webhook-event.model.ts`
  - Stores processed Stripe event ids for webhook idempotency:
    - `eventId` unique
    - `eventType`
    - `processedAt`

## API contract matrix

| Endpoint                                      | Method | Auth                  | Purpose                                                                                   |
| --------------------------------------------- | ------ | --------------------- | ----------------------------------------------------------------------------------------- |
| `/api/checkout/create-session`                | POST   | buyer                 | Validate inventory/windows/limits, enforce idempotency and create Stripe Checkout Session |
| `/api/orders/me`                              | GET    | buyer                 | Buyer order history                                                                       |
| `/api/orders/[id]`                            | GET    | owner/admin/organizer | Order detail                                                                              |
| `/api/orders/[id]/cancel`                     | POST   | buyer owner           | Cancel unpaid/pending order                                                               |
| `/api/my/orders`                              | GET    | buyer                 | Backward-compatible buyer orders endpoint                                                 |
| `/api/organizer/events/[id]/orders`           | GET    | organizer owner       | Event-level orders list                                                                   |
| `/api/organizer/events/[id]/earnings-summary` | GET    | organizer owner       | Event-level gross/refund/fee/net summary                                                  |
| `/api/organizer/orders/[id]/refund`           | POST   | organizer owner/admin | Full/partial refund initiation                                                            |
| `/api/organizer/stripe/connect`               | GET    | organizer             | Read connect readiness and sync capability flags                                          |
| `/api/organizer/stripe/connect`               | POST   | organizer             | Create onboarding link and connected account if missing                                   |
| `/api/organizer/stripe/earnings`              | GET    | organizer             | Organizer aggregate earnings summary                                                      |
| `/api/webhooks/stripe`                        | POST   | Stripe signature      | Source-of-truth payment/refund/dispute/account state transitions                          |
| `/api/admin/payments/risk`                    | GET    | admin                 | Risk queue for failed/disputed/refunded orders                                            |

## Webhook event-state transitions

| Stripe event                    | Order transition                         | Side effects                                                                                            |
| ------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `checkout.session.completed`    | `pending_payment -> payment_processing`  | attach session/payment ids; analytics `checkout_completed`                                              |
| `payment_intent.succeeded`      | `payment_processing -> paid`             | atomic inventory updates, create paid registrations, ledger `payment_captured`, send confirmation email |
| `payment_intent.payment_failed` | `* -> payment_failed`                    | analytics `payment_failed`                                                                              |
| `charge.refunded`               | `paid -> refunded_partial/refunded_full` | cancel paid registrations, ledger `refund_issued`, update refund audit entries                          |
| `charge.dispute.created`        | `* -> chargeback`                        | ledger `chargeback`, admin risk visibility                                                              |
| `account.updated`               | organizer capability sync                | update `chargesEnabled`, `payoutsEnabled`, `stripeOnboardingComplete`                                   |

## Fee calculation spec

Implemented in `lib/pricing.ts` as `calculatePricing`.

- All amounts are minor units (cents).
- Config-driven defaults:
  - free organizer rate: `PLATFORM_FEE_RATE_FREE` default `0.05`
  - pro organizer rate: `PLATFORM_FEE_RATE_PRO` default `0.02`
  - free fixed fee: `PLATFORM_FEE_FIXED_FREE_MINOR` default `50`
  - pro fixed fee: `PLATFORM_FEE_FIXED_PRO_MINOR` default `0`
- Rounding: nearest minor unit using `Math.round`.

### Example A (free plan)

- Subtotal = 10000
- Rate fee = round(10000 \* 0.05) = 500
- Fixed fee = 50
- Platform fee = 550
- Buyer total = 10550

### Example B (pro plan)

- Subtotal = 10000
- Rate fee = round(10000 \* 0.02) = 200
- Fixed fee = 0
- Platform fee = 200
- Buyer total = 10200

## UI routes implemented/updated

### Buyer

- Updated ticket selection widget: transparent fee preview + idempotent checkout request.
- Paid mobile event CTA now uses ticket selector (not free booking flow).
- New confirmation route: `/orders/[id]/confirmation`.
- Existing order history route retained: `/my/orders`.

### Organizer

- Existing payouts page updated to new connect/earnings APIs.
- New event orders route: `/organizer/events/[id]/orders`.
- New event earnings route: `/organizer/events/[id]/earnings`.

### Admin

- New risk queue route: `/admin/payments/risk`.

## Compliance and safety (MVP)

- Signature-verified Stripe webhook.
- Processed webhook-event dedupe store.
- HTTPS callback enforcement in production for Connect onboarding and Checkout redirects.
- No raw card storage.
- Basic velocity limits for checkout creation (IP + event spike guard).
- Role-based authorization on all financial endpoints.

## Environment variables

Required/used:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL` or `NEXT_PUBLIC_BASE_URL`
- `PLATFORM_FEE_RATE_FREE`
- `PLATFORM_FEE_RATE_PRO`
- `PLATFORM_FEE_FIXED_FREE_MINOR`
- `PLATFORM_FEE_FIXED_PRO_MINOR`
- `PROCESSOR_FEE_ESTIMATE_RATE`
- `PROCESSOR_FEE_ESTIMATE_FIXED_MINOR`

Optional depending on Connect configuration:

- `STRIPE_CONNECT_CLIENT_ID`

## Non-functional outcomes

- Production-safe server-side fee calculations.
- Idempotent webhook processing.
- Auditable state transitions via order refund audit + payment transaction ledger + webhook event log.
- Extensible for future tax engine and payout automation.

## Next feature

**Feature 6: Discovery/Search Ranking + Recommendations + SEO Event Growth Loops**
