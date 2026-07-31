
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xyvspvtdaacqfmfocvhw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5dnNwdnRkYWFjcWZtZm9jdmh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NDQ0MTIsImV4cCI6MjA2MzAyMDQxMn0.BP9KKHlIEbNntxX0DOTzidU-kNzSTBI2tz7SbbXHmMw';

// --- "Remember me" support -------------------------------------------------
// Supabase persists the session in whatever `storage` we give it. By default
// this app always used localStorage, i.e. every login was implicitly
// "remembered" forever. To make an actual Remember Me checkbox meaningful,
// we swap between localStorage (survives closing the browser) and
// sessionStorage (cleared when the tab/browser closes) based on a flag the
// login form sets *before* calling supabase.auth.signInWithPassword.
//
// Default is "remembered" (matches the previous always-persistent behavior),
// so nothing changes for anyone who ignores the new checkbox.
const REMEMBER_FLAG_KEY = 'bf-remember-me';

export function setRememberMe(remember: boolean) {
  try {
    localStorage.setItem(REMEMBER_FLAG_KEY, remember ? 'true' : 'false');
  } catch {
    // localStorage unavailable (e.g. private mode edge cases) - ignore, default applies
  }
}

function isRemembered(): boolean {
  try {
    const v = localStorage.getItem(REMEMBER_FLAG_KEY);
    return v === null ? true : v === 'true';
  } catch {
    return true;
  }
}

const rememberAwareStorage = {
  getItem: (key: string) => {
    try {
      return isRemembered() ? localStorage.getItem(key) : sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      if (isRemembered()) {
        localStorage.setItem(key, value);
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, value);
        localStorage.removeItem(key);
      }
    } catch {
      // ignore storage write failures
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

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
    storage: rememberAwareStorage,
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
