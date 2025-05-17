
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anonymous key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the required values are present
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or key in environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

// Create the Supabase client with fallback values for development
export const supabase = createClient(
  supabaseUrl || 'https://xyvspvtdaacqfmfocvhw.supabase.co',
  supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5dnNwdnRkYWFjcWZtZm9jdmh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NDQ0MTIsImV4cCI6MjA2MzAyMDQxMn0.BP9KKHlIEbNntxX0DOTzidU-kNzSTBI2tz7SbbXHmMw'
);

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
