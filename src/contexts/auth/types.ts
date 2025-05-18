
import { User, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: string | null;
  profile: {
    first_name: string;
    last_name: string;
  } | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
