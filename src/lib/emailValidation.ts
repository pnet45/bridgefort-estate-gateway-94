/**
 * Email format validation only.
 *
 * Deliberately does NOT include a live "does this email already exist" check.
 * Supabase's signUp() already reports duplicate accounts safely (it returns a
 * user with an empty `identities` array instead of an error, specifically to
 * avoid leaking which emails are registered - see the handling in Auth.tsx).
 * A separate live duplicate-check endpoint would defeat that protection by
 * letting anyone enumerate valid emails one keystroke at a time, so this file
 * intentionally only covers format.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface EmailValidationResult {
  valid: boolean;
  message?: string;
}

export function validateEmailFormat(email: string): EmailValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { valid: false, message: 'Email is required.' };
  }
  if (/\s/.test(trimmed)) {
    return { valid: false, message: 'Email addresses can\'t contain spaces.' };
  }
  if (!trimmed.includes('@')) {
    return { valid: false, message: "Missing the @ symbol, e.g. name@example.com." };
  }
  const [local, domain] = trimmed.split('@');
  if (!local) {
    return { valid: false, message: 'Enter the part before the @ symbol.' };
  }
  if (!domain || !domain.includes('.')) {
    return { valid: false, message: 'Enter a domain with a dot, e.g. example.com.' };
  }
  if (!EMAIL_RE.test(trimmed)) {
    return { valid: false, message: 'Enter a valid email address, e.g. name@example.com.' };
  }
  return { valid: true };
}
