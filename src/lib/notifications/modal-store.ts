import type { ModalNotification } from './types';

/**
 * Minimal external store (subscribe/getSnapshot) for imperatively-triggered
 * modal notifications, so `notify({ kind: 'modal' })` can be called from
 * anywhere (event handlers, async callbacks) without prop-drilling. Read via
 * `useSyncExternalStore` in NotificationModalHost, which is mounted once at
 * the app root.
 */

type Listener = () => void;

let queue: ModalNotification[] = [];
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export function pushModal(input: Omit<ModalNotification, 'id'>): string {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `modal_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  queue = [...queue, { id, ...input }];
  emit();
  return id;
}

export function dismissModal(id: string) {
  queue = queue.filter((m) => m.id !== id);
  emit();
}

export function subscribeModals(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getModalSnapshot(): ModalNotification[] {
  return queue;
}
