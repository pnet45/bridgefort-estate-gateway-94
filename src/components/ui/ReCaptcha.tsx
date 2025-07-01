
import React, { forwardRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ReCaptchaProps {
  onChange: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
}

const ReCaptcha = forwardRef<ReCAPTCHA, ReCaptchaProps>(
  ({ onChange, onExpired, onError }, ref) => {
    // You'll need to set this site key in your environment variables
    const siteKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // This is a test key, replace with your actual key

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
