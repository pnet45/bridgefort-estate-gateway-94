import { useMemo } from 'react';
import { Button, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/authContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, profile } = useAuth();

  const welcomeName = useMemo(() => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return user?.email || 'Realtor';
  }, [profile, user]);

  const referralCode = profile?.pbo_referral_code || (user?.id ? user.id.slice(0, 8).toUpperCase() : '—');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Bridgefort Realtors</Text>
        <Text style={styles.subtitle}>Welcome back, {welcomeName}.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your BHRealtors overview</Text>
          <Text style={styles.cardLabel}>Referral code</Text>
          <Text style={styles.cardValue}>{referralCode}</Text>
          <Text style={styles.cardLabel}>PBO status</Text>
          <Text style={styles.cardValue}>{profile?.is_pbo ? 'Active PBO' : 'Standard member'}</Text>
        </View>

        <View style={styles.buttonGroup}>
          <View style={styles.buttonWrapper}>
            <Button title="Open Dashboard" onPress={() => navigation.navigate('Dashboard')} />
          </View>
          <View style={styles.buttonWrapper}>
            <Button title="Referral History" onPress={() => navigation.navigate('ReferralHistory')} />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>What you can do</Text>
          <Text style={styles.infoText}>• View your referral code and PBO status.</Text>
          <Text style={styles.infoText}>• Share your referral link with new members.</Text>
          <Text style={styles.infoText}>• Check your referral history and downline members.</Text>
        </View>
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
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#0f172a',
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
  buttonGroup: {
    gap: 12,
    marginBottom: 24,
  },
  buttonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoBox: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#0f172a',
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
});
