import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
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
  const accessRequestRef = useRef(0);

  const clearAccess = useCallback(() => {
    setUserRole(null);
    setRoles([]);
    setPermissions([]);
    setProfile(null);
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') console.error('Error fetching profile:', error);
        return;
      }
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, []);

  const fetchUserAccess = useCallback(async (userId: string) => {
    const requestId = ++accessRequestRef.current;

    try {
      const [
        { data: legacyRolesData, error: legacyRolesError },
        { data: adminRoleData, error: adminRoleError },
        { data: adminPermissionData, error: adminPermissionError },
      ] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', userId),
        supabase.from('admin_roles').select('role_name').eq('user_id', userId),
        supabase.from('admin_permissions').select('permission_key').eq('user_id', userId),
      ]);

      if (requestId !== accessRequestRef.current) return;

      if (legacyRolesError) console.error('fetchUserAccess: user_roles query failed:', legacyRolesError);
      if (adminRoleError) console.error('fetchUserAccess: admin_roles query failed:', adminRoleError);
      if (adminPermissionError) console.error('fetchUserAccess: admin_permissions query failed:', adminPermissionError);

      const legacyRoles = (legacyRolesData ?? []).map((entry: { role: string }) => entry.role);
      const dbRoles = (adminRoleData ?? []).map((entry: { role_name: string }) => entry.role_name);
      const explicitPermissions = (adminPermissionData ?? []).map((entry: { permission_key: string }) => entry.permission_key);
      const roleSet = Array.from(new Set([...legacyRoles, ...dbRoles]));
      const permissionSet = new Set<string>(explicitPermissions);

      if (roleSet.length > 0) {
        const { data: linkedPermissionsData, error: linkedPermissionsError } = await supabase
          .from('role_permissions')
          .select('permission_key')
          .in('role', roleSet);

        if (requestId !== accessRequestRef.current) return;
        if (linkedPermissionsError) console.error('fetchUserAccess: role_permissions query failed:', linkedPermissionsError);
        (linkedPermissionsData ?? []).forEach((entry: { permission_key: string }) => permissionSet.add(entry.permission_key));
      }

      // Legacy/global admin records retain their historical full-access behavior.
      // Department roles must receive their permissions through role_permissions
      // or explicit admin_permissions instead of being silently elevated here.
      const isLegacyAdmin = roleSet.includes('admin') || roleSet.includes('super_admin');
      if (isLegacyAdmin) {
        [
          'admin:all',
          'admin:view_dashboard',
          'admin:view_properties',
          'admin:view_crm',
          'admin:view_users',
          'admin:view_approvals',
          'admin:view_email_center',
          'admin:view_analytics',
          'admin:view_mlm_funnel',
          'admin:view_activity',
          'admin:view_content',
          'admin:view_cms',
          'admin:view_other_payments',
          'admin:manage_permissions',
          'admin:manage_departments',
          'mailbox:read',
          'mailbox:write',
          'mailbox:sync',
        ].forEach((permission) => permissionSet.add(permission));
      }

      if (requestId !== accessRequestRef.current) return;
      const normalizedRoles = roleSet.length ? roleSet : ['user'];
      setRoles(normalizedRoles);
      setPermissions(Array.from(permissionSet));
      setUserRole(getPrimaryRole(normalizedRoles));
    } catch (error) {
      if (requestId !== accessRequestRef.current) return;
      console.error('Error fetching user role and permissions:', error);
      setRoles([]);
      setPermissions([]);
      setUserRole(null);
    }
  }, []);

  const hydrateSession = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);

    if (!nextSession?.user) {
      accessRequestRef.current += 1;
      clearAccess();
      return;
    }

    // Access/profile hydration is deliberately performed outside the Supabase
    // auth-state callback. Awaiting network work inside onAuthStateChange can
    // block subsequent auth events and create stale session/role state.
    await Promise.all([
      fetchUserAccess(nextSession.user.id),
      fetchProfile(nextSession.user.id),
    ]);
  }, [clearAccess, fetchProfile, fetchUserAccess]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) console.error('Initial session lookup failed:', error);
        if (mounted) await hydrateSession(initialSession);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (mounted) clearAccess();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, nextSession) => {
      if (!mounted) return;

      // Update the auth primitives immediately. Do not await Supabase queries
      // from inside this callback.
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        accessRequestRef.current += 1;
        clearAccess();
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_UP') {
        setTimeout(() => {
          if (mounted) sendWelcomeEmail(nextSession.user);
        }, 0);
      }

      setLoading(true);
      setTimeout(() => {
        if (!mounted) return;
        Promise.all([
          fetchUserAccess(nextSession.user.id),
          fetchProfile(nextSession.user.id),
        ]).finally(() => {
          if (mounted) setLoading(false);
        });
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [clearAccess, fetchProfile, fetchUserAccess, hydrateSession]);

  const sendWelcomeEmail = async (authUser: User) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', authUser.id)
        .single();

      await supabase.functions.invoke('send-welcome-email', {
        body: {
          email: authUser.email,
          firstName: profileData?.first_name || '',
          lastName: profileData?.last_name || '',
        },
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    await fetchProfile(user.id);
    await fetchUserAccess(user.id);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return { error };
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { first_name: firstName || '', last_name: lastName || '' },
      },
    });
    return { error, data };
  };

  const signOut = async () => {
    accessRequestRef.current += 1;
    clearAccess();
    setSession(null);
    setUser(null);

    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: 'Error signing out', description: error.message, variant: 'destructive' });
    }
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
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
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    return { error };
  };

  const hasMailboxAccess = async (
    mailboxEmail: string | null | undefined,
    provider: 'gmail' | 'resend' | string = 'gmail',
  ) => {
    if (!user || !mailboxEmail) return false;
    const normalizedEmail = mailboxEmail.trim().toLowerCase();
    if (!normalizedEmail) return false;

    // Only explicit global access may bypass the mailbox assignment table.
    // `mailbox:read` means the user may read assigned mailboxes; it does not
    // mean every mailbox in the company.
    if (hasPermission(permissions, 'admin:all')) return true;
    if (!hasPermission(permissions, 'mailbox:read')) return false;

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
