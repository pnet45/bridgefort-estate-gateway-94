/**
 * Lightweight cross-component "profile changed" signal.
 *
 * Several components (Navbar, Dashboard, Profile page, etc.) each keep their
 * own local copy of the user's `profiles` row for performance / simplicity.
 * When a profile picture or profile field is updated in one of them, the
 * others have no way of knowing unless they re-fetch. Rather than a bigger
 * refactor into a single shared context, this file gives every screen a way
 * to say "the profile changed, please refresh" and to listen for that signal.
 *
 * Usage:
 *   import { notifyProfileUpdated, onProfileUpdated } from '@/lib/profileEvents';
 *
 *   // after a successful save/upload:
 *   notifyProfileUpdated();
 *
 *   // in a component that displays profile data:
 *   useEffect(() => onProfileUpdated(() => fetchProfile()), []);
 */

export const PROFILE_UPDATED_EVENT = 'bf:profile-updated';

export function notifyProfileUpdated() {
  window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT));
}

/**
 * Subscribes to profile-updated events. Returns an unsubscribe function,
 * so it can be used directly as a useEffect cleanup:
 *   useEffect(() => onProfileUpdated(fetchProfile), []);
 */
export function onProfileUpdated(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(PROFILE_UPDATED_EVENT, handler);
  return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handler);
}
