# Phase 3 Research: Event Creation UX Benchmarking

## Objective
Benchmark industry-leading event platforms (Luma, Eventbrite, Meetup) to inform the Information Architecture (IA), UX hierarchy, and minimum publish readiness for DevEvent's event creation + detail pages.

## Insights

### 1. Luma
- **Simplicity first:** Steps are minimal, leveraging sensible defaults to reduce decision fatigue.
- **Workflow:** Guided step-by-step (Basics -> Details -> Advanced).
- **Customization:** Excellent theming and cover image galleries.
- **Key Takeaway for DevEvent:** Emphasize a clean, Luma-like step-by-step wizard for Draft creation. Autosave is critical to prevent data loss.

### 2. Eventbrite
- **Information Architecture:** Highly modular layout grouped into logical sections: Basics, Location, Date & Time, Details (rich text + multimedia), Tickets (Free/Paid config), and Publish.
- **UX Patterns:** Offers a continuous "Save and Continue" flow, detailed preview before publishing, and checklist validation to ensure the event meets requirements before going live.
- **Key Takeaway for DevEvent:** Use a multi-section editor structure (Basics, Date & Time, Location/Online, Registration/Pricing). Implement a "Publish Readiness Modal" that lists missing mandatory fields (like Eventbrite does before allowing publish).

### 3. Meetup (Event Detail Page)
- **Visual Hierarchy (Above the Fold):** High-quality featured image (Hero), clear Event Title, Date/Time, Location format (Online vs. Physical), and a prominent primary CTA (RSVP/Register).
- **Scannability (Below the Fold):** Progressive disclosure of detailed description, agenda, speakers, and location map.
- **Key Takeaway for DevEvent:** Follow this hierarchy strictly for the public `/events/[slug]` view. Keep the "Register" CTA sticky or always visible on mobile.
