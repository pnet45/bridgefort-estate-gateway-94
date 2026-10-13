# Bridgefort Homes Design System

This document records the existing UI tokens and implementation conventions. Extend the current system instead of introducing a competing palette or one-off styling.

## Visual character

- **Typography:** Sora for display/headings and Manrope for body/UI text, as loaded in `src/index.css`.
- **Primary:** Use the existing `--primary`, `--primary-foreground`, and `--ring` tokens. The current light theme uses vivid purple; dark mode defines a brighter purple variant.
- **Brand accent:** Use `--estate-gold` for restrained gold accents where it supports hierarchy; do not replace primary actions with decorative accents.
- **Surfaces:** Prefer semantic background, card, popover, muted, accent, border, and input tokens. For custom CRM surfaces, preserve readable dark text on light backgrounds and light text on dark backgrounds.
- **Shape:** Use the existing `--radius` token and established component-library radii.
- **Motion:** Respect `prefers-reduced-motion`; avoid motion that blocks or delays task completion.

## Information hierarchy

1. One clear primary action per section where possible.
2. Secondary actions should be visually quieter; destructive actions require clear labels and confirmation when consequential.
3. Keep headings, supporting descriptions, status, and next actions easy to scan. Avoid dense rows that overflow on mobile.

## Component and state requirements

- Use shared components from `src/components/ui` before creating custom controls.
- Interactive controls must have a clear label or accessible name, a visible hover/active state, and a visible keyboard focus indicator.
- Cover applicable loading, empty, error, success, partial-data, and offline states. Empty states should explain what is missing and offer a useful next step when one exists.
- Forms need persistent labels, inline validation, clear error recovery, and safe submission feedback.
- Confirm consequential/destructive actions and prevent accidental double submission where relevant.
- Do not use color alone to communicate status.

## Accessibility and responsive behavior

- Preserve keyboard operation and logical focus order.
- Keep a high-contrast `:focus-visible` ring; do not remove outlines without an equivalent replacement.
- Maintain readable contrast in both light and dark themes.
- Design mobile-first for iPhone and Android; avoid clipped content, overlapping actions, fixed-width forms, and horizontal scrolling unless the data genuinely requires it.
- Honor reduced-motion preferences.

## UX review checklist

Before merging UI changes, review intent and worst-case scenarios, action hierarchy, all applicable component states, form behavior, feedback/affordance, accessibility, and visual consistency. Fix blockers first, then re-review the exact diff and validate build/tests and responsive light/dark behavior. A green visual review does not substitute for passing CI.
