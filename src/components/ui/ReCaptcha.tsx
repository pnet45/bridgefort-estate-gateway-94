
import React, { forwardRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ReCaptchaProps {
  onChange: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
}

const ReCaptcha = forwardRef<ReCAPTCHA, ReCaptchaProps>(
  ({ onChange, onExpired, onError }, ref) => {
    // Using the production site key
    const siteKey = '6LfEFiosAAAAAGXh3Iwp9Zw94go1jEs01WnnaXmH';

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
