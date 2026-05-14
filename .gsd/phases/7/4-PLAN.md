---
phase: 7
plan: 4
wave: 2
---

# Plan 7.4: Next.js Optimizations & Mobile Fixes

## Objective
Improve performance by using Next.js optimized components and fix mobile navigation trapping.

## Context
- .gsd/SPEC.md
- app/layout.tsx
- components/EventCard.tsx
- app/sections/Navbar.tsx
- app/page.tsx

## Tasks

<task type="auto">
  <name>Performance Migrations</name>
  <files>app/layout.tsx, components/EventCard.tsx</files>
  <action>
    - In `app/layout.tsx`, migrate the `<link>` Google Fonts to use `next/font/google`.
    - In `components/EventCard.tsx`, migrate standard `<img>` tags to `next/image` `<Image>` components, ensuring `width` and `height` (or `fill`) are provided.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Layout uses next/font and EventCard uses next/image.</done>
</task>

<task type="auto">
  <name>Mobile Menu & SEO</name>
  <files>app/sections/Navbar.tsx, app/page.tsx</files>
  <action>
    - Implement a basic mobile hamburger menu toggle in `app/sections/Navbar.tsx` (or `components/Navbar.tsx` based on the previous plan outcome) so users aren't trapped on mobile.
    - Export `metadata` (Title, Description) from `app/page.tsx`.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Mobile menu exists and SEO metadata is present on home page.</done>
</task>

## Success Criteria
- [ ] Event cards use optimized images.
- [ ] Fonts are loaded optimally.
- [ ] Mobile users can navigate.
- [ ] Home page has valid SEO metadata.
