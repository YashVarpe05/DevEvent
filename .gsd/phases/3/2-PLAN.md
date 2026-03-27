---
phase: 3
plan: 2
wave: 2
---

# Plan 3.2: Organizer UI & Publish Flow

## Objective
Build the event management dashboard and the multi-section event editor for organizers. Implement the publish validation logic.

## Context
- 3.1-PLAN.md (depends on CRUD APIs)

## Tasks

<task type="auto">
  <name>Build Organizer Dashboard & Draft Form</name>
  <files>app/organizer/events/page.tsx, app/organizer/events/new/page.tsx, components/forms/EventForm.tsx</files>
  <action>
    - Create tabs for Draft/Published/Cancelled.
    - Build `/new` page with minimal fields to initialize draft.
    - Create `EventForm` component to handle multi-section data (Basics, Date/Time, Location, etc.).
  </action>
  <verify>npm run build</verify>
  <done>Dashboard renders list, Create flow navigates smoothly</done>
</task>

<task type="auto">
  <name>Implement Publish Readiness Algorithm & API</name>
  <files>lib/validations/event.publish.ts, app/api/events/[id]/publish/route.ts</files>
  <action>
    - Write deep server and client validation `validateEventForPublish(event)`.
    - Create the `/publish` and `/unpublish` endpoints wrapping these rules.
    - Hook into UI with a "Checklist Modal" before final publish.
  </action>
  <verify>npm run build</verify>
  <done>Publish requirements are strictly enforced across frontend and backend</done>
</task>

## Success Criteria
- [ ] Complete UI builder with autosave/save capabilities.
- [ ] Prevent publish if location, title, date, pricing logic is missing/invalid.
