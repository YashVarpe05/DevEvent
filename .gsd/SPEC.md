# DevEvent QA Fixes Spec
Status: FINALIZED

## Requirements
Implement the recommended fix order from the Home Page QA Audit:
1. Fix `app/page.tsx` to import the session-aware `components/Navbar.tsx`.
2. Fix `app/sections/EventsDiscovery.tsx` to fetch actual data from the database using `getAllEvents()` and map it to `components/EventCard.tsx`.
3. Fix the `Navbar` to include a functional mobile hamburger menu.
4. Add basic SEO metadata to `app/page.tsx`.
5. Swap out inline custom sections for the standardized `ui` components (`ExpandableBentoGrid`, `TestimonialsCard`).
6. Clean up hardcoded hex colors to use standard CSS tokens across all section files.
7. Migrate `<img>` and `<link>` tags to Next.js optimized components (`next/image`, `next/font`).
8. Create placeholder pages or remove links for the missing routes in the Footer.
