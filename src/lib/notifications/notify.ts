import { toast as sonnerToast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { pushModal } from './modal-store';
import { focusActiveTarget } from './focus-registry';
import type { NotifyInput, NotifyKind } from './types';

/**
 * Decides which of the four notification kinds fits a given input, when the
 * caller hasn't forced one explicitly:
 *
 *   1. severity: 'critical'   -> modal      (must be acknowledged, blocks input)
 *   2. persist: true          -> stateful   (needs a durable record / bell entry)
 *   3. actionLabel present    -> snackbar   (transient + an action, e.g. "Undo")
 *   4. otherwise              -> toast      (transient, no action needed)
 */
export function resolveKind(input: NotifyInput): NotifyKind {
  if (input.kind) return input.kind;
  if (input.severity === 'critical') return 'modal';
  if (input.persist) return 'stateful';
  if (input.actionLabel) return 'snackbar';
  return 'toast';
}

function fireToast(input: NotifyInput) {
  const description = input.message;
  switch (input.severity) {
    case 'success':
      sonnerToast.success(input.title, { description });
      break;
    case 'error':
      sonnerToast.error(input.title, { description });
      break;
    case 'warning':
      sonnerToast.warning(input.title, { description });
      break;
    default:
      sonnerToast(input.title, { description });
  }
}

function fireSnackbar(input: NotifyInput) {
  sonnerToast(input.title, {
    description: input.message,
    position: 'bottom-left',
    duration: 6000,
    action: input.actionLabel
      ? { label: input.actionLabel, onClick: () => input.onAction?.() }
      : undefined,
  });
}

function fireModal(input: NotifyInput) {
  pushModal({
    title: input.title,
    message: input.message,
    severity: input.severity,
    actionLabel: input.actionLabel,
    onAction: input.onAction,
  });
}

async function fireStateful(input: NotifyInput) {
  const { error } = await supabase.from('notifications').insert({
    user_id: input.userId ?? null,
    audience: input.audience ?? 'user',
    type: input.type ?? input.severity ?? 'info',
    title: input.title,
    message: input.message ?? null,
    link: input.link ?? null,
  });
  if (error) {
    console.error('notify(): failed to persist stateful notification', error);
  }
  // Persisting alone is silent (it just shows up in the bell later). Most
  // callers also want the user to notice it now, so bridge to a toast unless
  // explicitly suppressed.
  if (!input.silent) {
    fireToast(input);
  }
}

/**
 * Single entry point for firing a notification. Picks toast / snackbar /
 * modal / stateful automatically (see `resolveKind`), or honors an explicit
 * `kind`. Pass `focusActiveForm: true` to move keyboard focus into whatever
 * modal/form is currently registered (see focus-registry.ts) once the
 * notification has been presented — useful for validation errors.
 */
export async function notify(input: NotifyInput): Promise<void> {
  const kind = resolveKind(input);

  switch (kind) {
    case 'toast':
      fireToast(input);
      break;
    case 'snackbar':
      fireSnackbar(input);
      break;
    case 'modal':
      fireModal(input);
      break;
    case 'stateful':
      await fireStateful(input);
      break;
  }

  if (input.focusActiveForm) {
    // Defer one frame so the toast/modal has painted before we move focus.
    requestAnimationFrame(() => focusActiveTarget());
  }
}

// Convenience wrappers for call sites that already know which kind they want.
export const notifyToast = (input: Omit<NotifyInput, 'kind'>) =>
  notify({ ...input, kind: 'toast' });

export const notifySnackbar = (input: Omit<NotifyInput, 'kind'>) =>
  notify({ ...input, kind: 'snackbar' });

export const notifyModal = (input: Omit<NotifyInput, 'kind'>) =>
  notify({ ...input, kind: 'modal' });

export const notifyStateful = (input: Omit<NotifyInput, 'kind' | 'persist'>) =>
  notify({ ...input, kind: 'stateful', persist: true });
