import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getPrimaryRole, hasPermission } from '@/lib/rbac';
import { AuthContextType, UserProfile } from './authTypes';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchUserAccess(session.user.id);
            fetchProfile(session.user.id);
          }, 0);

          if (event === 'SIGNED_UP' as AuthChangeEvent) {
            setTimeout(() => {
              sendWelcomeEmail(session.user);
            }, 0);
          }
        } else {
          setUserRole(null);
          setRoles([]);
          setPermissions([]);
          setProfile(null);
        }

        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserAccess(session.user.id);
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserAccess = async (userId: string) => {
    try {
      const [{ data: legacyRolesData }, { data: adminRoleData }, { data: adminPermissionData }] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', userId),
        supabase.from('admin_roles').select('role_name').eq('user_id', userId),
        supabase.from('admin_permissions').select('permission_key').eq('user_id', userId),
      ]);

      const legacyRoles = (legacyRolesData ?? []).map((roleEntry: { role: string }) => roleEntry.role);
      const dbRoles = (adminRoleData ?? []).map((roleEntry: { role_name: string }) => roleEntry.role_name);
      const explicitPermissions = (adminPermissionData ?? []).map((permEntry: { permission_key: string }) => permEntry.permission_key);

      const roleSet = Array.from(new Set([...legacyRoles, ...dbRoles]));
      const permissionSet = new Set<string>(explicitPermissions);

      if (roleSet.length > 0) {
        const { data: linkedPermissionsData } = await supabase
          .from('role_permissions')
          .select('permission_key')
          .in('role_name', roleSet);

        (linkedPermissionsData ?? []).forEach((entry: { permission_key: string }) => permissionSet.add(entry.permission_key));
      }

      const isLegacyAdmin = roleSet.includes('admin') || roleSet.includes('super_admin');
      if (isLegacyAdmin) {
        permissionSet.add('admin:all');
        permissionSet.add('admin:view_dashboard');
        permissionSet.add('admin:view_properties');
        permissionSet.add('admin:view_crm');
        permissionSet.add('admin:view_users');
        permissionSet.add('admin:view_approvals');
        permissionSet.add('admin:view_email_center');
        permissionSet.add('admin:view_analytics');
        permissionSet.add('admin:view_mlm_funnel');
        permissionSet.add('admin:view_activity');
        permissionSet.add('admin:view_content');
        permissionSet.add('admin:view_cms');
        permissionSet.add('admin:view_other_payments');
        permissionSet.add('admin:manage_permissions');
        permissionSet.add('mailbox:read');
        permissionSet.add('mailbox:write');
        permissionSet.add('mailbox:sync');
      }

      const normalizedRoles = roleSet.length ? roleSet : ['user'];
      setRoles(normalizedRoles);
      setPermissions(Array.from(permissionSet));
      setUserRole(getPrimaryRole(normalizedRoles));
    } catch (error) {
      console.error('Error fetching user role and permissions:', error);
      setRoles([]);
      setPermissions([]);
      setUserRole(null);
    }
  };

  const sendWelcomeEmail = async (user: User) => {
    try {
      // Get user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      await supabase.functions.invoke('send-welcome-email', {
        body: {
          email: user.email,
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || ''
        }
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName || '',
          last_name: lastName || ''
        }
      }
    });
    return { error, data };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    }
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { error };
  };

  const hasMailboxAccess = async (mailboxEmail: string | null | undefined, provider: 'gmail' | 'resend' | string = 'gmail') => {
    if (!user || !mailboxEmail) {
      return false;
    }

    const normalizedEmail = mailboxEmail.trim().toLowerCase();
    if (!normalizedEmail) return false;

    if (hasPermission(permissions, ['admin:all', 'mailbox:read'])) {
      return true;
    }

    const { data, error } = await supabase
      .from('admin_mailboxes')
      .select('id')
      .eq('user_id', user.id)
      .eq('mailbox_provider', provider)
      .ilike('mailbox_email', normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error('Mailbox access lookup failed:', error);
      return false;
    }

    return !!data;
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    userRole,
    roles,
    permissions,
    loading,
    isLoading: loading,
    hasPermission: (permission) => hasPermission(permissions, permission),
    hasMailboxAccess,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
