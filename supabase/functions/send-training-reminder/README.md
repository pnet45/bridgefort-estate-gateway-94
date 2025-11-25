# Training Event Reminder System

This edge function sends automated email reminders to registered users 24 hours before their training event.

## Setup Instructions

### 1. Configure Email Service

To enable email sending, you need to integrate an email service. We recommend using Resend:

1. Sign up at https://resend.com
2. Create an API key at https://resend.com/api-keys
3. Add the API key as a secret in your Supabase project

### 2. Set Up Cron Job

To run this function automatically every day, set up a cron job in your Supabase database:

```sql
-- Enable pg_cron extension
create extension if not exists pg_cron;

-- Schedule the function to run daily at 9 AM
select cron.schedule(
  'send-training-reminders',
  '0 9 * * *', -- Every day at 9:00 AM
  $$
  select
    net.http_post(
        url:='https://xyvspvtdaacqfmfocvhw.supabase.co/functions/v1/send-training-reminder',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5dnNwdnRkYWFjcWZtZm9jdmh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NDQ0MTIsImV4cCI6MjA2MzAyMDQxMn0.BP9KKHlIEbNntxX0DOTzidU-kNzSTBI2tz7SbbXHmMw"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
```

### 3. Uncomment Email Code

Once you have your email service configured, uncomment the email sending code in `index.ts` (lines marked with `TODO`).

### 4. Test the Function

You can manually test the function by calling it:

```bash
curl -X POST https://xyvspvtdaacqfmfocvhw.supabase.co/functions/v1/send-training-reminder \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

## How It Works

1. The function runs daily (via cron job)
2. It calculates tomorrow's date
3. It fetches all training events scheduled for tomorrow
4. For each event, it gets all registrations where `need_reminder = true`
5. It sends an email reminder to each registered user
6. Returns a summary of reminders sent

## Email Template

The email includes:
- Event title
- Date and time
- Location
- Personalized greeting with the registrant's name

## Monitoring

Check the edge function logs in your Supabase dashboard to monitor reminder deliveries:
https://supabase.com/dashboard/project/xyvspvtdaacqfmfocvhw/functions/send-training-reminder/logs
