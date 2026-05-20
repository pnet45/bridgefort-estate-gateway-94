
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  avatar_url?: string;
  updated_at?: string;
  phone_number?: string;
  address?: string;
  profile_completed?: boolean;
  pbo_referral_code?: string;
  is_pbo?: boolean;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  occupation?: string;
  next_of_kin_name?: string;
  next_of_kin_relationship?: string;
  next_of_kin_phone?: string;
  next_of_kin_email?: string;
  kyc_docs?: any;
  referred_by_id?: string | null;
  referred_by_code?: string | null;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  userRole: string | null;
  loading: boolean;
  isLoading: boolean; // Add alias for compatibility
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any; data?: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: any }>;
}
