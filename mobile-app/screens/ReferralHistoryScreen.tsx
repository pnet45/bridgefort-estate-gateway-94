import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../supabase';
import { useAuth } from '../context/authContext';

type ReferralItem = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  created_at: string | null;
  is_pbo: boolean | null;
  referred_by_code: string | null;
};

export default function ReferralHistoryScreen() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadReferrals = async () => {
      if (!user) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        let query = supabase
          .from('profiles')
          .select('id, first_name, last_name, email, created_at, is_pbo, referred_by_code')
          .order('created_at', { ascending: false });

        if (profile?.pbo_referral_code) {
          query = query.or(
            `referred_by_id.eq.${user.id},referred_by_code.eq.${profile.pbo_referral_code}`
          );
        } else {
          query = query.eq('referred_by_id', user.id);
        }

        const { data, error: queryError } = await query;

        if (queryError) {
          throw queryError;
        }

        setReferrals((data ?? []) as ReferralItem[]);
      } catch (err: any) {
        console.error('Referral load error', err);
        setError(err.message || 'Unable to load referral history.');
      } finally {
        setLoading(false);
      }
    };

    loadReferrals();
  }, [user, profile]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1f2937" />
        <Text style={styles.loadingText}>Loading referral history...</Text>
      </SafeAreaView>
    );
  }

  return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Referral History</Text>
        <Text style={styles.subtitle}>Your direct referral records and downline members.</Text>

        {error ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{error}</Text>
          </View>
        ) : referrals.length === 0 ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>No referrals found yet. Share your referral code to grow your network.</Text>
          </View>
        ) : (
          <FlatList
            data={referrals}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.itemName}>{`${item.first_name || 'Unknown'} ${item.last_name || ''}`.trim() || 'Unnamed referral'}</Text>
                <Text style={styles.itemMeta}>{item.email ?? 'No email'}</Text>
                <Text style={styles.itemMeta}>Joined: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Unknown'}</Text>
                <Text style={styles.itemMeta}>PBO: {item.is_pbo ? 'Yes' : 'No'}</Text>
              </View>
            )}
          />
        )}
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#334155',
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
    marginBottom: 20,
  },
  messageBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    color: '#334155',
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  itemMeta: {
    color: '#475569',
    fontSize: 14,
    marginBottom: 4,
  },
});
