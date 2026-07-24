/**
 * Focus registry
 * ----------------
 * A tiny stack of "active" forms/modals. Any open modal or form that cares
 * about focus management registers itself here (see `useFocusRegistration`).
 * When a notification fires with `focusActiveForm: true`, we move keyboard
 * focus into the most recently registered (topmost) target — e.g. a
 * validation-error toast can send focus back to the first invalid field in
 * the open modal/form, instead of leaving focus stranded on a dismiss button
 * or nowhere at all.
 *
 * This is deliberately independent of any single dialog implementation:
 * Radix's own focus trap already handles focus-on-open / focus-return-on-close
 * for modals it renders. This registry is for the cross-cutting case — a
 * toast/snackbar elsewhere on the page needing to redirect focus back into
 * whatever the user was already working in.
 */

export interface FocusTarget {
  id: string;
  /** Move keyboard focus to the right element within this target. */
  focus: () => void;
}

const stack: FocusTarget[] = [];

export function registerFocusTarget(target: FocusTarget): () => void {
  stack.push(target);
  return () => {
    const i = stack.lastIndexOf(target);
    if (i >= 0) stack.splice(i, 1);
  };
}

/** Focuses the topmost registered target. Returns false if none are registered. */
export function focusActiveTarget(): boolean {
  const top = stack[stack.length - 1];
  if (!top) return false;
  top.focus();
  return true;
}

export function hasActiveTarget(): boolean {
  return stack.length > 0;
}
