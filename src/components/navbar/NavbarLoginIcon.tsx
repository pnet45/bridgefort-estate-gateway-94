
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';

// Quick Login panel now slides in from bottom left
const NavbarLoginIcon = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
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
        setShowPanel(false);
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

  const handleBackdropClick = () => setShowPanel(false);

  return (
    <div className="login-icon-container relative z-40">
      <Button
        variant="ghost"
        size="sm"
        className="p-2"
        aria-label="Login"
        onClick={() => setShowPanel((s) => !s)}
      >
        <User size={20} className="text-estate-blue" />
      </Button>
      {/* Overlay/Backdrop */}
      {showPanel && (
        <div
          className="fixed inset-0 z-[999] bg-black/30 transition-opacity duration-300"
          onClick={handleBackdropClick}
        ></div>
      )}
      <div
        className={`
          fixed bottom-6 left-4 max-w-xs w-[325px] bg-white shadow-2xl rounded-lg border
          animate-slide-in-up transition-transform transition-opacity duration-300
          ${showPanel ? 'opacity-100 pointer-events-auto translate-y-0 z-[1000]' : 'opacity-0 pointer-events-none translate-y-20'}
        `}
        style={{
          zIndex: 1000,
        }}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-estate-blue">Quick Login</h3>
          <form onSubmit={handleQuickLogin} className="space-y-4">
            <div>
              <Label htmlFor="quick-email">Email</Label>
              <Input
                id="quick-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <Label htmlFor="quick-password">Password</Label>
              <Input
                id="quick-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="submit" 
                size="sm" 
                disabled={loading || !email || !password}
                className="bg-estate-blue hover:bg-estate-darkBlue flex-1"
              >
                <LogIn size={16} className="mr-1" />
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowPanel(false);
                  navigate('/auth');
                }}
                className="flex-1"
              >
                Register
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NavbarLoginIcon;
