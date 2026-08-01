
import React, { useState, useRef, useEffect } from 'react';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { emailService } from '@/services/emailClient';
import ReCaptcha from '@/components/ui/ReCaptcha';
import AuthCarousel from '@/components/auth/AuthCarousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Lock } from 'lucide-react';
import { supabase, setRememberMe } from '@/integrations/supabase/client';
import PasswordStrengthChecklist, { isPasswordStrong } from '@/components/ui/PasswordStrengthChecklist';
import { validateEmailFormat } from '@/lib/emailValidation';

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
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState('');
  const [pboCode, setPboCode] = useState('');
  const [sponsorCode, setSponsorCode] = useState('');
  const [sponsorCodeLocked, setSponsorCodeLocked] = useState(false);
  const [isRegisteringAsPBO, setIsRegisteringAsPBO] = useState(false);
  const [referralMessage, setReferralMessage] = useState('');
  const [referralEmailNotice, setReferralEmailNotice] = useState('');
  const [referralEmailSent, setReferralEmailSent] = useState<boolean | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [accountLockedOpen, setAccountLockedOpen] = useState(false);
  const [lockedReason, setLockedReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMeState] = useState(true);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<any>(null);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // `?next=/some/path` — used by the OAuth consent screen so a signed-out user
  // is returned to the authorization request instead of the dashboard.
  const nextParam = (() => {
    const raw = new URLSearchParams(location.search).get('next');
    return raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : null;
  })();


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');

    if (refCode) {
      setSponsorCode(refCode);
      setSponsorCodeLocked(true);
      setIsLogin(false);
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
    setAgreedToTerms(false);
    setRecaptchaToken(null);
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const verifyRecaptcha = async (token: string) => {
    // Sentinel emitted when no site key is configured — already a soft pass.
    if (token === 'recaptcha-disabled') return true;

    try {
      const { data, error } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token }
      });

      if (error) {
        // The verification *service* failed (e.g. RECAPTCHA_SECRET_KEY not
        // yet set as a Supabase secret) — that's a server configuration
        // issue, not evidence the user is a bot. Fail open so real users
        // can still sign up/in, rather than blocking account creation.
        console.warn('reCAPTCHA verification service unavailable, allowing submission:', error);
        return true;
      }

      // An explicit success:false from Google (bad/expired token) should
      // still block submission.
      return data?.success !== false;
    } catch (error) {
      console.warn('reCAPTCHA verification error, allowing submission:', error);
      return true;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // reCAPTCHA temporarily disabled — it was blocking real users from
    // signing in/up (see handleSignUp for the same change). To re-enable:
    // restore the `!recaptchaToken` guard below and the verifyRecaptcha()
    // call, and remove the `disabled={loading || ...}` override on the
    // buttons that dropped `!recaptchaToken`.
    // if (!recaptchaToken) {
    //   toast({
    //     title: "reCAPTCHA Required",
    //     description: "Please complete the reCAPTCHA verification",
    //     variant: "destructive"
    //   });
    //   return;
    // }

    setLoading(true);
    try {
      // reCAPTCHA verification disabled — see note above.
      // const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
      // if (!isRecaptchaValid) {
      //   toast({
      //     title: "reCAPTCHA Failed",
      //     description: "Please complete the reCAPTCHA verification again",
      //     variant: "destructive"
      //   });
      //   setRecaptchaToken(null);
      //   if (recaptchaRef.current) {
      //     recaptchaRef.current.reset();
      //   }
      //   return;
      // }

      // Realtors and Client login both just use email + password. The PBO/
      // Realtor code is only relevant at signup (to credit whoever referred
      // the new user) — requiring it again at every login was blocking
      // people who could otherwise sign in fine.
      setRememberMe(rememberMe);
      const signInResult = await signIn(email, password);
      
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
        // Check for a locked account before treating this as a successful
        // sign-in — an admin may have locked it, in which case we sign them
        // straight back out and show why, rather than letting them into a
        // dashboard they shouldn't have access to.
        const { data: { user: signedInUser } } = await supabase.auth.getUser();
        if (signedInUser) {
          const { data: lockCheck } = await supabase
            .from('profiles')
            .select('account_locked, account_locked_reason')
            .eq('id', signedInUser.id)
            .single();

          if (lockCheck?.account_locked) {
            await supabase.auth.signOut();
            setLockedReason(lockCheck.account_locked_reason || null);
            setAccountLockedOpen(true);
            setRecaptchaToken(null);
            if (recaptchaRef.current) recaptchaRef.current.reset();
            return;
          }
        }

        toast({
          title: "Login successful",
          description: "Welcome back!"
        });

        // Pages that pass their own pageTitle (e.g. the dedicated Bridgefort
        // Realtors login) already specify exactly where they want to land —
        // respect that. Otherwise (the shared /auth page with the Client /
        // Realtors Login toggle), route based on the account's actual type
        // rather than which tab happened to be selected, so a client never
        // lands on the BHRealtors dashboard and vice versa.
        if (pageTitle) {
          navigate(redirectAfterSignIn);
        } else {
          let destination = '/dashboard';
          try {
            const { data: { user: signedInUser } } = await supabase.auth.getUser();
            if (signedInUser) {
              const { data: profileRow } = await supabase
                .from('profiles')
                .select('is_pbo')
                .eq('id', signedInUser.id)
                .single();
              if (profileRow?.is_pbo) destination = '/bh-realtors';
            }
          } catch (lookupError) {
            console.warn('Could not determine account type after sign-in:', lookupError);
          }
          navigate(destination);
        }
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

    const emailCheck = validateEmailFormat(email);
    if (!emailCheck.valid) {
      setEmailTouched(true);
      toast({
        title: "Invalid email",
        description: emailCheck.message,
        variant: "destructive"
      });
      return;
    }

    if (!isPasswordStrong(password)) {
      toast({
        title: "Password too weak",
        description: "Your password needs an uppercase letter, a lowercase letter, a number, a special character, and more than 6 characters. Check the list under the password field.",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match"
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms & Privacy Policy",
        description: "Please read and accept the Terms of Service and Privacy Policy to continue.",
        variant: "destructive"
      });
      return;
    }

    // reCAPTCHA temporarily disabled — see the matching note in handleSignIn.
    // if (!recaptchaToken) {
    //   toast({
    //     title: "reCAPTCHA Required",
    //     description: "Please complete the reCAPTCHA verification",
    //     variant: "destructive"
    //   });
    //   return;
    // }

    setLoading(true);
    try {
      // reCAPTCHA verification disabled — see note in handleSignIn.
      // const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
      // if (!isRecaptchaValid) {
      //   toast({
      //     title: "reCAPTCHA Failed",
      //     description: "Please complete the reCAPTCHA verification again",
      //     variant: "destructive"
      //   });
      //   setRecaptchaToken(null);
      //   if (recaptchaRef.current) {
      //     recaptchaRef.current.reset();
      //   }
      //   return;
      // }

      setRememberMe(true);
      const { data, error } = await signUp(email, password, firstName, lastName);
      if (error) throw error;

      // Supabase can return a *truthy* user object with an empty
      // `identities` array when the email is already registered — this is
      // deliberate (it avoids leaking which emails exist), but the old code
      // had no check for it, so it fell straight into the "success" path
      // below and told people their brand-new account was created and to
      // check their email, when in fact nothing happened. That silent
      // failure is very likely a big part of "sign up doesn't work".
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        toast({
          title: "Account already exists",
          description: "An account with this email already exists. Please sign in instead, or reset your password if you've forgotten it.",
          variant: "destructive"
        });
        setRecaptchaToken(null);
        if (recaptchaRef.current) recaptchaRef.current.reset();
        return;
      }

      if (data.user) {
        const profileUpdate: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        if (isRegisteringAsPBO) {
          // Automatically generate a unique 5-digit PBO referral code for every PBO registration.
          const generateUniquePboCode = async () => {
            let attempts = 0;
            while (attempts < 10) {
              const candidate = String(Math.floor(10000 + Math.random() * 90000));
              const { data: existing } = await supabase
                .from('profiles')
                .select('id')
                .eq('pbo_referral_code', candidate)
                .limit(1)
                .maybeSingle();

              if (!existing) return candidate;
              attempts += 1;
            }
            return `P${String(Date.now()).slice(-5)}`;
          };

          const finalPbo = await generateUniquePboCode();

          const { data: existingPBO } = await supabase
            .from('profiles')
            .select('id')
            .eq('pbo_referral_code', finalPbo)
            .limit(1)
            .maybeSingle();

          if (existingPBO) {
            toast({
              title: 'PBO Code Already Used',
              description: 'Generated referral code collided. Please try again.',
              variant: 'destructive'
            });
            return;
          }

          profileUpdate.is_pbo = true;
          profileUpdate.pbo_referral_code = finalPbo;
          profileUpdate.current_package = 'associate';

          if (data.user?.email) {
            const referralLink = `${window.location.origin}/bridgefort-realtors-login?ref=${finalPbo}`;
            const emailResult = await emailService.sendEmail({
              to: data.user.email,
              name: `${firstName} ${lastName}`.trim() || 'BHRealtors Partner',
              subject: 'Your BHRealtors Referral Link',
              body: `Hello ${firstName || 'Partner'},\n\nYour BHRealtors referral code has been generated successfully:\n\n${finalPbo}\n\nUse the link below to invite new Realtors:\n${referralLink}\n\nThank you for joining BHRealtors!`,
              html: `<p>Hello ${firstName || 'Partner'},</p><p>Your BHRealtors referral code has been generated successfully:</p><p><strong>${finalPbo}</strong></p><p>Use the link below to invite new Realtors:</p><p><a href="${referralLink}">${referralLink}</a></p><p>Thank you for joining BHRealtors!</p>`,
            });

            if (emailResult.success) {
              toast({
                title: 'Referral link emailed',
                description: 'Your PBO referral link and code were sent to your email address.',
              });
              setReferralEmailNotice(`We emailed your referral link to ${data.user.email}`);
              setReferralEmailSent(true);
            } else {
              console.error('Failed to send PBO referral email:', emailResult.error);
              toast({
                title: 'Referral email failed',
                description: 'Your referral code was generated, but the email could not be delivered. Please check your email address or contact support.',
                variant: 'destructive',
              });
              setReferralEmailNotice('Referral code created but email delivery failed. Please contact support.');
              setReferralEmailSent(false);
            }
          }
        }

        if (sponsorCode.trim()) {
          const { data: sponsorProfile, error: sponsorError } = await supabase
            .from('profiles')
            .select('id')
            .eq('pbo_referral_code', sponsorCode.trim())
            .eq('is_pbo', true)
            .maybeSingle();

          // IMPORTANT: by this point `signUp()` has already created the real
          // auth account — there is no undoing that. The old code called
          // `return` here on an invalid code, which abandoned registration
          // entirely: the auth user existed but their profile was never
          // created, no success message was shown, and re-submitting the
          // same email would then fail as "already registered", leaving the
          // user completely stuck. A bad/mistyped sponsor code should never
          // be able to break account creation — just skip attaching a
          // sponsor and let them know, then continue.
          if (sponsorError || !sponsorProfile) {
            toast({
              title: "Referral code not found",
              description: "We couldn't find that referral code, so your account was created without a sponsor. You can add one later from your profile.",
              variant: "destructive"
            });
          } else {
            profileUpdate.referred_by_id = sponsorProfile.id;
            profileUpdate.referred_by_code = sponsorCode.trim();
          }
        }

        const { error: profileUpsertError } = await supabase
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

        if (profileUpsertError) {
          // The auth account already exists at this point regardless — but
          // silently swallowing this (as before) meant a failure here (e.g.
          // an unapplied migration, a bad column, an RLS denial) looked
          // identical to success: the user saw "Registration successful!"
          // while their profile — name, PBO status, referral link — was
          // never actually saved. Surface it instead so it's fixable rather
          // than invisible.
          console.error('Failed to save profile after signup:', profileUpsertError);
          toast({
            title: 'Account created, but profile setup failed',
            description:
              'Your login was created, but we could not save your profile details. Please contact support so we can fix this — your referral/PBO info may not have been saved.',
            variant: 'destructive'
          });
          navigate(redirectAfterSignUp);
          return;
        }

        toast({
          title: "Registration successful!",
          description: "Please check your email to verify your account."
        });
        navigate(redirectAfterSignUp);
      } else {
        // Belt-and-suspenders: signUp() returned no error but also no user.
        // Rather than silently doing nothing (which just looks like a
        // broken button to the person filling out the form), surface it.
        toast({
          title: "Registration failed",
          description: "We couldn't create your account. Please try again in a moment.",
          variant: "destructive"
        });
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
      ? (isPBO ? 'Realtors Login' : 'Client Login')
      : 'Create Account';

  return (
    <div className="lg:h-screen lg:overflow-hidden flex flex-col lg:grid lg:grid-cols-2">
      {/* Form column — scrolls internally on short viewports so every field,
          the reCAPTCHA checkbox, and the submit button always stay reachable
          no matter how long the form or how short the screen. */}
      <div className="relative flex flex-col lg:h-screen lg:overflow-y-auto">
        <div className="bg-estate-blue py-3 px-4 sm:px-6 flex items-center justify-between shrink-0 relative z-10">
          <h1 className="text-lg sm:text-xl font-bold text-white truncate">{resolvedTitle}</h1>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="bg-white/10 text-white border-white/30 hover:bg-white/20 shrink-0"
            onClick={() => navigate('/home')}
          >
            Cancel
          </Button>
        </div>

        <div className="relative flex-1 flex flex-col">
          {/* Mobile: full-bleed background image behind the glass form card */}
          <div
            className="absolute inset-0 lg:hidden bg-cover bg-center"
            style={{ backgroundImage: "url('/lovable-uploads/5k-daily-family-hero.jpg')" }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 lg:hidden bg-black/55" aria-hidden="true" />

          <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
            <div className="w-full max-w-md mx-auto bg-white/75 backdrop-blur-xl lg:backdrop-blur-none lg:bg-transparent border border-white/40 lg:border-0 rounded-2xl lg:rounded-none shadow-[0_8px_40px_rgba(0,0,0,0.45)] lg:shadow-none p-6 sm:p-8 lg:p-0">
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
                Realtors Login
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
                onBlur={() => setEmailTouched(true)}
                required
                aria-invalid={!isLogin && emailTouched && email.length > 0 && !validateEmailFormat(email).valid}
              />
              {!isLogin && emailTouched && email.length > 0 && !validateEmailFormat(email).valid && (
                <p className="text-xs text-destructive mt-1">{validateEmailFormat(email).message}</p>
              )}
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
              {!isLogin && password.length > 0 && (
                <PasswordStrengthChecklist password={password} />
              )}
            </div>
            {isLogin && (
              <div className="flex items-center gap-2">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMeState(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-estate-blue focus:ring-estate-blue"
                />
                <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
                  Remember me on this device
                </Label>
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
                <p className="text-xs text-gray-500 mt-1">
                  {isRegisteringAsPBO
                    ? 'Your personal PBO referral code and signup link will be generated automatically.'
                    : 'If you were referred by a PBO, enter their code here.'}
                </p>

                <div>
                  <Label htmlFor="sponsorCode" className="flex items-center gap-1.5">
                    Referral Code (Optional)
                    {sponsorCodeLocked && <Lock className="h-3 w-3 text-slate-400" />}
                  </Label>
                  <Input
                    type="text"
                    id="sponsorCode"
                    placeholder="Enter the referral code you received"
                    value={sponsorCode}
                    onChange={(e) => setSponsorCode(e.target.value)}
                    readOnly={sponsorCodeLocked}
                    className={sponsorCodeLocked ? 'bg-muted cursor-not-allowed' : undefined}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {sponsorCodeLocked
                      ? "This code came from your referral link and can't be changed here."
                      : 'If you have a sponsoring PBO, enter their code so they receive credit for your signup.'}
                  </p>
                  {referralMessage && <p className="text-xs text-emerald-600 mt-1">{referralMessage}</p>}
                  {referralEmailSent !== null && (
                    <div className={`mt-2 p-3 rounded-md text-sm ${referralEmailSent ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'}`}>
                      {referralEmailNotice || (referralEmailSent ? `Referral link emailed to ${email}` : 'Referral code created but email failed.')}
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3 pt-1">
                  <input
                    id="agreedToTerms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    required
                    className="h-4 w-4 mt-0.5 rounded border-gray-300 text-estate-blue focus:ring-estate-blue"
                  />
                  <Label htmlFor="agreedToTerms" className="font-normal leading-snug">
                    I have read and agree to the{' '}
                    <Link to="/terms-of-service" target="_blank" className="text-estate-blue hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy-policy" target="_blank" className="text-estate-blue hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </>
            )}
            
            {/* reCAPTCHA temporarily disabled — it was blocking real users
                from completing signup/login. To re-enable: uncomment this
                block and restore `!recaptchaToken` in the Button's disabled
                condition below. */}
            {/* <div className="flex justify-center">
              <ReCaptcha
                ref={recaptchaRef}
                onChange={(token) => setRecaptchaToken(token)}
                onExpired={() => setRecaptchaToken(null)}
                onError={() => setRecaptchaToken(null)}
              />
            </div> */}

            <Button 
              type="submit" 
              disabled={loading || (!isLogin && !agreedToTerms)} 
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
        </div>

        {/* Copyright + company name, pinned bottom-left of the form column */}
        <div className="shrink-0 px-4 sm:px-6 py-4 text-xs text-slate-500 relative z-10">
          © {new Date().getFullYear()} Bridgefort Homes Development Ltd. All rights reserved.
        </div>
      </div>

      {/* Desktop: promotional carousel — full device height, half width,
          flush with the top of the viewport, staying pinned in place while
          the form column scrolls beside it. */}
      <div className="hidden lg:block lg:h-screen lg:sticky lg:top-0">
        <AuthCarousel rounded={false} />
      </div>

      <Dialog open={accountLockedOpen} onOpenChange={setAccountLockedOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <Lock className="h-7 w-7 text-red-600" />
            </div>
            <DialogTitle className="text-center text-red-700">Account Locked</DialogTitle>
            <DialogDescription className="text-center">
              {lockedReason || 'Your account has been locked.'} Contact Support at{' '}
              <a href="mailto:support@bridgeforthomes.com" className="text-estate-blue underline">
                support@bridgeforthomes.com
              </a>{' '}
              for assistance on how to unlock your account.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Auth;
