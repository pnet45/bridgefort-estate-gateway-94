
import { supabase } from '../../integrations/supabase/client';
import { UserProfile } from './authTypes';

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};

export const fetchUserRole = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error - normal for users without roles
      console.error('Error fetching user role:', error);
      return null;
    }

    return data?.role || null;
  } catch (error) {
    console.error('Error in fetchUserRole:', error);
    return null;
  }
};

export const createUserProfile = async (userId: string, firstName: string, lastName: string): Promise<void> => {
  try {
    await supabase.from('profiles').insert([
      {
        id: userId,
        first_name: firstName,
        last_name: lastName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);
  } catch (profileError) {
    console.error('Error creating profile:', profileError);
  }
};
