import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Linking } from 'react-native';
import { supabase } from '../supabase';

type ContentItem = {
  id: string;
  content_type: string;
  page: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  body: string | null;
  image_url: string | null;
  category: string | null;
  link_url: string | null;
  cta_label: string | null;
  event_date: string | null;
  event_location: string | null;
};

type Props = { page: 'blog' | 'training' | 'services' | 'home'; title?: string };

export default function CMSContentScreen({ page, title }: Props) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from('content_items')
      .select('*')
      .eq('page', page)
      .eq('is_published', true)
      .order('display_order')
      .order('created_at', { ascending: false });
    setItems((data as ContentItem[]) || []);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`cms_${page}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_items' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [page]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <FlatList
      data={items}
      keyExtractor={i => i.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      ListHeaderComponent={title ? <Text style={styles.heading}>{title}</Text> : null}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => item.link_url && Linking.openURL(item.link_url)}
        >
          {item.image_url && <Image source={{ uri: item.image_url }} style={styles.image} />}
          <View style={styles.body}>
            {item.category && <Text style={styles.category}>{item.category.toUpperCase()}</Text>}
            <Text style={styles.title}>{item.title}</Text>
            {item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}
            {item.excerpt ? <Text style={styles.excerpt} numberOfLines={3}>{item.excerpt}</Text> : null}
            {item.event_date ? <Text style={styles.meta}>📅 {new Date(item.event_date).toLocaleString()}</Text> : null}
            {item.event_location ? <Text style={styles.meta}>📍 {item.event_location}</Text> : null}
            {item.link_url ? <Text style={styles.cta}>{item.cta_label || 'Learn more'} →</Text> : null}
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', marginBottom: 12, elevation: 2 },
  image: { width: '100%', height: 180, backgroundColor: '#eee' },
  body: { padding: 12 },
  category: { fontSize: 10, color: '#1e40af', fontWeight: '700', marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#555', marginBottom: 6 },
  excerpt: { fontSize: 13, color: '#666', lineHeight: 18 },
  meta: { fontSize: 12, color: '#777', marginTop: 4 },
  cta: { fontSize: 13, color: '#1e40af', fontWeight: '600', marginTop: 8 },
});
