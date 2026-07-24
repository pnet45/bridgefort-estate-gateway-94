import { useRef, useSyncExternalStore } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { subscribeModals, getModalSnapshot, dismissModal } from '@/lib/notifications/modal-store';
import { useFocusRegistration } from '@/hooks/useFocusRegistration';

/**
 * Renders notifications fired via `notify({ kind: 'modal' })` (or any
 * `severity: 'critical'` notification, which auto-resolves to a modal).
 * Mount exactly once, at the app root — see App.tsx.
 *
 * Built on the existing Radix-based <Dialog>, so focus-trap-on-open and
 * focus-return-on-close are handled by Radix itself. While a modal
 * notification is open, it also registers with the focus registry so a
 * related toast/snackbar firing afterward (e.g. "still waiting on your
 * confirmation") can redirect focus back into it.
 */
export function NotificationModalHost() {
  const queue = useSyncExternalStore(subscribeModals, getModalSnapshot, getModalSnapshot);
  const current = queue[0];
  const contentRef = useRef<HTMLDivElement>(null);

  useFocusRegistration(contentRef, { active: !!current, id: current?.id });

  if (!current) return null;

  const close = () => dismissModal(current.id);

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent ref={contentRef}>
        <DialogHeader>
          <DialogTitle>{current.title}</DialogTitle>
          {current.message && <DialogDescription>{current.message}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          {current.actionLabel && (
            <Button
              onClick={() => {
                current.onAction?.();
                close();
              }}
            >
              {current.actionLabel}
            </Button>
          )}
          <Button variant="secondary" onClick={close}>
            {current.actionLabel ? 'Dismiss' : 'OK'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
