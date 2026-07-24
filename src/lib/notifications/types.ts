/**
 * Shared types for the unified notification system.
 *
 * Four notification kinds, matching the categories used across the app:
 *  - toast:     transient, auto-dismissing, top of screen (sonner)
 *  - snackbar:  transient but action-bearing, bottom of screen (sonner)
 *  - modal:     blocking dialog that requires acknowledgement (Radix Dialog)
 *  - stateful:  persisted row in `notifications`, read by NotificationBell
 */

export type NotifyKind = 'toast' | 'snackbar' | 'modal' | 'stateful';

export type NotifySeverity = 'info' | 'success' | 'warning' | 'error' | 'critical';

export interface NotifyInput {
  /** Short headline. */
  title: string;
  /** Optional supporting copy. */
  message?: string;
  /** Force a specific presentation. If omitted, `resolveKind` picks one. */
  kind?: NotifyKind;
  severity?: NotifySeverity;
  /** Label for a snackbar/modal action button (e.g. "Undo", "Review"). */
  actionLabel?: string;
  onAction?: () => void;
  /** Persist to the `notifications` table (forces kind: 'stateful' unless overridden). */
  persist?: boolean;
  /** Only relevant when persisting. */
  audience?: 'user' | 'admin';
  userId?: string;
  link?: string;
  /** Maps to `notifications.type`, also used by NotificationBell to pick an icon. */
  type?: string;
  /**
   * If true, once the notification has been presented, move keyboard focus
   * into the active form/modal (see focus-registry.ts) — e.g. a validation
   * toast should return focus to the first invalid field.
   */
  focusActiveForm?: boolean;
  /** Suppress the bridging toast that normally accompanies a stateful notification. */
  silent?: boolean;
}

export interface ModalNotification {
  id: string;
  title: string;
  message?: string;
  severity?: NotifySeverity;
  actionLabel?: string;
  onAction?: () => void;
}
