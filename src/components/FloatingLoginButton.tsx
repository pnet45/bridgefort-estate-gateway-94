
import React, { useRef, useEffect, useState } from "react";
import { User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/hooks/use-toast";

// Floating login button at bottom left, shows Quick Login panel on click
const FloatingLoginButton = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!showPanel) return;
    const handleClick = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setShowPanel(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPanel]);

  // Prevent scroll background when panel open
  useEffect(() => {
    if (showPanel) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showPanel]);

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
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        setShowPanel(false);
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-8 left-6 z-[9999] flex flex-col items-start gap-2">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Quick Login"
          className="bg-estate-blue text-white shadow-lg hover:bg-estate-darkBlue"
          onClick={() => setShowPanel(true)}
        >
          <User size={24} />
        </Button>

        {/* Panel */}
        <div
          ref={panelRef}
          className={`bg-white border shadow-2xl rounded-lg transition-all duration-300 w-[325px] max-w-[90vw] p-6
            ${showPanel ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none translate-y-8"}
            ${showPanel ? "z-[10000]" : ""}
            absolute left-0 bottom-16
          `}
          style={{ boxShadow: "0 4px 32px rgba(44,46,102,.22)" }}
        >
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
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPanel(false);
                  navigate("/auth");
                }}
                className="flex-1"
              >
                Register
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default FloatingLoginButton;
