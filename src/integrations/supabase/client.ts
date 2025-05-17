
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

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
