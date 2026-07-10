import React, { forwardRef, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ReCaptchaProps {
  onChange: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
  /** 'invisible' renders v2 Invisible (badge only, executes on submit).
   *  Default 'normal' shows the classic checkbox challenge. */
  variant?: 'normal' | 'invisible';
}

// ─────────────────────────────────────────────────────────────────────────
// Hybrid reCAPTCHA (v2 Invisible for login, v3 for other forms via
// GoogleReCaptcha in App.tsx). Site keys come from env vars:
//   VITE_RECAPTCHA_V2_SITE_KEY   (used here)
//   VITE_RECAPTCHA_V3_SITE_KEY   (used by GoogleReCaptchaProvider)
//
// When VITE_RECAPTCHA_V2_SITE_KEY is empty we render nothing and emit a
// sentinel token so form submit guards still pass. The matching server-side
// verify-recaptcha function recognises the sentinel and skips Google's check.
// This keeps the whole app functional until real keys are pasted into .env.
// ─────────────────────────────────────────────────────────────────────────
export const RECAPTCHA_DISABLED_TOKEN = 'recaptcha-disabled';

const V2_SITE_KEY = (import.meta.env.VITE_RECAPTCHA_V2_SITE_KEY as string | undefined) || '';
export const RECAPTCHA_ENABLED = V2_SITE_KEY.length > 0;

const ReCaptcha = forwardRef<ReCAPTCHA, ReCaptchaProps>(
  ({ onChange, onExpired, onError, variant = 'normal' }, ref) => {
    // Soft-pass while no key is configured: emit sentinel token so forms unblock.
    useEffect(() => {
      if (!RECAPTCHA_ENABLED) {
        onChange(RECAPTCHA_DISABLED_TOKEN);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!RECAPTCHA_ENABLED) return null;

    return (
      <ReCAPTCHA
        ref={ref}
        sitekey={V2_SITE_KEY}
        onChange={onChange}
        onExpired={onExpired}
        onErrored={onError}
        size={variant === 'invisible' ? 'invisible' : 'normal'}
        theme="light"
        badge="bottomright"
      />
    );
  }
);

ReCaptcha.displayName = 'ReCaptcha';
export default ReCaptcha;
