import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const OTPResetPassword = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'newPassword'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Generate OTP
      const otpCode = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

      // Save OTP to database
      const { error: insertError } = await supabase
        .from('password_reset_otps')
        .insert({
          email,
          otp_code: otpCode,
          expires_at: expiresAt.toISOString()
        });

      if (insertError) {
        throw insertError;
      }

      // Send OTP via email (using edge function)
      const { error: emailError } = await supabase.functions.invoke('send-otp-email', {
        body: { email, otp: otpCode }
      });

      if (emailError) {
        console.warn('Email sending failed:', emailError);
        // Continue anyway as OTP is saved
      }

      setStep('otp');
      toast({
        title: "OTP Sent",
        description: "Check your email for the 6-digit verification code",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('password_reset_otps')
        .select('*')
        .eq('email', email)
        .eq('otp_code', otp)
        .eq('used', false)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        throw new Error('Invalid or expired OTP');
      }

      setStep('newPassword');
      toast({
        title: "OTP Verified",
        description: "Please enter your new password",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get user by email
      const { data: userData, error: userError } = await supabase
        .from('password_reset_otps')
        .select('user_id')
        .eq('email', email)
        .eq('otp_code', otp)
        .single();

      if (userError) throw userError;

      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userData.user_id,
        { password: newPassword }
      );

      if (updateError) throw updateError;

      // Mark OTP as used
      await supabase
        .from('password_reset_otps')
        .update({ used: true })
        .eq('email', email)
        .eq('otp_code', otp);

      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated successfully",
      });

      setTimeout(() => navigate('/auth'), 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
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
              Reset Password with OTP
            </h2>
          </div>
          
          <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {step === 'email' && (
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-estate-blue hover:bg-estate-darkBlue"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </Button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <Label htmlFor="otp">Enter 6-digit OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="mt-1 text-center text-2xl"
                    placeholder="000000"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-estate-blue hover:bg-estate-darkBlue"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </form>
            )}

            {step === 'newPassword' && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-estate-blue hover:bg-estate-darkBlue"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Reset Password'}
                </Button>
              </form>
            )}

            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => navigate('/auth')}
                className="text-sm text-estate-blue hover:text-estate-darkBlue"
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <Toaster />
    </>
  );
};

export default OTPResetPassword;