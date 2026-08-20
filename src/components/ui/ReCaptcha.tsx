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

// reCAPTCHA is intentionally OFF until explicitly enabled.
// Set VITE_ENABLE_RECAPTCHA=true together with a valid V2 site key when
// production verification is ready to be restored.
export const RECAPTCHA_DISABLED_TOKEN = 'recaptcha-disabled';

const V2_SITE_KEY = (import.meta.env.VITE_RECAPTCHA_V2_SITE_KEY as string | undefined) || '';
const ENABLE_FLAG = String(import.meta.env.VITE_ENABLE_RECAPTCHA || '').toLowerCase() === 'true';
export const RECAPTCHA_ENABLED = ENABLE_FLAG && V2_SITE_KEY.length > 0;

const ReCaptcha = forwardRef<ReCAPTCHA, ReCaptchaProps>(
  ({ onChange, onExpired, onError, variant = 'normal' }, ref) => {
    // Soft-pass while reCAPTCHA is intentionally disabled: emit a sentinel
    // token so existing submit guards remain functional without changing
    // every form that already consumes this component.
    useEffect(() => {
      if (!RECAPTCHA_ENABLED) {
        onChange(RECAPTCHA_DISABLED_TOKEN);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!RECAPTCHA_ENABLED) return null;

    const handleErrored = () => {
      console.error(
        'reCAPTCHA widget failed to load/render. Check the registered domain, ' +
          'VITE_RECAPTCHA_V2_SITE_KEY, and VITE_ENABLE_RECAPTCHA configuration.'
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
