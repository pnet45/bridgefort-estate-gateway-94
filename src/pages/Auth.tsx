
import React, { useState, useRef, useEffect } from 'react';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import ReCaptcha from '@/components/ui/ReCaptcha';
import AuthCarousel from '@/components/auth/AuthCarousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Lock } from 'lucide-react';
import { supabase, setRememberMe } from '@/integrations/supabase/client';
import PasswordStrengthChecklist, { isPasswordStrong } from '@/components/ui/PasswordStrengthChecklist';
import { validateEmailFormat } from '@/lib/emailValidation';
import { captureEvent, captureException, identifyUser } from '@/lib/posthog';

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
  const [bmcReferralCode, setBmcReferralCode] = useState('');
  const [sponsorCodeLocked, setSponsorCodeLocked] = useState(false);
  const [isRegisteringAsPBO, setIsRegisteringAsPBO] = useState(false);
  const [referralMessage, setReferralMessage] = useState('');
  const [referralEmailNotice, setReferralEmailNotice] = useState('');
  const [referralEmailSent, setReferralEmailSent] = useState<boolean | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToBmcAgreement, setAgreedToBmcAgreement] = useState(false);
  const [acknowledgedBmcPrivacy, setAcknowledgedBmcPrivacy] = useState(false);
  const [bmcMarketingConsent, setBmcMarketingConsent] = useState(false);
  const [selectedBmcDivisions, setSelectedBmcDivisions] = useState<string[]>([]);
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
    const refCode = params.get('ref')?.trim().toUpperCase();
    const divisionReferralCode = params.get('bmc_ref')?.trim().toUpperCase();

    if (divisionReferralCode) {
      setBmcReferralCode(divisionReferralCode);
      setSponsorCode('');
      setSponsorCodeLocked(false);
      setIsLogin(false);
      setReferralMessage('A unified BMC referral link was detected. Its attribution will be recorded across the relevant Bridgefort business.');
    }

    if (refCode && !divisionReferralCode) {
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
    setAgreedToBmcAgreement(false);
    setAcknowledgedBmcPrivacy(false);
    setBmcMarketingConsent(false);
    setSelectedBmcDivisions([]);
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

        if (signedInUser) {
          identifyUser(signedInUser.id, { email: signedInUser.email });
          captureEvent('user_signed_in', {
            account_type: isPBO ? 'realtor' : 'client',
            auth_method: 'password',
          });
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
        if (nextParam) {
          navigate(nextParam);
        } else if (pageTitle) {
          if (redirectAfterSignIn === '/bh-realtors') {
            const { data: partnerProfile } = await supabase
              .from('profiles')
              .select('is_pbo')
              .eq('id', signedInUser?.id || '')
              .maybeSingle();
            navigate(partnerProfile?.is_pbo ? '/bh-realtors' : '/bmc-partner-hub');
          } else {
            navigate(redirectAfterSignIn);
          }
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
      captureException(error, { workflow: 'sign_in' });
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

    if (isRegisteringAsPBO && selectedBmcDivisions.length === 0) {
      toast({ title: 'Select a business division', description: 'Choose at least one Bridgefort division for your BMC application.', variant: 'destructive' });
      return;
    }

    if (isRegisteringAsPBO && (!agreedToBmcAgreement || !acknowledgedBmcPrivacy)) {
      toast({ title: 'BMC Partner Agreement required', description: 'Please accept the BMC Partner Agreement and acknowledge the separate BMC Privacy Notice to continue.', variant: 'destructive' });
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
      const normalizedSponsorCode = (isRegisteringAsPBO && !sponsorCodeLocked) ? '' : sponsorCode.trim().toUpperCase();
      // Persist the captured code in auth metadata as a recovery path when
      // email confirmation means signup has no authenticated session yet.
      const signupMetadata = {
        ...(isRegisteringAsPBO ? {
          bmc_agreement_accepted: true,
          bmc_agreement_version: '1.0',
          bmc_agreement_accepted_at: new Date().toISOString(),
          bmc_agreement_name: 'Bridgefort Multi-Business Consultants Partner Agreement',
          bmc_privacy_acknowledged: acknowledgedBmcPrivacy,
          bmc_privacy_notice_version: '1.0',
          bmc_marketing_consent: bmcMarketingConsent,
          bmc_selected_divisions: selectedBmcDivisions,
        } : {}),
        ...(bmcReferralCode ? { bmc_referral_code: bmcReferralCode } : {}),
      };
      const { data, error } = await signUp(email, password, firstName, lastName, normalizedSponsorCode || undefined, sponsorCodeLocked, Object.keys(signupMetadata).length ? signupMetadata : undefined);
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
          ...(isRegisteringAsPBO ? { terms_accepted: true } : {}),
        };

        if (isRegisteringAsPBO) {
          // BMC division referral codes are generated by the database only
          // after each selected division has been formally approved. The
          // legacy BH-Realtors referral identity is never assigned here.
        }

        if (normalizedSponsorCode) {
          profileUpdate.referred_by_code = normalizedSponsorCode;
          const { data: { session: signupSession } } = await supabase.auth.getSession();
          if (signupSession) {
            const { data: sponsorMatch, error: sponsorLookupError } = await supabase.rpc(
              'lookup_bhrealtor_referral' as any,
              { _code: normalizedSponsorCode },
            );
            const match = Array.isArray(sponsorMatch) ? sponsorMatch[0] : sponsorMatch;
            if (sponsorLookupError) {
              console.warn('Referral attribution will be completed from the saved signup code after verification:', sponsorLookupError);
            } else if (match?.realtor_id) {
              profileUpdate.referred_by_id = String(match.realtor_id);
            } else {
              toast({
                title: 'Referral code could not be verified',
                description: 'Your account can still be created. The referral code will remain available in your profile for verification.',
                variant: 'destructive',
              });
            }
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
          navigate(nextParam ?? redirectAfterSignUp);
          return;
        }

        identifyUser(data.user.id, {
          email: data.user.email,
          name: `${firstName} ${lastName}`.trim() || undefined,
          role: isRegisteringAsPBO ? 'bmc_applicant' : 'client',
        });
        captureEvent('user_signed_up', {
          account_type: isRegisteringAsPBO ? 'realtor' : 'client',
          has_sponsor: Boolean(sponsorCode.trim()),
          auth_method: 'password',
        });

        toast({
          title: isRegisteringAsPBO ? "BMC application received" : "Registration successful!",
          description: isRegisteringAsPBO
            ? "Please verify your email. Your selected divisions will remain pending until Bridgefort completes its review."
            : "Please check your email to verify your account."
        });
        navigate(nextParam ?? (isRegisteringAsPBO ? '/bmc-partner-hub' : redirectAfterSignUp));
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
      captureException(error, { workflow: 'sign_up' });
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
      ? (isPBO ? 'BMC Login' : 'Sign In')
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
            Home
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
            <>
              <div className="mb-5 rounded-xl border border-amber-400/50 bg-amber-50/90 dark:bg-amber-950/30 p-4 text-center shadow-sm">
                <p className="text-sm sm:text-base font-extrabold tracking-wide text-estate-blue dark:text-amber-200">
                  DO YOU WANT TO BE A PART OF OUR NETWORK AND MAKE MONEY?
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                  If YES, then SIGN UP.
                </p>
                <Button
                  type="button"
                  onClick={toggleAuthMode}
                  className="mt-3 w-full min-h-12 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-base shadow-md"
                >
                  SIGN UP
                </Button>
              </div>
              <div className="mb-5 flex justify-end">
                <Button
                  type="button"
                  variant={isPBO ? "default" : "outline"}
                  onClick={() => setIsPBO(true)}
                  className="min-w-32"
                >
                  BMC Login
                </Button>
              </div>
            </>
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
                    onChange={(e) => { setIsRegisteringAsPBO(e.target.checked); if (!e.target.checked) { setAgreedToBmcAgreement(false); setAcknowledgedBmcPrivacy(false); setBmcMarketingConsent(false); setSelectedBmcDivisions([]); } }}
                    className="h-4 w-4 rounded border-gray-300 text-estate-blue focus:ring-estate-blue"
                  />
                  <Label htmlFor="registerAsPBO">Join BMC – Bridgefort Multi-Business Consultants</Label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {isRegisteringAsPBO
                    ? 'BMC partners use one central referral code across Bridgefort Homes, Travels and Agrovest. Existing BH-Realtors codes remain valid for legacy referrals.'
                    : 'If a Bridgefort Homes BMC partner referred you, use their Homes referral link so attribution is captured separately from BH-Realtors membership.'}
                </p>

                {!isRegisteringAsPBO && <div>
                  <Label htmlFor="sponsorCode" className="flex items-center gap-1.5">
                    Legacy BH-Realtors Referral Code (Optional)
                    {sponsorCodeLocked && <Lock className="h-3 w-3 text-slate-400" />}
                  </Label>
                  <Input
                    type="text"
                    id="sponsorCode"
                    placeholder="Enter an existing BH-Realtors referral code"
                    value={sponsorCode}
                    onChange={(e) => setSponsorCode(e.target.value)}
                    readOnly={sponsorCodeLocked}
                    className={sponsorCodeLocked ? 'bg-muted cursor-not-allowed' : undefined}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {sponsorCodeLocked
                      ? "This legacy code came from your referral link and can't be changed here."
                      : 'Existing BH-Realtors referral codes remain valid for legacy attribution. New partner registrations use BMC referral codes.'}
                  </p>
                  {referralMessage && <p className="text-xs text-emerald-600 mt-1">{referralMessage}</p>}
                  {referralEmailSent !== null && (
                    <div className={`mt-2 p-3 rounded-md text-sm ${referralEmailSent ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'}`}>
                      {referralEmailNotice || (referralEmailSent ? `Referral link emailed to ${email}` : 'Referral code created but email failed.')}
                    </div>
                  )}
                </div>}
                {isRegisteringAsPBO && <div>
                  <Label htmlFor="bmcReferralCode">BMC Referral Code (Optional)</Label>
                  <Input id="bmcReferralCode" value={bmcReferralCode} onChange={event => setBmcReferralCode(event.target.value.toUpperCase())} placeholder="Enter the referring BMC code" readOnly={new URLSearchParams(location.search).has('bmc_ref')} />
                  <p className="mt-1 text-xs text-gray-500">One BMC referral code works across Bridgefort Homes, Travels and Agrovest. Referrals are recorded immediately; commission eligibility remains subject to the relevant division's approval.</p>
                </div>}

                {isRegisteringAsPBO && (
                  <fieldset className="rounded-lg border border-border p-3 space-y-3">
                    <legend className="px-1 text-sm font-semibold text-foreground">Choose your business divisions</legend>
                    <p className="text-xs text-muted-foreground">Select one or more areas you wish to apply for. Each division has its own verification and approval process; selecting a division does not activate partner status.</p>
                    {[
                      { value: 'homes', label: 'Bridgefort Homes', detail: 'Real estate and property services' },
                      { value: 'travels', label: 'Bridgefort Travels', detail: 'Travel, flights, accommodation and tours' },
                      { value: 'agrovest', label: 'Bridgefort Agrovest', detail: 'Agriculture and agribusiness' },
                    ].map((division) => (
                      <label key={division.value} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBmcDivisions.includes(division.value)}
                          onChange={(e) => setSelectedBmcDivisions((current) => e.target.checked ? [...current, division.value] : current.filter((value) => value !== division.value))}
                          className="h-4 w-4 mt-0.5 rounded border-gray-300 text-estate-blue focus:ring-estate-blue"
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-foreground">{division.label}</span>
                          <span className="block text-xs text-muted-foreground">{division.detail}</span>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                )}
                {isRegisteringAsPBO && (
                <div className="flex items-start gap-3 pt-1 rounded-lg border border-estate-blue/20 bg-estate-blue/5 p-3">
                  <input id="agreedToBmcAgreement" type="checkbox" checked={agreedToBmcAgreement} onChange={(e) => setAgreedToBmcAgreement(e.target.checked)} required className="h-4 w-4 mt-0.5 rounded border-gray-300 text-estate-blue focus:ring-estate-blue" />
                  <Label htmlFor="agreedToBmcAgreement" className="font-normal leading-snug">
                    I have read and agree to the website{' '}
                    <Link to="/bmc-partner-agreement" target="_blank" className="text-estate-blue hover:underline font-semibold">BMC Partner Agreement and Terms of Engagement</Link>.
                    {' '}I understand that BMC status is subject to verification and formal Company approval.
                  </Label>
                </div>
              )}
              {isRegisteringAsPBO && (
                <div className="flex items-start gap-3 pt-1">
                  <input id="acknowledgedBmcPrivacy" type="checkbox" checked={acknowledgedBmcPrivacy} onChange={(e) => setAcknowledgedBmcPrivacy(e.target.checked)} required className="h-4 w-4 mt-0.5 rounded border-gray-300 text-estate-blue focus:ring-estate-blue" />
                  <Label htmlFor="acknowledgedBmcPrivacy" className="font-normal leading-snug">I acknowledge that I have read the separate <Link to="/bmc-privacy-notice" target="_blank" className="text-estate-blue hover:underline font-semibold">BMC Privacy Notice</Link>, which applies to my BMC application and partner relationship, not the general client Privacy Policy.</Label>
                </div>
              )}
              {isRegisteringAsPBO && (
                <div className="flex items-start gap-3 pt-1">
                  <input id="bmcMarketingConsent" type="checkbox" checked={bmcMarketingConsent} onChange={(e) => setBmcMarketingConsent(e.target.checked)} className="h-4 w-4 mt-0.5 rounded border-gray-300 text-estate-blue focus:ring-estate-blue" />
                  <Label htmlFor="bmcMarketingConsent" className="font-normal leading-snug text-sm">I would like to receive optional Bridgefort news, offers and marketing communications. I can withdraw this consent later.</Label>
                </div>
              )}
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
              disabled={loading || (!isLogin && (!agreedToTerms || (isRegisteringAsPBO && (selectedBmcDivisions.length === 0 || !agreedToBmcAgreement || !acknowledgedBmcPrivacy))))} 
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
                  if (nextParam) sessionStorage.setItem('bf-post-auth-next', nextParam);
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
