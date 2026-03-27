---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Event Engine Core (DB + Base API)

## Objective
Establish the foundational data model, database collections, and the basic CRUD API routes for events (Organizer-side).

## Context
- .gsd/SPEC.md (Phase 3 requirements)
- User, OrganizerProfile models

## Tasks

<task type="auto">
  <name>Create Event Mongoose Model</name>
  <files>database/event.model.ts</files>
  <action>
    - Create `Event` Mongoose schema per specification (all fields: slug, visibility, location, pricing, capacity, etc.).
    - Define indexes (slug unique, text index on title/desc/tags).
    - Ensure TypeScript interfaces (`IEvent`) are exported.
  </action>
  <verify>grep_search IEvent database/event.model.ts</verify>
  <done>Schema matches feature scope checklist</done>
</task>

<task type="auto">
  <name>Implement CRUD APIs (Organizer routes)</name>
  <files>app/api/events/route.ts, app/api/events/[id]/route.ts</files>
  <action>
    - POST `/api/events`: create draft event.
    - GET `/api/events/me`: list organizer's events.
    - PATCH `/api/events/[id]`: update event details.
    - Apply role-based checks to ensure only the owner can manipulate.
    - Implement slug auto-generation using a safe utility (e.g. `slugify`).
  </action>
  <verify>npm run build</verify>
  <done>API routes compile successfully</done>
</task>

## Success Criteria
- [ ] Database schema deployed locally.
- [ ] Core draft creation + editing APIs are robust against malformed inputs.
