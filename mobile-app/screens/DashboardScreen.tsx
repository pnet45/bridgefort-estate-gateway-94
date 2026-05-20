import { Share, StyleSheet, Text, View, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/authContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

export default function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, profile, signOut } = useAuth();

  const handleShare = async () => {
    const code = profile?.pbo_referral_code || user?.id.slice(0, 8).toUpperCase();
    const label = profile?.pbo_referral_code ? 'Bridgefort Realtors' : 'Bridgefort Realtors';
    const message = `Join ${label} using my referral link: https://bridgefortestates.com/bridgefort-realtors-login?ref=${code}`;

    try {
      await Share.share({ message });
    } catch (error) {
      console.error('Share failed', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bridgefort Realtors Dashboard</Text>
      <Text style={styles.subtitle}>Welcome back, {profile?.first_name || user?.email || 'Realtor'}.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Referral code</Text>
        <Text style={styles.value}>{profile?.pbo_referral_code || user?.id.slice(0, 8).toUpperCase()}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>PBO status</Text>
        <Text style={styles.value}>{profile?.is_pbo ? 'Active PBO' : 'Standard member'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email ?? 'Not available'}</Text>
      </View>

      <View style={styles.buttonRow}>
        <Button title="Share Referral Link" onPress={handleShare} />
      </View>

      <View style={styles.buttonRow}>
        <Button title="View Referral History" onPress={() => navigation.navigate('ReferralHistory')} />
      </View>

      <View style={styles.buttonRow}>
        <Button title="Sign Out" color="#dc2626" onPress={signOut} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  label: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 8,
  },
  value: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonRow: {
    marginTop: 10,
  },
});
