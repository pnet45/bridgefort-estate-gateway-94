
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
  current_rank?: string;
  current_package?: string;
  total_personal_volume?: number;
  wallet_balance?: number;
  total_commissions?: number;
  personally_sponsored_count?: number;
  team_size?: number;
  is_active?: boolean;
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
  registration_expires_at?: string | null;
  renewal_reminder_sent_at?: string | null;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  userRole: string | null;
  roles: string[];
  permissions: string[];
  loading: boolean;
  isLoading: boolean; // Add alias for compatibility
  hasPermission: (permission: string | string[]) => boolean;
  hasMailboxAccess: (mailboxEmail: string | null | undefined, provider?: 'gmail' | 'resend' | string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any; data?: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: any }>;
}
