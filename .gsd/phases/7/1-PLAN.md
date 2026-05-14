---
phase: 7
plan: 1
wave: 1
---

# Plan 7.1: Core Integrations & Data Fetching

## Objective
Fix critical data fetching and routing issues by integrating the session-aware Navbar and replacing the hardcoded events with actual database data via `getAllEvents()`.

## Context
- .gsd/SPEC.md
- app/page.tsx
- app/sections/EventsDiscovery.tsx

## Tasks

<task type="auto">
  <name>Fix Navbar Import</name>
  <files>app/page.tsx</files>
  <action>
    - Change the import of `Navbar` from `./sections/Navbar` to `@/components/Navbar`.
    - Ensure it is still rendered at the top of the page.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>page.tsx uses components/Navbar instead of app/sections/Navbar</done>
</task>

<task type="auto">
  <name>Integrate Real Event Data</name>
  <files>app/sections/EventsDiscovery.tsx</files>
  <action>
    - Import `getAllEvents` from `@/lib/actions/event.actions`
    - Import `EventCard` from `@/components/EventCard`
    - Change `EventsDiscovery` to an `async` component to fetch `getAllEvents()`.
    - Remove the hardcoded dummy data array.
    - Map over the fetched events and render them using `EventCard` instead of the inline `<div className="events-discovery-card">`.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>EventsDiscovery uses getAllEvents and EventCard components</done>
</task>

## Success Criteria
- [ ] Navbar correctly shows session state.
- [ ] EventsDiscovery section renders real events from the database.
