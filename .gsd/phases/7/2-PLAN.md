---
phase: 7
plan: 2
wave: 1
---

# Plan 7.2: Component Standardization

## Objective
Replace custom inline implementations with standard UI components to ensure design consistency.

## Context
- .gsd/SPEC.md
- app/sections/FeaturesBento.tsx
- app/sections/SocialProof.tsx

## Tasks

<task type="auto">
  <name>Standardize Features Bento</name>
  <files>app/sections/FeaturesBento.tsx</files>
  <action>
    - Import and use `ExpandableBentoGrid` from `@/components/ui/expandable-bento-grid`.
    - Refactor the current custom CSS grid implementation to use the props expected by `ExpandableBentoGrid`.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>FeaturesBento uses ExpandableBentoGrid</done>
</task>

<task type="auto">
  <name>Standardize Social Proof</name>
  <files>app/sections/SocialProof.tsx</files>
  <action>
    - Import and use `TestimonialsCard` from `@/components/ui/testimonials-card`.
    - Refactor the hardcoded testimonial HTML block to map over data using `TestimonialsCard`.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>SocialProof uses TestimonialsCard</done>
</task>

## Success Criteria
- [ ] FeaturesBento section utilizes standard ExpandableBentoGrid.
- [ ] SocialProof section utilizes standard TestimonialsCard.
