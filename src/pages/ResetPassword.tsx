
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to send password reset email",
          variant: "destructive",
        });
      } else {
        setIsSubmitted(true);
        toast({
          title: "Email sent",
          description: "Check your email for a password reset link",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Reset your password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>
          
          <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {isSubmitted ? (
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
                <p className="mt-2 text-sm text-gray-500">
                  We've sent a password reset link to {email}
                </p>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="mt-5 bg-estate-blue hover:bg-estate-darkBlue"
                >
                  Return to login
                </Button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleResetPassword}>
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <div className="mt-1">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full"
                    />
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full bg-estate-blue hover:bg-estate-darkBlue"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send reset link'}
                  </Button>
                </div>
                
                <div className="text-center mt-4">
                  <button 
                    type="button" 
                    onClick={() => navigate('/auth')}
                    className="text-sm text-estate-blue hover:text-estate-darkBlue"
                  >
                    Back to login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <Toaster />
    </>
  );
};

export default ResetPassword;
