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

    // A genuine widget error here (site key registered for the wrong
    // domain, the script blocked by an extension/network policy, a v2/v3
    // key mix-up, etc.) is a *configuration* problem, not evidence the
    // visitor is a bot — and previously it left onChange(null) as the final
    // word, which permanently disabled the submit button with no way for a
    // real user to recover. Fail open here too, the same way the
    // verify-recaptcha edge function already fails open when its secret
    // isn't configured: log it clearly so the misconfiguration is
    // diagnosable, but still hand the form a token so people can sign
    // in/up. The server-side check still applies for anyone who gets a real
    // reCAPTCHA challenge.
    const handleErrored = () => {
      console.error(
        'reCAPTCHA widget failed to load/render — check that the current domain is registered ' +
          'for VITE_RECAPTCHA_V2_SITE_KEY in the Google reCAPTCHA admin console, and that the key ' +
          'is a v2 key (not a v3-only key). Falling back to disabled-token so the form stays usable.'
      );
      onError?.();
      onChange(RECAPTCHA_DISABLED_TOKEN);
    };

    return (
      <ReCAPTCHA
        ref={ref}
        sitekey={V2_SITE_KEY}
        onChange={onChange}
        onExpired={onExpired}
        onErrored={handleErrored}
        size={variant === 'invisible' ? 'invisible' : 'normal'}
        theme="light"
        badge="bottomright"
      />
    );
  }
);

ReCaptcha.displayName = 'ReCaptcha';
export default ReCaptcha;
