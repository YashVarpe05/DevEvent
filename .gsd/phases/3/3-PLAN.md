---
phase: 3
plan: 3
wave: 3
---

# Plan 3.3: Public Event Detail Page & Testing

## Objective
Build the public-facing event discovery endpoint and detail page based on Meetup benchmarking. Finalize the test suite.

## Context
- 3.2-PLAN.md

## Tasks

<task type="auto">
  <name>Public API and Detail Page</name>
  <files>app/api/public/events/[slug]/route.ts, app/events/[slug]/page.tsx</files>
  <action>
    - Create public API that strictly enforces `status === "published"` and `visibility === "public" | "unlisted"`.
    - Build visually rich `slug` detail page (Hero, Info cards, Register CTA).
    - Add basic SEO meta tags integration based on event data.
  </action>
  <verify>npm run build</verify>
  <done>UI renders beautifully with no errors on missing optional data.</done>
</task>

<task type="auto">
  <name>Integration Tests & Moderation</name>
  <files>__tests__/event.integration.test.ts</files>
  <action>
    - Add basic endpoints for admin view/moderation.
    - Add tests for auth isolation (Attendee cannot create events, Org can't edit others).
    - Test the publish requirement checklist.
  </action>
  <verify>npm run test</verify>
  <done>All core QA scenarios covered</done>
</task>

## Success Criteria
- [ ] Anyone can view published public events.
- [ ] Security access boundaries strictly held.
