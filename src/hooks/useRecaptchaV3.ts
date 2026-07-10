import { useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { RECAPTCHA_DISABLED_TOKEN } from '@/components/ui/ReCaptcha';

/**
 * Passive reCAPTCHA v3 executor. Call `execute('action_name')` from a form
 * submit handler. When VITE_RECAPTCHA_V3_SITE_KEY isn't set the provider is
 * absent and we return the sentinel token so the server verify function
 * short-circuits — keeps the app usable in dev / before keys are pasted.
 */
export const useRecaptchaV3 = () => {
  const ctx = (() => {
    try {
      return useGoogleReCaptcha();
    } catch {
      return null;
    }
  })();

  const execute = useCallback(
    async (action: string): Promise<string> => {
      if (!ctx?.executeRecaptcha) return RECAPTCHA_DISABLED_TOKEN;
      try {
        const token = await ctx.executeRecaptcha(action);
        return token || RECAPTCHA_DISABLED_TOKEN;
      } catch (e) {
        console.error('reCAPTCHA v3 execute failed', e);
        return RECAPTCHA_DISABLED_TOKEN;
      }
    },
    [ctx]
  );

  return { execute, isReady: !!ctx?.executeRecaptcha };
};
