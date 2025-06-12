
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEcommerce } from '@/contexts/ecommerce';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const { clearCart } = useEcommerce();

  useEffect(() => {
    const reference = searchParams.get('reference');
    
    if (reference) {
      verifyPayment(reference);
    } else {
      setVerificationStatus('failed');
    }
  }, [searchParams]);

  const verifyPayment = async (reference: string) => {
    try {
      const response = await fetch(`/api/paystack/verify/${reference}`);
      const data = await response.json();

      if (data.status && data.data.status === 'success') {
        setVerificationStatus('success');
        setPaymentDetails(data.data);
        clearCart(); // Clear cart on successful payment
      } else {
        setVerificationStatus('failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setVerificationStatus('failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              {verificationStatus === 'loading' && (
                <>
                  <Loader2 className="h-16 w-16 animate-spin mx-auto text-estate-blue mb-4" />
                  <CardTitle>Verifying Payment...</CardTitle>
                </>
              )}
              
              {verificationStatus === 'success' && (
                <>
                  <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                  <CardTitle className="text-green-700">Payment Successful!</CardTitle>
                </>
              )}
              
              {verificationStatus === 'failed' && (
                <>
                  <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
                  <CardTitle className="text-red-700">Payment Failed</CardTitle>
                </>
              )}
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              {verificationStatus === 'success' && paymentDetails && (
                <div className="space-y-2">
                  <p className="text-gray-600">
                    Transaction Reference: <span className="font-mono">{paymentDetails.reference}</span>
                  </p>
                  <p className="text-gray-600">
                    Amount: <span className="font-bold">₦{(paymentDetails.amount / 100).toLocaleString()}</span>
                  </p>
                  <p className="text-sm text-green-600">
                    Thank you for your purchase! We'll send you a confirmation email shortly.
                  </p>
                </div>
              )}
              
              {verificationStatus === 'failed' && (
                <p className="text-gray-600">
                  We couldn't verify your payment. Please contact our support team if you believe this is an error.
                </p>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate('/properties')}
                  className="flex-1 bg-estate-blue hover:bg-estate-darkBlue"
                >
                  Browse Properties
                </Button>
                
                {verificationStatus === 'success' && (
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    variant="outline"
                    className="flex-1"
                  >
                    View Orders
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
