
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth';
import { Loader2, Mail, Lock, User, ArrowLeft } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, resetPassword, user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please provide both email and password",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        throw error;
      }
      
      // No need to redirect, the AuthContext will do it automatically
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Authentication failed",
        description: error.message || "Invalid email or password",
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        throw error;
      }
      
      // Redirect happens via OAuth callback
    } catch (error: any) {
      console.error('Google login error:', error);
      toast({
        title: "Google authentication failed",
        description: error.message || "Could not sign in with Google",
        variant: "destructive"
      });
    }
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !firstName || !lastName) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signUp(email, password, firstName, lastName);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Account created",
        description: "Please check your email to confirm your account",
      });
      
      // Switch to login tab
      setActiveTab('login');
      
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }
    
    setResetLoading(true);
    
    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        throw error;
      }
      
      setResetSent(true);
      toast({
        title: "Reset link sent",
        description: "Please check your email for password reset instructions"
      });
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Reset failed",
        description: error.message || "Could not send reset email",
        variant: "destructive"
      });
    } finally {
      setResetLoading(false);
    }
  };
  
  if (showResetPassword) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <div className="container-custom flex-grow flex items-center justify-center py-16">
          <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
            <button 
              onClick={() => setShowResetPassword(false)}
              className="flex items-center text-gray-500 hover:text-gray-700 mb-6"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to login
            </button>
            
            <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
            
            {resetSent ? (
              <div className="text-center">
                <div className="bg-green-50 text-green-800 p-4 rounded-md mb-4">
                  <p>Password reset link has been sent to your email.</p>
                  <p className="mt-2">Please check your inbox and follow the instructions.</p>
                </div>
                <Button 
                  onClick={() => {
                    setResetSent(false);
                    setShowResetPassword(false);
                    setActiveTab('login');
                  }}
                  className="mt-4"
                >
                  Return to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <Label htmlFor="resetEmail">Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    We'll send a password reset link to this email.
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-estate-blue hover:bg-estate-darkBlue"
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : 'Send Reset Link'}
                </Button>
              </form>
            )}
          </div>
        </div>
        <Toaster />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="container-custom flex-grow flex items-center justify-center py-16">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-center mb-8">
            <Link to="/">
              <img 
                src="/lovable-uploads/c38e476b-49df-4b14-a2e9-d78048192d53.png" 
                alt="PWAN Bridgefort" 
                className="h-16"
              />
            </Link>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="text-sm text-estate-blue hover:underline"
                      onClick={() => setShowResetPassword(true)}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-estate-blue hover:bg-estate-darkBlue"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : 'Sign In'}
                </Button>
              </form>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={handleGoogleSignIn}
              >
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google" 
                  className="h-5 w-5 mr-2" 
                />
                Google
              </Button>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="signupEmail">Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="signupEmail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="signupPassword">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="signupPassword"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-estate-blue hover:bg-estate-darkBlue"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <p className="text-center text-sm text-gray-500 mt-6">
            By signing in, you agree to our
            <Link to="/terms" className="text-estate-blue hover:underline mx-1">Terms of Service</Link>
            and
            <Link to="/privacy" className="text-estate-blue hover:underline ml-1">Privacy Policy</Link>.
          </p>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Auth;
