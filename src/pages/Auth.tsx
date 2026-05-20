
import React, { useState, useRef, useEffect } from 'react';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import ReCaptcha from '@/components/ui/ReCaptcha';
import { supabase } from '@/integrations/supabase/client';

type AuthProps = {
  pageTitle?: string;
  redirectAfterSignIn?: string;
  redirectAfterSignUp?: string;
};

const Auth = ({
  pageTitle,
  redirectAfterSignIn = '/dashboard',
  redirectAfterSignUp = '/profile',
}: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isPBO, setIsPBO] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pboCode, setPboCode] = useState('');
  const [sponsorCode, setSponsorCode] = useState('');
  const [isRegisteringAsPBO, setIsRegisteringAsPBO] = useState(false);
  const [referralMessage, setReferralMessage] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<any>(null);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');

    if (refCode) {
      setSponsorCode(refCode);
      setReferralMessage('Referral code loaded from link. It will be applied on signup.');
    }
  }, [location.search]);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setPboCode('');
    setFirstName('');
    setLastName('');
    setConfirmPassword('');
    setRecaptchaToken(null);
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const verifyRecaptcha = async (token: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token }
      });
      
      if (error) throw error;
      return data.success;
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recaptchaToken) {
      toast({
        title: "reCAPTCHA Required",
        description: "Please complete the reCAPTCHA verification",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Verify reCAPTCHA first
      const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
      if (!isRecaptchaValid) {
        toast({
          title: "reCAPTCHA Failed",
          description: "Please complete the reCAPTCHA verification again",
          variant: "destructive"
        });
        setRecaptchaToken(null);
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        return;
      }

      // Handle PBO login
      let signInResult;
      if (isPBO) {
        // Validate PBO code before attempting login
        if (!pboCode.trim()) {
          toast({
            title: "PBO Code Required",
            description: "Please enter your PBO referral code",
            variant: "destructive"
          });
          return;
        }
        
        // Check if PBO code exists in database
        const { data: pboProfile, error: pboError } = await supabase
          .from('profiles')
          .select('id, is_pbo')
          .eq('pbo_referral_code', pboCode.trim())
          .eq('is_pbo', true)
          .single();
          
        if (pboError || !pboProfile) {
          toast({
            title: "Invalid PBO Code",
            description: "The PBO referral code provided is not valid",
            variant: "destructive"
          });
          return;
        }
        
        signInResult = await signIn(email, password);
      } else {
        signInResult = await signIn(email, password);
      }
      
      if (signInResult.error) {
        toast({
          title: "Login failed",
          description: signInResult.error.message,
          variant: "destructive"
        });
        // Reset reCAPTCHA on error
        setRecaptchaToken(null);
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
      } else {
        toast({
          title: "Login successful",
          description: "Welcome back!"
        });
        navigate(redirectAfterSignIn);
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      // Reset reCAPTCHA on error
      setRecaptchaToken(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match"
      });
      return;
    }

    if (!recaptchaToken) {
      toast({
        title: "reCAPTCHA Required",
        description: "Please complete the reCAPTCHA verification",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Verify reCAPTCHA first
      const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
      if (!isRecaptchaValid) {
        toast({
          title: "reCAPTCHA Failed",
          description: "Please complete the reCAPTCHA verification again",
          variant: "destructive"
        });
        setRecaptchaToken(null);
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        return;
      }

      const { data, error } = await signUp(email, password, firstName, lastName);
      if (error) throw error;
      
      if (data.user) {
        const profileUpdate: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        if (isRegisteringAsPBO) {
          if (!pboCode.trim()) {
            toast({
              title: "PBO Code Required",
              description: "Please enter a unique PBO referral code to complete registration.",
              variant: "destructive"
            });
            return;
          }

          const { data: existingPBO, error: pboError } = await supabase
            .from('profiles')
            .select('id')
            .eq('pbo_referral_code', pboCode.trim())
            .single();

          if (pboError && pboError.code !== 'PGRST116') {
            throw pboError;
          }

          if (existingPBO) {
            toast({
              title: "PBO Code Already Used",
              description: "This PBO referral code has already been used by another PBO. Please choose a different code.",
              variant: "destructive"
            });
            return;
          }

          profileUpdate.is_pbo = true;
          profileUpdate.pbo_referral_code = pboCode.trim();
        } else if (sponsorCode.trim()) {
          const { data: sponsorProfile, error: sponsorError } = await supabase
            .from('profiles')
            .select('id')
            .eq('pbo_referral_code', sponsorCode.trim())
            .eq('is_pbo', true)
            .single();

          if (sponsorError || !sponsorProfile) {
            toast({
              title: "Invalid referral code",
              description: "The referral code provided is not valid. Please check and try again.",
              variant: "destructive"
            });
            return;
          }

          profileUpdate.referred_by_id = sponsorProfile.id;
          profileUpdate.referred_by_code = sponsorCode.trim();
        }

        await supabase
          .from('profiles')
          .upsert(
            {
              id: data.user.id,
              first_name: firstName,
              last_name: lastName,
              created_at: new Date().toISOString(),
              ...profileUpdate
            },
            { onConflict: 'id' }
          );

        toast({
          title: "Registration successful!",
          description: "Please check your email to verify your account."
        });
        navigate(redirectAfterSignUp);
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast({
          title: "Registration failed",
          description: "Email is already in use.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive"
        });
      }
      // Reset reCAPTCHA on error
      setRecaptchaToken(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    } finally {
      setLoading(false);
    }
  };

  const resolvedTitle = pageTitle
    ? `${pageTitle} ${isLogin ? 'Sign In' : 'Register'}`
    : isLogin
      ? (isPBO ? 'PBO Login' : 'Client Login')
      : 'Create Account';

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-estate-blue py-4 text-center text-white">
        <h1 className="text-2xl font-bold">{resolvedTitle}</h1>
      </div>
      
      {/* Go Back Home button: aligned to left, directly under header */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mt-4 mb-2 flex justify-start">
        <Button
          type="button"
          variant="outline"
          className=""
          onClick={() => navigate('/home')}
        >
          Cancel / Go Back Home
        </Button>
      </div>

      <div className="container-custom py-12 flex-grow">
        <div className="max-w-md mx-auto">
          {isLogin && (
            <div className="mb-6 flex gap-2">
              <Button
                type="button"
                variant={!isPBO ? "default" : "outline"}
                onClick={() => setIsPBO(false)}
                className="flex-1"
              >
                Client Login
              </Button>
              <Button
                type="button"
                variant={isPBO ? "default" : "outline"}
                onClick={() => setIsPBO(true)}
                className="flex-1"
              >
                PBO Login
              </Button>
            </div>
          )}
          <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-6">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    type="text"
                    id="firstName"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    type="text"
                    id="lastName"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {isLogin && isPBO && (
              <div>
                <Label htmlFor="pboCode">PBO Referral Code</Label>
                <Input
                  type="text"
                  id="pboCode"
                  placeholder="Enter your PBO referral code"
                  value={pboCode}
                  onChange={(e) => setPboCode(e.target.value)}
                  required
                />
              </div>
            )}
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="registerAsPBO"
                    type="checkbox"
                    checked={isRegisteringAsPBO}
                    onChange={(e) => setIsRegisteringAsPBO(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-estate-blue focus:ring-estate-blue"
                  />
                  <Label htmlFor="registerAsPBO">Register as a PBO</Label>
                </div>

                {isRegisteringAsPBO ? (
                  <div>
                    <Label htmlFor="pboReferralCode">Create Your PBO Referral Code</Label>
                    <Input
                      type="text"
                      id="pboReferralCode"
                      placeholder="Enter a unique PBO code"
                      value={pboCode}
                      onChange={(e) => setPboCode(e.target.value)}
                      required={isRegisteringAsPBO}
                    />
                    <p className="text-xs text-gray-500 mt-1">This code will become your personal referral link identifier.</p>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="sponsorCode">Referral Code (Optional)</Label>
                    <Input
                      type="text"
                      id="sponsorCode"
                      placeholder="Enter the referral code you received"
                      value={sponsorCode}
                      onChange={(e) => setSponsorCode(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">If you were referred by a PBO, enter their code here.</p>
                    {referralMessage && <p className="text-xs text-emerald-600 mt-1">{referralMessage}</p>}
                  </div>
                )}
              </>
            )}
            
            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCaptcha
                ref={recaptchaRef}
                onChange={(token) => setRecaptchaToken(token)}
                onExpired={() => setRecaptchaToken(null)}
                onError={() => setRecaptchaToken(null)}
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading || !recaptchaToken} 
              className="w-full bg-estate-blue hover:bg-estate-darkBlue"
            >
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </Button>

            {/* Google Sign-In */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                setLoading(true);
                try {
                  const { error } = await signInWithGoogle();
                  if (error) {
                    toast({
                      title: "Google Sign-In Error",
                      description: error.message || "Failed to sign in with Google",
                      variant: "destructive"
                    });
                  }
                } catch (error: any) {
                  toast({
                    title: "Error",
                    description: error.message || "An unexpected error occurred",
                    variant: "destructive"
                  });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </form>
          <div className="mt-4 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-sm text-estate-blue hover:underline"
            >
              {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
            </button>
            {/* Removed Go Back Home button here */}
          </div>
          {isLogin && (
            <div className="mt-4 text-center">
              <Link to="/auth/otp-reset" className="text-sm text-gray-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <Toaster />
    </div>
  );
};

export default Auth;
