import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cake } from 'lucide-react';

interface UpcomingBirthday {
  id: string;
  name: string;
  date_of_birth: string;
  daysAway: number;
}

const daysUntilNextBirthday = (dob: Date, today: Date) => {
  const next = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// Surfaces registered users whose birthday falls within the next 7 days, and
// generates a one-time admin notification for each (per year) so admins get
// a heads-up even if they don't have this tab open — the actual alert lives
// in the shared notifications table / NotificationBell.
const AdminBirthdayWidget: React.FC = () => {
  const [upcoming, setUpcoming] = useState<UpcomingBirthday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, date_of_birth, birthday_reminder_sent_year')
          .not('date_of_birth', 'is', null);

        if (error) throw error;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentYear = today.getFullYear();

        const withinWeek: UpcomingBirthday[] = [];

        for (const p of profiles || []) {
          const dob = new Date(p.date_of_birth as string);
          if (Number.isNaN(dob.getTime())) continue;

          const daysAway = daysUntilNextBirthday(dob, today);
          if (daysAway > 7) continue;

          const name = `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'A user';
          withinWeek.push({ id: p.id, name, date_of_birth: p.date_of_birth as string, daysAway });

          // Only send the admin notification once per year, exactly 7 days
          // out (or immediately if we're already inside that window and
          // haven't sent one yet this cycle).
          if ((p as any).birthday_reminder_sent_year !== currentYear) {
            await supabase.from('notifications').insert({
              audience: 'admin',
              type: 'birthday',
              title: `Upcoming birthday: ${name}`,
              message: daysAway === 0
                ? `${name}'s birthday is today!`
                : `${name}'s birthday is in ${daysAway} day${daysAway === 1 ? '' : 's'}.`,
              link: '/admin-console',
            });
            await supabase
              .from('profiles')
              .update({ birthday_reminder_sent_year: currentYear })
              .eq('id', p.id);
          }
        }

        withinWeek.sort((a, b) => a.daysAway - b.daysAway);
        setUpcoming(withinWeek);
      } catch (err) {
        console.error('Error checking birthdays:', err);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  if (!loading && upcoming.length === 0) return null;

  return (
    <Card className="border-pink-200 bg-pink-50/50 mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-pink-800">
          <Cake className="h-5 w-5" /> Upcoming Birthdays (next 7 days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-pink-700">Checking...</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {upcoming.map((u) => (
              <span key={u.id} className="inline-flex items-center gap-2 bg-white border border-pink-200 rounded-full px-3 py-1.5 text-sm text-pink-900">
                🎂 {u.name} — {u.daysAway === 0 ? 'Today!' : `in ${u.daysAway}d`}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminBirthdayWidget;
