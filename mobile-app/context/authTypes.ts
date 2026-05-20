import type { Session, User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  is_pbo?: boolean;
  pbo_referral_code?: string;
  referred_by_code?: string;
  current_rank?: string;
  current_package?: string;
  total_personal_volume?: number;
  wallet_balance?: number;
  total_commissions?: number;
  personally_sponsored_count?: number;
  team_size?: number;
  is_active?: boolean;
}

export type SignUpOptions = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  registerAsPBO: boolean;
  pboCode?: string;
  sponsorCode?: string;
};

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (options: SignUpOptions) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
