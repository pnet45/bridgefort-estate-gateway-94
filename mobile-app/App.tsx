import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from './supabase';
import type { Session, User } from '@supabase/supabase-js';

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  is_pbo?: boolean;
  pbo_referral_code?: string;
  referred_by_code?: string;
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [registerAsPBO, setRegisterAsPBO] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pboCode, setPboCode] = useState('');
  const [sponsorCode, setSponsorCode] = useState('');

  const welcomeName = useMemo(() => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return user?.email || 'Realtor';
  }, [profile, user]);

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error('Supabase session error', error.message);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    }
  }, [user]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, is_pbo, pbo_referral_code, referred_by_code')
        .eq('id', userId)
        .single();
      if (error) {
        console.error('Fetch profile error', error.message);
        return;
      }
      setProfile(data as Profile);
    } catch (error) {
      console.error('Fetch profile failed', error);
    }
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing information', 'Please enter both email and password.');
      return;
    }

    setAuthLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setAuthLoading(false);

    if (error) {
      Alert.alert('Sign in failed', error.message);
      return;
    }

    if (data.session?.user) {
      setUser(data.session.user);
      fetchProfile(data.session.user.id);
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim() || !firstName.trim() || !lastName.trim()) {
      Alert.alert('Missing information', 'Please complete all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Your password fields do not match.');
      return;
    }

    setAuthLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      },
    });

    if (error) {
      setAuthLoading(false);
      Alert.alert('Sign up failed', error.message);
      return;
    }

    if (data.user) {
      const profileData: Record<string, any> = {
        id: data.user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        created_at: new Date().toISOString(),
      };

      if (registerAsPBO) {
        if (!pboCode.trim()) {
          setAuthLoading(false);
          Alert.alert('PBO code required', 'Enter a unique PBO referral code before continuing.');
          return;
        }
        profileData.is_pbo = true;
        profileData.pbo_referral_code = pboCode.trim();
      } else if (sponsorCode.trim()) {
        const { data: sponsor, error: sponsorError } = await supabase
          .from('profiles')
          .select('id')
          .eq('pbo_referral_code', sponsorCode.trim())
          .eq('is_pbo', true)
          .single();

        if (sponsorError || !sponsor) {
          setAuthLoading(false);
          Alert.alert('Invalid sponsor code', 'Please check the sponsor code and try again.');
          return;
        }
        profileData.referred_by_code = sponsorCode.trim();
        profileData.referred_by_id = sponsor.id;
      }

      const { error: profileError } = await supabase.from('profiles').upsert(profileData, { onConflict: 'id' });
      setAuthLoading(false);

      if (profileError) {
        Alert.alert('Profile creation failed', profileError.message);
        return;
      }

      Alert.alert('Registration successful', 'A confirmation link has been sent to your email.');
      setIsLogin(true);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setPboCode('');
      setSponsorCode('');
    } else {
      setAuthLoading(false);
      Alert.alert('Sign up', 'Check your email for a verification link.');
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Sign out failed', error.message);
    }
  };

  const handleShareLink = async () => {
    const code = profile?.pbo_referral_code || user?.id.slice(0, 8).toUpperCase();
    const shareLink = `https://bridgefortestates.com/bridgefort-realtors-login?ref=${code}`;
    try {
      await Share.share({ message: `Join Bridgefort Realtors using my referral link: ${shareLink}` });
    } catch (error) {
      console.error('Share failed', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1f2937" />
        <Text style={styles.loadingText}>Connecting to Bridgefort Realtors...</Text>
      </SafeAreaView>
    );
  }

  if (user) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.header}>Bridgefort Realtors</Text>
          <Text style={styles.subtitle}>Welcome back, {welcomeName}.</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>MLM Referral Dashboard</Text>
            <Text style={styles.cardLabel}>Referral code</Text>
            <Text style={styles.cardValue}>{profile?.pbo_referral_code || user.id.slice(0, 8).toUpperCase()}</Text>
            <Text style={styles.cardLabel}>Share link</Text>
            <Text style={styles.cardValue}>https://bridgefortestates.com/bridgefort-realtors-login?ref={profile?.pbo_referral_code || user.id.slice(0, 8).toUpperCase()}</Text>
            <View style={styles.shareButton}>
              <Button title="Share Referral Link" onPress={handleShareLink} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Account</Text>
            <Text style={styles.cardLabel}>Email</Text>
            <Text style={styles.cardValue}>{user.email}</Text>
            <Text style={styles.cardLabel}>PBO status</Text>
            <Text style={styles.cardValue}>{profile?.is_pbo ? 'Yes' : 'No'}</Text>
          </View>

          <View style={styles.signOutButton}>
            <Button title="Sign Out" color="#dc2626" onPress={handleSignOut} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Bridgefort Realtors</Text>
        <Text style={styles.subtitle}>{isLogin ? 'Sign in to access your MLM dashboard.' : 'Register for Bridgefort Realtors access.'}</Text>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {!isLogin && (
          <>
            <TextInput
              style={styles.input}
              placeholder="First name"
              autoCapitalize="words"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Last name"
              autoCapitalize="words"
              value={lastName}
              onChangeText={setLastName}
            />
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {!isLogin && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <View style={styles.rowCenter}>
              <Text style={styles.label}>Register as PBO</Text>
              <Switch value={registerAsPBO} onValueChange={setRegisterAsPBO} />
            </View>
            {registerAsPBO ? (
              <TextInput
                style={styles.input}
                placeholder="Choose a PBO referral code"
                value={pboCode}
                onChangeText={setPboCode}
                autoCapitalize="characters"
              />
            ) : (
              <TextInput
                style={styles.input}
                placeholder="Sponsor referral code (optional)"
                value={sponsorCode}
                onChangeText={setSponsorCode}
                autoCapitalize="characters"
              />
            )}
          </>
        )}

        <View style={styles.submitButton}>
          <Button
            title={authLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            onPress={isLogin ? handleSignIn : handleSignUp}
            disabled={authLoading}
          />
        </View>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchLink}>
          <Text style={styles.switchText}>
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign In'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#334155',
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 24,
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: 18,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#1d4ed8',
  },
  toggleText: {
    color: '#334155',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    color: '#0f172a',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  label: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 14,
  },
  switchLink: {
    marginTop: 12,
    alignItems: 'center',
  },
  switchText: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 10,
  },
  cardValue: {
    marginTop: 6,
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
  },
  shareButton: {
    marginTop: 16,
  },
  signOutButton: {
    marginTop: 20,
  },
});
