
import React, { forwardRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ReCaptchaProps {
  onChange: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
}

const ReCaptcha = forwardRef<ReCAPTCHA, ReCaptchaProps>(
  ({ onChange, onExpired, onError }, ref) => {
    // Using reCAPTCHA v2 site key
    const siteKey = '6Lc6wyssAAAAAFZXHMFPGkmX8lcVxFbejyjemBoQ';

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
