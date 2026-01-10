
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import ReCaptcha from '@/components/ui/ReCaptcha';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Lock, ArrowLeft, AlertTriangle, Check, X, UserPlus } from 'lucide-react';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Password validation schema
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

interface PasswordStrength {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

const AdminAuth = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [showPasswordHints, setShowPasswordHints] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<any>(null);
  const { signIn, user, userRole } = useAuth();
  const navigate = useNavigate();

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Redirect if already logged in as admin
  useEffect(() => {
    if (user && userRole === 'admin') {
      navigate('/admin-console');
    }
  }, [user, userRole, navigate]);

  // Update password strength indicators
  useEffect(() => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    });
  }, [password]);

  // Check lockout status when email changes
  useEffect(() => {
    const checkLockout = async () => {
      if (!email || !email.includes('@')) return;
      
      try {
        const { data, error } = await supabase.rpc('is_account_locked', {
          check_email: email.toLowerCase().trim(),
          max_attempts: 5,
          lockout_minutes: 15
        });
        
        if (!error && data) {
          setIsLocked(true);
          setLockoutRemaining(15);
        } else {
          setIsLocked(false);
          setLockoutRemaining(0);
        }
      } catch (error) {
        console.error('Error checking lockout status:', error);
      }
    };

    const debounce = setTimeout(checkLockout, 500);
    return () => clearTimeout(debounce);
  }, [email]);

  // Countdown timer for lockout
  useEffect(() => {
    if (isLocked && lockoutRemaining > 0) {
      const timer = setInterval(() => {
        setLockoutRemaining((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 60000); // Update every minute
      
      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutRemaining]);

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

  const recordFailedAttempt = async (attemptEmail: string) => {
    try {
      await supabase.rpc('record_failed_login', {
        attempt_email: attemptEmail.toLowerCase().trim(),
        attempt_ip: null
      });
    } catch (error) {
      console.error('Error recording failed attempt:', error);
    }
  };

  const clearFailedAttempts = async (attemptEmail: string) => {
    try {
      await supabase.rpc('clear_failed_logins', {
        clear_email: attemptEmail.toLowerCase().trim()
      });
    } catch (error) {
      console.error('Error clearing failed attempts:', error);
    }
  };

  const sendLockoutNotification = async (lockedEmail: string, attemptCount: number) => {
    try {
      await supabase.functions.invoke('send-lockout-notification', {
        body: { lockedEmail, attemptCount }
      });
      console.log('Lockout notification sent to admin');
    } catch (error) {
      console.error('Error sending lockout notification:', error);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if account is locked
    if (isLocked) {
      toast({
        title: "Account Locked",
        description: `Too many failed attempts. Please try again in ${lockoutRemaining} minutes.`,
        variant: "destructive"
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

    // Note: Password validation is for signup, not login - skip for login
    // The server will validate the password

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

      const signInResult = await signIn(email, password);
      
      if (signInResult.error) {
        await recordFailedAttempt(email);
        
        // Check if now locked
        const { data: nowLocked } = await supabase.rpc('is_account_locked', {
          check_email: email.toLowerCase().trim(),
          max_attempts: 5,
          lockout_minutes: 15
        });
        
        if (nowLocked) {
          setIsLocked(true);
          setLockoutRemaining(15);
          // Send notification to admin
          await sendLockoutNotification(email, 5);
          toast({
            title: "Account Locked",
            description: "Too many failed attempts. Account locked for 15 minutes. Admin has been notified.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Login failed",
            description: signInResult.error.message,
            variant: "destructive"
          });
        }
        
        setRecaptchaToken(null);
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        return;
      }

      // Check if user has admin role
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        await recordFailedAttempt(email);
        toast({
          title: "Authentication Error",
          description: "Unable to verify user session",
          variant: "destructive"
        });
        return;
      }

      // Use the has_role function to check admin status (bypasses RLS)
      const { data: isAdmin, error: roleError } = await supabase
        .rpc('has_role', { _user_id: authUser.id, _role: 'admin' });

      if (roleError || !isAdmin) {
        await recordFailedAttempt(email);
        // Sign out non-admin user
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "This login is restricted to administrators only",
          variant: "destructive"
        });
        setRecaptchaToken(null);
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        return;
      }

      // Clear failed attempts on successful login
      await clearFailedAttempts(email);

      toast({
        title: "Admin Login Successful",
        description: "Welcome to the Admin Console"
      });
      navigate('/admin-console');
    } catch (error) {
      await recordFailedAttempt(email);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
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

    if (!recaptchaToken) {
      toast({
        title: "reCAPTCHA Required",
        description: "Please complete the reCAPTCHA verification",
        variant: "destructive"
      });
      return;
    }

    // Validate password strength
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast({
        title: "Weak Password",
        description: "Password does not meet security requirements",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
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

      // Call the admin signup edge function
      const { data, error } = await supabase.functions.invoke('create-admin-signup', {
        body: { 
          email, 
          password, 
          firstName, 
          lastName 
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        toast({
          title: data?.requiresApproval ? "Admin Signup Restricted" : "Signup Failed",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: data?.pendingApproval ? "Request Submitted" : "Admin Account Created",
        description: data?.pendingApproval 
          ? "Your request has been submitted. An existing administrator will review and approve your request."
          : data?.requiresEmailVerification 
            ? "Please check your email to verify your account before logging in."
            : "You can now log in with your credentials"
      });

      // Switch to login tab and pre-fill email
      setActiveTab('login');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setRecaptchaToken(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      setRecaptchaToken(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    } finally {
      setLoading(false);
    }
  };

  const StrengthIndicator = ({ met, label }: { met: boolean; label: string }) => (
    <div className={`flex items-center gap-2 text-xs ${met ? 'text-green-400' : 'text-slate-500'}`}>
      {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      <span>{label}</span>
    </div>
  );

  const allStrengthMet = Object.values(passwordStrength).every(Boolean);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setRecaptchaToken(null);
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 py-4 px-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Portal</h1>
              <p className="text-sm text-slate-400">PWAN Bridgefort Management</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Site
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                {activeTab === 'login' ? (
                  <Lock className="h-8 w-8 text-primary" />
                ) : (
                  <UserPlus className="h-8 w-8 text-primary" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">
                {activeTab === 'login' ? 'Administrator Login' : 'Create Admin Account'}
              </h2>
              <p className="text-slate-400 mt-2">
                {activeTab === 'login' 
                  ? 'Access the admin dashboard to manage users, emails, and site content'
                  : 'Register a new administrator account'}
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'login' | 'signup'); resetForm(); }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-900/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                {/* Lockout Warning */}
                {isLocked && (
                  <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-300 font-medium">Account Temporarily Locked</p>
                      <p className="text-red-400 text-sm mt-1">
                        Too many failed login attempts. Please try again in {lockoutRemaining} minutes.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSignIn} className="space-y-5">
                  <div>
                    <Label htmlFor="login-email" className="text-slate-300">Email Address</Label>
                    <Input
                      type="email"
                      id="login-email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLocked}
                      className="mt-1.5 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-primary disabled:opacity-50"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="login-password" className="text-slate-300">Password</Label>
                    <Input
                      type="password"
                      id="login-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLocked}
                      className="mt-1.5 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-primary disabled:opacity-50"
                    />
                  </div>

                  {/* reCAPTCHA */}
                  <div className="flex justify-center py-2">
                    <ReCaptcha
                      ref={recaptchaRef}
                      onChange={(token) => setRecaptchaToken(token)}
                      onExpired={() => setRecaptchaToken(null)}
                      onError={() => setRecaptchaToken(null)}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading || !recaptchaToken || isLocked} 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Authenticating...
                      </span>
                    ) : isLocked ? (
                      <span className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Account Locked
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Sign In to Admin Panel
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="signup-firstName" className="text-slate-300">First Name</Label>
                      <Input
                        type="text"
                        id="signup-firstName"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="mt-1.5 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-lastName" className="text-slate-300">Last Name</Label>
                      <Input
                        type="text"
                        id="signup-lastName"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="mt-1.5 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signup-email" className="text-slate-300">Email Address</Label>
                    <Input
                      type="email"
                      id="signup-email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1.5 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-password" className="text-slate-300">Password</Label>
                    <Input
                      type="password"
                      id="signup-password"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setShowPasswordHints(true)}
                      onBlur={() => setShowPasswordHints(false)}
                      required
                      className="mt-1.5 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-primary"
                    />
                    
                    {/* Password Strength Indicators */}
                    {(showPasswordHints || password.length > 0) && (
                      <div className="mt-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                        <p className="text-xs text-slate-400 mb-2 font-medium">Password Requirements:</p>
                        <div className="grid grid-cols-1 gap-1.5">
                          <StrengthIndicator met={passwordStrength.hasMinLength} label="At least 8 characters" />
                          <StrengthIndicator met={passwordStrength.hasUppercase} label="One uppercase letter" />
                          <StrengthIndicator met={passwordStrength.hasLowercase} label="One lowercase letter" />
                          <StrengthIndicator met={passwordStrength.hasNumber} label="One number" />
                          <StrengthIndicator met={passwordStrength.hasSpecialChar} label="One special character (!@#$%^&*)" />
                        </div>
                        {allStrengthMet && (
                          <div className="mt-2 pt-2 border-t border-slate-700">
                            <p className="text-xs text-green-400 flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              Password meets all requirements
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="signup-confirmPassword" className="text-slate-300">Confirm Password</Label>
                    <Input
                      type="password"
                      id="signup-confirmPassword"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="mt-1.5 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-primary"
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                    )}
                    {confirmPassword && password === confirmPassword && (
                      <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Passwords match
                      </p>
                    )}
                  </div>

                  {/* reCAPTCHA */}
                  <div className="flex justify-center py-2">
                    <ReCaptcha
                      ref={recaptchaRef}
                      onChange={(token) => setRecaptchaToken(token)}
                      onExpired={() => setRecaptchaToken(null)}
                      onError={() => setRecaptchaToken(null)}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading || !recaptchaToken || !allStrengthMet || password !== confirmPassword} 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Account...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Create Admin Account
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-xs text-center text-slate-500">
                This portal is restricted to authorized administrators only. 
                Unauthorized access attempts are logged and monitored.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} PWAN Bridgefort Estate and Investment Ltd.</p>
      </div>
      
      <Toaster />
    </div>
  );
};

export default AdminAuth;

