
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);

        // Check for OAuth errors first
        const errorParam = hashParams.get('error') || queryParams.get('error');
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');

        if (errorParam) {
          const msg = decodeURIComponent(errorDescription || errorParam);
          setError(msg);
          toast({ title: "Sign-in failed", description: msg, variant: "destructive" });
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        // PKCE flow: Google returns ?code=... which must be exchanged for a session
        const code = queryParams.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setError(exchangeError.message);
            toast({ title: "Sign-in failed", description: exchangeError.message, variant: "destructive" });
            setTimeout(() => navigate('/auth'), 3000);
            return;
          }
        }

        // Implicit flow fallback: tokens come back in the URL hash
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        if (accessToken && refreshToken) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (setSessionError) {
            setError(setSessionError.message);
            toast({ title: "Sign-in failed", description: setSessionError.message, variant: "destructive" });
            setTimeout(() => navigate('/auth'), 3000);
            return;
          }
        }

        // Verify a valid session was actually established
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          const msg = 'Could not establish session. Please try again.';
          setError(msg);
          toast({ title: "Sign-in failed", description: msg, variant: "destructive" });
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        // Success
        toast({ title: "Welcome!", description: `Signed in as ${session.user.email}` });
        navigate('/dashboard');

      } catch (err: any) {
        const msg = err?.message || 'Unexpected error during sign-in';
        setError(msg);
        toast({ title: "Error", description: msg, variant: "destructive" });
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handleAuthCallback();
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
