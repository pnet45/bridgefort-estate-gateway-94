# Bridgefort Homes UX/UI Engineering Skill

Version: 1.0  
Applies to: Bridgefort Homes website, CRM/admin console, customer portal, BHRealtors, Leo AI, travel booking, email center, property listings, and future product surfaces.

## Purpose

Produce polished, professional, modern interfaces that make real business tasks easier—not merely prettier. Treat UX as the combined quality of task completion, clarity, trust, accessibility, responsiveness, consistency, performance, and maintainability.

Use this file as the reusable project-specific UX/UI playbook. Pair it with the root `DESIGN.md` for the design system. Preserve existing business rules and working features unless a change is explicitly requested.

## Working modes

- `/restyle`: improve visual presentation while preserving behavior, content, data contracts, permissions, and navigation.
- `/ux-audit`: inspect the existing experience, identify friction and risks, rank findings by severity, and recommend actionable fixes.
- `/ux-design`: design the end-to-end task flow, information architecture, responsive layouts, components, and all relevant states before implementation.
- `/ux-review`: review the exact diff for usability, accessibility, responsive issues, regressions, consistency, and readiness to merge.
- Combined requests should run in sequence: understand intent → audit → design → implement → review → verify.

## Eight UX disciplines

### 1. Intent discovery
- Identify the primary user, their goal, the context, and the highest-value next action.
- Inspect existing screens, route structure, shared components, design tokens, business logic, permissions, and adjacent flows before changing code.
- Ask a question only when a missing decision materially changes the solution; otherwise state reasonable assumptions and proceed.
- Prefer user outcomes and task completion over decorative trends or personal taste.

### 2. Information hierarchy
- Give each page a clear purpose, descriptive title, concise explanation, and obvious primary action.
- Group related information; order content by frequency, importance, and task sequence.
- Make current location, navigation state, filters, status, and next steps visible.
- Use progressive disclosure for advanced or infrequent controls; do not hide essential actions behind unnecessary clicks.
- For dense CRM/admin screens, use stable columns, useful table defaults, clear status labels, purposeful filters, and contextual actions. Avoid turning every data point into a card.
- Keep visual hierarchy consistent across pages while adapting to each workflow.

### 3. State completeness
For every data-driven component, explicitly consider:
- Initial/loading, skeleton or progress feedback when appropriate
- Populated/default state
- Empty state (no records yet) with a relevant next action
- No-results state (filters/search excluded everything) with a clear reset
- Error state with understandable recovery and retry when safe
- Partial/stale/offline state where applicable
- Success/confirmation state
- Disabled, permission-denied, expired-session, and read-only states where applicable
- Long content, large datasets, unusually long names/URLs, missing images, and narrow viewports

Never use one generic empty message for different causes. Do not invent success: show success only after the operation actually completes.

### 4. Form UX
- Use persistent, programmatically associated labels; placeholders are examples, not labels.
- Group fields into meaningful sections and keep forms as short as the business process permits.
- Mark required/optional fields clearly; use correct input types, autocomplete, input masks only when beneficial, and helpful examples.
- Validate at the right time; place specific error text beside the affected field and preserve valid entered data after errors.
- Explain why sensitive or business-critical information is needed when helpful.
- Make submit, saving, saved, failure, retry, and duplicate-submission behavior explicit.
- Use confirmation for consequential actions, but avoid needless confirmation dialogs for routine reversible actions.
- On mobile, use suitable keyboard types, full-width fields, sticky actions only when they do not obscure content, and ensure focused fields remain visible.

### 5. Feedback and affordance
- Every interactive control should look interactive and communicate its purpose.
- Define hover, focus-visible, pressed, selected, expanded, disabled, loading, success, and error behavior as applicable.
- Use clear action labels such as “Create inspection booking” instead of vague labels such as “Continue” when the outcome is otherwise unclear.
- Provide immediate feedback for save, copy, upload, filter, send, allocation, payment, and booking actions.
- Prevent double submits and duplicate side effects where relevant.
- Use subtle transitions and micro-interactions only when they clarify state; respect reduced-motion settings.
- Status must not depend on color alone: pair color with text, icon, or another visual cue.

### 6. UX auditor
Audit in priority order:
1. Critical task blockers, broken flows, data loss, misleading status, permission leaks, or unsafe consequential actions.
2. Accessibility failures, unreadable contrast, keyboard traps, missing focus, and unusable mobile layouts.
3. Confusing hierarchy, unclear navigation, incomplete states, weak form validation, and missing feedback.
4. Visual inconsistencies, spacing, typography, iconography, motion, and polish.
5. Optional enhancements and delight.

For each finding, record severity, location, user impact, reproduction/condition, recommended fix, and validation criteria. Distinguish confirmed defects from hypotheses. Review the exact diff after fixes; do not declare a fix complete just because code was edited.

### 7. Design system
- Extend existing tokens and shared components; do not create competing palettes, arbitrary radii, or one-off button styles.
- Use semantic design tokens for text, surfaces, borders, focus, status, and theme variants.
- Keep consistent spacing, typography, radii, elevation, icon style, component sizing, and motion.
- Prefer composition of established components over bespoke controls. Add reusable components only when repeated use or accessibility justifies them.
- Record new patterns and decisions in `DESIGN.md`.
- Avoid hard-coded colors that break themes; inspect the actual component library and theme variables before adding CSS.
- Avoid global selectors that accidentally alter third-party widgets or unrelated surfaces.

