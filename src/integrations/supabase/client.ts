
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xyvspvtdaacqfmfocvhw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5dnNwdnRkYWFjcWZtZm9jdmh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NDQ0MTIsImV4cCI6MjA2MzAyMDQxMn0.BP9KKHlIEbNntxX0DOTzidU-kNzSTBI2tz7SbbXHmMw';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // PKCE flow: Supabase generates a code_verifier on sign-in, exchanges
    // it for a session via exchangeCodeForSession() in AuthCallback.tsx.
    // Without this, the client defaults to implicit flow (hash-based tokens)
    // which is incompatible with the callback's code-exchange logic.
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Types for database tables to fix TypeScript errors
export type Tables = {
  profiles: {
    id: string;
    first_name: string;
    last_name: string;
    created_at: string;
    updated_at: string;
  };
  user_roles: {
    id: string;
    user_id: string;
    role: 'admin' | 'manager' | 'team_leader' | 'associate';
    created_at: string;
  };
  posts: {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    author_id: string;
    image_path: string;
    category: string;
    published: boolean;
    created_at: string;
    updated_at: string;
    profiles?: {
      first_name: string;
      last_name: string;
    };
  };
};
