import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/authContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

export default function AuthScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, loading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [registerAsPBO, setRegisterAsPBO] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pboCode, setPboCode] = useState('');
  const [sponsorCode, setSponsorCode] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
    }
  }, [user, loading, navigation]);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing information', 'Please enter both email and password.');
      return;
    }

    setAuthLoading(true);
    const { error } = await signIn(email.trim(), password);
    setAuthLoading(false);

    if (error) {
      Alert.alert('Sign in failed', error.message);
      return;
    }

    navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim() || !firstName.trim() || !lastName.trim()) {
      Alert.alert('Missing information', 'Please complete all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Your passwords do not match.');
      return;
    }

    setAuthLoading(true);
    const { error } = await signUp({
      email: email.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      registerAsPBO,
      pboCode: registerAsPBO ? pboCode.trim() : undefined,
      sponsorCode: !registerAsPBO && sponsorCode.trim() ? sponsorCode.trim() : undefined,
    });
    setAuthLoading(false);

    if (error) {
      Alert.alert('Sign up failed', error.message);
      return;
    }

    Alert.alert('Registration successful', 'Please verify your email and sign in.');
    setIsLogin(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Preparing authentication...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Bridgefort Realtors</Text>
        <Text style={styles.subtitle}>{isLogin ? 'Sign in to access your MLM dashboard.' : 'Register for a Bridgefort Realtors account.'}</Text>

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
            <TextInput style={styles.input} placeholder="First name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
            <TextInput style={styles.input} placeholder="Last name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
          </>
        )}

        <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

        {!isLogin && (
          <>
            <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
            <View style={styles.rowCenter}>
              <Text style={styles.label}>Register as PBO</Text>
              <Switch value={registerAsPBO} onValueChange={setRegisterAsPBO} />
            </View>
            {registerAsPBO ? (
              <TextInput style={styles.input} placeholder="Create your PBO code" value={pboCode} onChangeText={setPboCode} autoCapitalize="characters" />
            ) : (
              <TextInput style={styles.input} placeholder="Sponsor referral code (optional)" value={sponsorCode} onChangeText={setSponsorCode} autoCapitalize="characters" />
            )}
          </>
        )}

        <View style={styles.submitButton}>
          <Button title={authLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'} onPress={isLogin ? handleSignIn : handleSignUp} disabled={authLoading} />
        </View>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchLink}>
          <Text style={styles.switchText}>{isLogin ? "Don't have an account? Register" : 'Already have an account? Sign In'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
});
