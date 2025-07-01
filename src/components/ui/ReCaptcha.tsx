
import React, { forwardRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ReCaptchaProps {
  onChange: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
}

const ReCaptcha = forwardRef<ReCAPTCHA, ReCaptchaProps>(
  ({ onChange, onExpired, onError }, ref) => {
    // Using your provided site key
    const siteKey = '6LeLDXQrAAAAAKbX9MLM61Hm67v_S5-ApMJS_chJ';

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
