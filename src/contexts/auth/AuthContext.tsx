
import React, { createContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AuthContextType } from './types';
import { fetchUserRole, fetchUserProfile } from './authUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<{first_name: string; last_name: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user?.id) return;
    
    const profileData = await fetchUserProfile(user.id);
    if (profileData) {
      setProfile(profileData);
    }
    
    const role = await fetchUserRole(user.id);
    setUserRole(role);
  };

  useEffect(() => {
    const setupAuthListener = async () => {
      setIsLoading(true);
      
      // Set up auth state listener
      const { data: { subscription }} = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            // Show toast on successful sign in
            if (event === 'SIGNED_IN') {
              toast({
                title: "Login successful",
                description: "Welcome back!",
              });
              
              // Redirect to dashboard on successful login
              window.location.href = '/dashboard';
            }
            
            // Use setTimeout to avoid potential circular dependencies with Supabase client
            setTimeout(async () => {
              const role = await fetchUserRole(currentSession.user.id);
              setUserRole(role);
              
              const profileData = await fetchUserProfile(currentSession.user.id);
              setProfile(profileData);
            }, 0);
          } else {
            setUserRole(null);
            setProfile(null);
          }
        }
      );
      
      // Check for existing session
      const { data: { session: currentSession }} = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        const role = await fetchUserRole(currentSession.user.id);
        setUserRole(role);
        
        const profileData = await fetchUserProfile(currentSession.user.id);
        setProfile(profileData);
      }
      
      setIsLoading(false);
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    setupAuthListener();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      // Toast notification is now handled in the auth state change listener
      
      return { error: null };
    } catch (err) {
      console.error("Error during sign in:", err);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Registration successful",
        description: "Welcome to PWAN Bridgefort!",
      });

      return { error: null };
    } catch (err) {
      console.error("Error during sign up:", err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Error during sign out:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        userRole,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
