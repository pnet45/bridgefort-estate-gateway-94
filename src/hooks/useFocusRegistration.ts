import { useEffect } from 'react';
import type { RefObject } from 'react';
import { registerFocusTarget } from '@/lib/notifications/focus-registry';

interface UseFocusRegistrationOptions {
  /** Only register while this is true (e.g. a modal's `open` state). Default: true. */
  active?: boolean;
  /** Identifier, useful for debugging which target last received focus. */
  id?: string;
  /**
   * Custom focus behavior. By default: focus the first invalid field inside
   * the container if one exists, otherwise the first focusable element.
   */
  focus?: () => void;
}

function defaultFocus(container: HTMLElement) {
  const invalid = container.querySelector<HTMLElement>(
    '[aria-invalid="true"], [data-invalid="true"]'
  );
  const target =
    invalid ??
    container.querySelector<HTMLElement>(
      'input, textarea, select, button, [href], [tabindex]:not([tabindex="-1"])'
    );
  target?.focus();
}

/**
 * Registers a form or modal container as the "active" focus target. While
 * registered, `notify({ focusActiveForm: true })` calls will move keyboard
 * focus into it (first invalid field, or first focusable element).
 *
 * Usage: call inside any modal/dialog/form component, passing a ref to its
 * outermost container.
 */
export function useFocusRegistration(
  containerRef: RefObject<HTMLElement>,
  options: UseFocusRegistrationOptions = {}
) {
  const { active = true, id = 'anonymous', focus } = options;

  useEffect(() => {
    if (!active) return;
    const el = containerRef.current;
    if (!el) return;

    const unregister = registerFocusTarget({
      id,
      focus: focus ?? (() => defaultFocus(el)),
    });

    return unregister;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, id, containerRef.current]);
}
