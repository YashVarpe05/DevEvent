---
phase: 7
plan: 3
wave: 2
---

# Plan 7.3: UI Polish, Typography & Tokens

## Objective
Apply standard CSS tokens across all section components to prevent hardcoded colors from breaking themes, and fix typographic errors.

## Context
- .gsd/SPEC.md
- app/sections/Hero.tsx
- app/sections/StatsBar.tsx
- app/sections/CTABottom.tsx
- app/sections/CommunityMarquee.tsx
- app/sections/Footer.tsx

## Tasks

<task type="auto">
  <name>Cleanup Tokens and Typography</name>
  <files>app/sections/Hero.tsx, app/sections/StatsBar.tsx, app/sections/CTABottom.tsx, app/sections/CommunityMarquee.tsx</files>
  <action>
    - Replace `#0A0A0B`, `#FF6B35`, `#6B6B74`, `#00D4AA`, etc. with CSS variables like `var(--bg-base)`, `var(--gold)`, `var(--text-secondary)`, `var(--accent-teal)` where appropriate.
    - Change headings in `Hero.tsx` and `CTABottom.tsx` to use `font-serif` instead of `var(--font-display)`.
    - Swap `CountUp` to `AnimatedNumber` from `@/components/ui/animated-number` in `StatsBar.tsx`.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Standard CSS tokens and proper fonts are used across these sections.</done>
</task>

<task type="auto">
  <name>Footer Polish</name>
  <files>app/sections/Footer.tsx</files>
  <action>
    - Change "Built with </>" to "Made with ♥ in India".
    - Replace links to missing pages (`/pricing`, `/docs`, `/api`, `/opensource`, `/privacy`, `/terms`) with `#` to neutralize dead links.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Footer text corrected and dead links neutralized.</done>
</task>

## Success Criteria
- [ ] Sections respect global design tokens correctly.
- [ ] Typography follows the premium spec.
- [ ] Footer has accurate text.
