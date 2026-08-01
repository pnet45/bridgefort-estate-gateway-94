import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let settled = false;

    const redirectAfterSession = async (userId: string, email?: string | null) => {
      if (settled) return;
      settled = true;

      // Client vs Realtor: same distinction used across the rest of the app.
      // Honour a consent/return path preserved before the provider round-trip.
      const preservedNext = sessionStorage.getItem('bf-post-auth-next');
      sessionStorage.removeItem('bf-post-auth-next');
      if (preservedNext && preservedNext.startsWith('/') && !preservedNext.startsWith('//')) {
        toast({ title: 'Welcome!', description: email ? `Signed in as ${email}` : 'Signed in successfully' });
        navigate(preservedNext, { replace: true });
        return;
      }

      let destination = '/dashboard';
      try {
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('is_pbo')
          .eq('id', userId)
          .single();
        if (profileRow?.is_pbo) destination = '/bh-realtors';
      } catch (e) {
        // If the profile lookup fails for any reason, fall back to the
        // regular client dashboard rather than blocking sign-in entirely.
        console.warn('Could not determine account type after sign-in:', e);
      }

      toast({ title: 'Welcome!', description: email ? `Signed in as ${email}` : 'Signed in successfully' });
      navigate(destination, { replace: true });
    };

    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);

      // Explicit OAuth errors from the provider (access denied, etc).
      const errorParam = hashParams.get('error') || queryParams.get('error');
      const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
      if (errorParam) {
        const msg = decodeURIComponent(errorDescription || errorParam);
        setError(msg);
        toast({ title: 'Sign-in failed', description: msg, variant: 'destructive' });
        setTimeout(() => navigate('/auth'), 3000);
        return;
      }

      // IMPORTANT: the Supabase client is configured with
      // `detectSessionInUrl: true`, which means it automatically exchanges
      // the `?code=...` in this URL for a session as soon as it initializes
      // — that happens the moment this page's JS bundle loads, before this
      // effect even runs. A PKCE code + verifier pair is single-use, so
      // manually calling `exchangeCodeForSession(code)` again here was
      // racing against that automatic exchange: whichever one ran first
      // consumed the verifier and succeeded, while the other reliably failed
      // with "PKCE code verifier not found in storage" — which is exactly
      // the error users were seeing, even though they were, in fact,
      // already signed in by the winning attempt. We no longer call
      // exchangeCodeForSession here at all; we just wait for the session
      // the automatic exchange produces.
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          redirectAfterSession(session.user.id, session.user.email);
        }
      });

      // In case the automatic exchange already completed before this effect
      // attached the listener above.
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession) {
        await redirectAfterSession(existingSession.user.id, existingSession.user.email);
      }

      // Give the automatic exchange a reasonable window to finish before
      // giving up — covers slow networks without hanging forever.
      window.setTimeout(() => {
        if (!settled) {
          settled = true;
          const msg = 'Could not establish session. Please try signing in again.';
          setError(msg);
          toast({ title: 'Sign-in failed', description: msg, variant: 'destructive' });
          setTimeout(() => navigate('/auth'), 3000);
        }
      }, 8000);

      return () => subscription.unsubscribe();
    };

    let cleanup: (() => void) | undefined;
    handleAuthCallback().then((fn) => { cleanup = fn; });
    return () => cleanup?.();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-sm px-4">
        {error ? (
          <>
            <h1 className="text-2xl font-bold mb-3 text-foreground">Sign-in failed</h1>
            <p className="text-destructive mb-2">{error}</p>
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 mx-auto text-estate-blue animate-spin mb-4" />
            <h1 className="text-xl font-semibold text-foreground">Completing sign-in...</h1>
            <p className="text-sm text-muted-foreground mt-2">Please wait</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
