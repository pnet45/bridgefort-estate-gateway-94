import React, { useEffect, useState } from 'react';
import { Mail, Save, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

type Preferences = {
  marketing_enabled: boolean;
  account_updates_enabled: boolean;
  training_enabled: boolean;
  travel_enabled: boolean;
  property_updates_enabled: boolean;
};

const defaults: Preferences = {
  marketing_enabled: true,
  account_updates_enabled: true,
  training_enabled: true,
  travel_enabled: true,
  property_updates_enabled: true,
};

const EmailPreferencesTab = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('email_preferences')
        .select('marketing_enabled,account_updates_enabled,training_enabled,travel_enabled,property_updates_enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        toast.error('Could not load email preferences');
      } else if (data) {
        setPreferences({ ...defaults, ...data });
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const update = (key: keyof Preferences, value: boolean) =>
    setPreferences((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('email_preferences')
      .upsert({ user_id: user.id, ...preferences, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

    if (error) toast.error(error.message);
    else toast.success('Email preferences saved');
    setSaving(false);
  };

  const items: Array<{ key: keyof Preferences; title: string; description: string }> = [
    {
      key: 'marketing_enabled',
      title: 'News, offers and birthday messages',
      description: 'Receive optional promotional, relationship and birthday emails from Bridgefort Homes.',
    },
    {
      key: 'account_updates_enabled',
      title: 'Account reminders',
      description: 'Receive profile, registration and other account-related reminders. Important security and access messages may still be sent.',
    },
    {
      key: 'training_enabled',
      title: 'Training updates',
      description: 'Receive optional training announcements and reminders.',
    },
    {
      key: 'travel_enabled',
      title: 'Travel updates',
      description: 'Receive optional travel-related updates. Booking confirmations and essential booking communications may still be sent.',
    },
    {
      key: 'property_updates_enabled',
      title: 'Property updates',
      description: 'Receive optional property and allocation updates. Essential transaction and allocation notices may still be sent.',
    },
  ];

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary"><Mail className="h-5 w-5" /></div>
          <div>
            <CardTitle>Email preferences</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose the optional emails you want to receive from Bridgefort Homes.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground flex gap-2">
          <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
          Essential security, password, payment and legally/contractually necessary transaction emails are not controlled by these optional preferences.
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading preferences...</div>
        ) : (
          <div className="divide-y rounded-lg border">
            {items.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch
                  checked={preferences[item.key]}
                  onCheckedChange={(value) => update(item.key, value)}
                  aria-label={item.title}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={save} disabled={loading || saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailPreferencesTab;