### 8. Visual character and modern polish
- Target a premium, trustworthy, contemporary real-estate and business-product feel: clear typography, confident whitespace, purposeful grids, clean borders, restrained shadows, strong imagery, and consistent alignment.
- Preserve Bridgefort's purple identity and use estate gold as a restrained accent for highlights, key indicators, or selected actions. Use dark text on light surfaces and light text on dark surfaces; verify actual contrast rather than assuming brand colors pass.
- Use glassmorphism/liquid-glass only for selected overlays or layered surfaces where legibility remains strong; do not make every card translucent or sacrifice contrast.
- Use property imagery with consistent aspect ratios, intentional crops, appropriate `object-fit`, descriptive alt text, optimized file sizes, and graceful fallbacks.
- Avoid visual noise: excessive gradients, glowing borders, unnecessary animation, random icons, too many competing accent colors, and cards nested inside cards.
- Make charts, metrics, badges, and dashboard summaries answer a question or support a decision. Do not add decorative data visualization without a user need.
- Use a deliberate responsive layout rather than shrinking desktop screens to fit mobile.
- Modern means coherent, fast, accessible, and useful—not adopting a trend without a product reason.

## Bridgefort-specific patterns

- Property discovery: clear property/estate name, location, price, size, availability/status, key differentiators, trustworthy imagery, and a clear inspection/contact action. Keep pricing and terms accurate and avoid implying guaranteed returns.
- CRM and admin: preserve role/permission enforcement on the server; UI visibility is not authorization. Use readable data tables, search/filter reset, actionable empty states, safe destructive actions, clear statuses, and responsive detail views.
- Bookings and payments: communicate each step and current status accurately; never show a payment or allocation as confirmed before the authoritative business process confirms it.
- Email center: keep compose and reading surfaces contained; long text, links, tables, attachments, and toolbars must wrap, scroll, or adapt rather than spill outside cards or the viewport.
- Leo AI: distinguish public information from staff-only/admin-only data, make uncertainty clear, and give users clear next actions without exposing restricted records.
- Mobile admin: provide a usable navigation pattern, collapsible submenus when appropriate, reachable actions, and no overlapping controls. Keep global/admin navigation scrollable and ensure dialogs fit the viewport.
- Theme: test both light and dark modes. A color that looks polished in one theme is not acceptable if it reduces readability in the other.

## Accessibility baseline

Target WCAG 2.2 AA where applicable:
- Normal text contrast at least 4.5:1; large text at least 3:1.
- Visible keyboard focus for all interactive controls; logical focus order and no keyboard traps.
- Semantic HTML and correct heading hierarchy; accessible names for icon-only controls.
- Persistent labels, understandable errors, status announcements where useful, and meaningful alt text.
- Do not convey meaning by color alone.
- Support zoom/reflow and reduced motion; avoid horizontal scrolling at narrow widths unless the content genuinely requires it.
- Aim for touch targets around 44 × 44 CSS pixels with sufficient spacing on mobile.
- Test keyboard and screen-reader behavior for custom widgets, menus, dialogs, tabs, and dynamic updates.

## Responsive and performance baseline

Verify at minimum:
- Narrow mobile (320–375 CSS px), common iPhone and Android widths, tablet, and desktop.
- Portrait and landscape where the flow makes it relevant.
- No clipped text, overlapping buttons, hidden primary actions, broken sticky elements, or unintended horizontal overflow.
- Large text/long translations or names, empty and error states, and realistic large datasets.
- Images are responsive and appropriately sized; avoid unnecessary dependencies, heavy animation, and layout shifts.
- Use project-supported browser and performance tooling; record what was actually tested.

## Implementation and verification workflow

1. Read the relevant code, current `DESIGN.md`, route, component, and adjacent business logic.
2. State the intended user outcome and identify behavior that must not change.
3. Audit the current state and rank findings as Blocker / Must fix / Should fix / Polish.
4. Propose a focused design and reusable component/token choices.
5. Implement the smallest coherent diff; preserve API contracts, database rules, role checks, existing routes, and established functionality.
6. Run available lint, typecheck, unit/integration tests, and production build. Add or update tests for changed behavior where practical.
7. Review the diff for unrelated changes, accessibility, error handling, state completeness, responsive layout, and theme parity.
8. Verify with browser/device checks when tools are available. If not available, say exactly what remains unverified.
9. Check CI/deployment status. Treat external rate limits or unavailable checks as blocked verification, not as a code pass or a code failure.
10. Summarize changed files, key UX decisions, checks actually run, results, risks, and outstanding work.

## Definition of done

- [ ] User goal and primary action are clear.
- [ ] Existing business behavior and permissions are preserved or intentionally changed.
- [ ] Loading, empty, no-results, error, success, disabled, and permission states are covered where relevant.
- [ ] Forms provide labels, validation, recovery, and duplicate-submit protection where relevant.
- [ ] Keyboard access, visible focus, semantic structure, and contrast are checked.
- [ ] Light and dark themes are readable.
- [ ] Mobile/tablet/desktop layouts are checked; no unintended clipping or overlap.
- [ ] Shared design tokens/components are reused; new patterns are documented.
- [ ] Tests/build/CI status are reported honestly.
- [ ] Exact diff has been reviewed; unresolved blockers are clearly listed.
- [ ] No claim of production readiness without supporting verification.

## Review response format

Report:
1. **Verdict:** Ready / Changes required / Verification blocked.
2. **Must fix:** concrete blockers with locations and user impact.
3. **Should fix:** important quality issues.
4. **Polish:** optional improvements.
5. **Applied fixes:** exact files/changes.
6. **Verification:** tests, build, CI, responsive/theme/accessibility checks actually performed.
7. **Remaining risk:** what is still unverified and the next best action.

## Reference standards

Use current primary guidance where applicable:
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WAI-ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- Web.dev performance guidance: https://web.dev/articles/vitals
- Nielsen Norman Group usability heuristics: https://www.nngroup.com/articles/ten-usability-heuristics/
