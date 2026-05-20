import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  is_pbo?: boolean;
  pbo_referral_code?: string;
  referred_by_code?: string;
}

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (options: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    registerAsPBO: boolean;
    pboCode?: string;
    sponsorCode?: string;
  }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, is_pbo, pbo_referral_code, referred_by_code')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error('[AuthContext] fetchProfile error', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('[AuthContext] getSession error', error.message);
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      }

      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchProfile(session.user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ?? null };
  };

  const signUp = async ({ email, password, firstName, lastName, registerAsPBO, pboCode, sponsorCode }: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    registerAsPBO: boolean;
    pboCode?: string;
    sponsorCode?: string;
  }) => {
    const { data, error } = await supabase.auth.signUp({
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
      return { error };
    }

    if (data.user) {
      const profileData: Record<string, any> = {
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        email,
        created_at: new Date().toISOString(),
      };

      if (registerAsPBO) {
        if (pboCode) {
          profileData.is_pbo = true;
          profileData.pbo_referral_code = pboCode;
        }
      } else if (sponsorCode) {
        profileData.referred_by_code = sponsorCode;
      }

      const { error: profileError } = await supabase.from('profiles').upsert(profileData, {
        onConflict: 'id',
      });

      if (profileError) {
        console.error('[AuthContext] signUp profile upsert error', profileError.message);
      }
    }

    return { error: error ?? null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[AuthContext] signOut error', error.message);
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
