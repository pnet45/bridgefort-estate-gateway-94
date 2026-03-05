
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
        // Handle the OAuth code exchange from the URL hash/query params
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        const errorParam = hashParams.get('error') || queryParams.get('error');
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');

        if (errorParam) {
          console.error('OAuth error:', errorParam, errorDescription);
          setError(errorDescription || errorParam);
          toast({
            title: "Sign-in failed",
            description: errorDescription || "An error occurred during sign-in",
            variant: "destructive"
          });
          setTimeout(() => navigate('/auth'), 2000);
          return;
        }

        // Exchange the code for a session if present
        const code = queryParams.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            setError(exchangeError.message);
            toast({
              title: "Sign-in failed",
              description: exchangeError.message,
              variant: "destructive"
            });
            setTimeout(() => navigate('/auth'), 2000);
            return;
          }
        }

        // Verify we have a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error('Session error:', sessionError);
          setError('Could not establish session');
          toast({
            title: "Sign-in failed",
            description: "Could not complete authentication. Please try again.",
            variant: "destructive"
          });
          setTimeout(() => navigate('/auth'), 2000);
          return;
        }

        toast({
          title: "Welcome!",
          description: "You have been signed in successfully."
        });
        navigate('/dashboard');
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message);
        setTimeout(() => navigate('/auth'), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          {error ? 'Sign-in failed' : 'Completing sign-in...'}
        </h1>
        {error ? (
          <p className="text-red-500 mb-2">{error}</p>
        ) : (
          <Loader2 className="w-16 h-16 mx-auto text-estate-blue animate-spin" />
        )}
        {error && <p className="text-sm text-muted-foreground">Redirecting to login...</p>}
      </div>
    </div>
  );
};

export default AuthCallback;
