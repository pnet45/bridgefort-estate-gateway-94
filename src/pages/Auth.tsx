
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setConfirmPassword('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Login successful",
          description: "Welcome back!"
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
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

    setLoading(true);
    try {
      const { data, error } = await signUp(email, password, firstName, lastName);
      if (error) throw error;
      
      if (data.user) {
        toast({
          title: "Registration successful!",
          description: "Please check your email to verify your account."
        });
        // Redirect to profile completion page
        navigate('/profile');
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-estate-blue py-4 text-center text-white">
        <h1 className="text-2xl font-bold">
          {isLogin ? 'Sign In' : 'Create Account'}
        </h1>
      </div>
      
      {/* Moved Go Back Home button just below the header */}
      <div className="container-custom">
        <Button
          type="button"
          variant="outline"
          className="mt-4 mb-2 ml-0"
          onClick={() => navigate('/home')}
        >
          Cancel / Go Back Home
        </Button>
      </div>

      <div className="container-custom py-12 flex-grow">
        <div className="max-w-md mx-auto">
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
              <Input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {!isLogin && (
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full bg-estate-blue hover:bg-estate-darkBlue">
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
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
              <Link to="/reset-password" className="text-sm text-gray-600 hover:underline">
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
