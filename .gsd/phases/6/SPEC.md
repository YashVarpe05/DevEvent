# Phase 6: Marketing, Discounts & Referrals
Status: FINALIZED


## Objective
Implement features to boost event attendance and organizer revenue through discounts, referral tracking, and automated tasks.

## Requirements

### Wave 1: Discounts & Promo Codes
- Schema updates to support PromoCodes (code, discount type [percentage, fixed], value, expiry, maxUses, currentUses).
- API routes for Organizers to create/manage promo codes for their events.
- API route for attendees to apply a promo code during checkout.
- Validation logic during checkout to ensure promo code is valid and active.
- Support for 100% off (free tier bypass).

### Wave 2: Referral Tracking & Analytics
- Schema updates to track source/referral links.
- Unique referral links for events (e.g. `?ref=affiliate1`).
- Display referral stats on the Organizer Dashboard (clicks, conversions).

### Wave 3: Cron Jobs & Automations
- Implement a secure CRON endpoint to handle automated tasks using `CRON_SECRET`.
- Background tasks such as:
  - Expiring old/unused sessions.
  - Sending event reminders 24h before event starts.
  - Updating event status (e.g. from published to completed).

## Verification
- Test applying a promo code.
- Test referral link tracking.
- Test cron endpoint with valid and invalid `CRON_SECRET`.
