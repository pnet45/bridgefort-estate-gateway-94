
import React, { forwardRef, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ReCaptchaProps {
  onChange: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────
// reCAPTCHA is temporarily DISABLED site-wide.
// The current site key belongs to a different domain. It will be re-enabled
// once a new reCAPTCHA site key is generated for bridgeforthomes.com.
//
// To re-enable: set RECAPTCHA_ENABLED back to true and put the new site key
// below. No other files need to change — every form, and the matching
// server-side verification functions, automatically resume working as
// before once this flag is flipped.
// ─────────────────────────────────────────────────────────────────────────
export const RECAPTCHA_ENABLED = false;
export const RECAPTCHA_DISABLED_TOKEN = 'recaptcha-disabled';

const ReCaptcha = forwardRef<ReCAPTCHA, ReCaptchaProps>(
  ({ onChange, onExpired, onError }, ref) => {
    // Using reCAPTCHA v2 site key
    const siteKey = '6Lc6wyssAAAAAFZXHMFPGkmX8lcVxFbejyjemBoQ';

    // While disabled: render nothing, but immediately report a "passed"
    // token so any form's `!recaptchaToken` guard still lets submission
    // through. Server-side verify-recaptcha functions recognize this same
    // sentinel token and skip the real Google check (see those files).
    useEffect(() => {
      if (!RECAPTCHA_ENABLED) {
        onChange(RECAPTCHA_DISABLED_TOKEN);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!RECAPTCHA_ENABLED) {
      return null;
    }

    return (
      <ReCAPTCHA
        ref={ref}
        sitekey={siteKey}
        onChange={onChange}
        onExpired={onExpired}
        onErrored={onError}
        size="normal"
        theme="light"
      />
    );
  }
);

ReCaptcha.displayName = 'ReCaptcha';

export default ReCaptcha;
