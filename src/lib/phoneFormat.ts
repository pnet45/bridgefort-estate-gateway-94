/**
 * Lightweight phone formatting/validation - no external dependency.
 * Defaults to Nigerian numbers (Bridgefort's primary market) but degrades
 * gracefully to generic international formatting for other countries.
 */

const NIGERIA_CODE = '234';

/** Strips everything except digits and a single leading +. */
function cleanDigits(raw: string): { plus: boolean; digits: string } {
  const plus = raw.trim().startsWith('+');
  const digits = raw.replace(/[^\d]/g, '');
  return { plus, digits };
}

/**
 * Formats phone input as the user types (or pastes). Handles:
 * - Local Nigerian format starting with 0 (08012345678 -> +234 801 234 5678)
 * - Nigerian country code with or without + (234... -> +234 ...)
 * - Generic international numbers (groups digits in 3s after the code)
 * Caps at 15 digits (E.164 max) so the user can't keep typing past a valid length.
 */
export function formatPhoneInput(raw: string): string {
  let { plus, digits } = cleanDigits(raw);
  if (!digits) return '';

  // Local Nigerian format: 0 + 10 digits -> treat as +234 and drop the leading 0
  if (!plus && digits.startsWith('0') && digits.length <= 11) {
    digits = NIGERIA_CODE + digits.slice(1);
    plus = true;
  } else if (!plus && digits.startsWith(NIGERIA_CODE)) {
    plus = true;
  }

  digits = digits.slice(0, 15); // E.164 max length

  if (digits.startsWith(NIGERIA_CODE) && plus) {
    const rest = digits.slice(3);
    const parts = [rest.slice(0, 3), rest.slice(3, 6), rest.slice(6, 10)].filter(Boolean);
    return `+234${parts.length ? ' ' + parts.join(' ') : ''}`;
  }

  if (plus) {
    // Generic international: country code (1-3 digits) + grouped rest
    const ccLen = digits.length > 10 ? 3 : digits.length > 7 ? 2 : 1;
    const cc = digits.slice(0, ccLen);
    const rest = digits.slice(ccLen);
    const groups = rest.match(/.{1,3}/g) || [];
    return `+${cc}${groups.length ? ' ' + groups.join(' ') : ''}`;
  }

  // No country code at all yet - just group as typed, don't force one on the user
  const groups = digits.match(/.{1,4}/g) || [];
  return groups.join(' ');
}

export interface PhoneValidationResult {
  valid: boolean;
  message?: string;
}

/** Validates a (possibly formatted) phone value. Pair with formatPhoneInput's onChange. */
export function validatePhone(value: string): PhoneValidationResult {
  const { plus, digits } = cleanDigits(value);
  if (!digits) {
    return { valid: false, message: 'Phone number is required.' };
  }

  const normalized = digits.startsWith('0') && digits.length <= 11
    ? NIGERIA_CODE + digits.slice(1)
    : digits;

  if (normalized.startsWith(NIGERIA_CODE) && (plus || digits.startsWith(NIGERIA_CODE) || digits.startsWith('0'))) {
    const local = normalized.slice(3);
    if (local.length !== 10) {
      return {
        valid: false,
        message: `Nigerian numbers need 10 digits after the country code, e.g. +234 801 234 5678 (got ${local.length}).`,
      };
    }
    return { valid: true };
  }

  if (digits.length < 8 || digits.length > 15) {
    return {
      valid: false,
      message: 'Enter a valid phone number with country code, e.g. +234 801 234 5678 or +1 415 555 0132.',
    };
  }

  return { valid: true };
}
