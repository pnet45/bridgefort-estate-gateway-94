-- Add profile completion percentage column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0;

-- Add check constraint to ensure percentage is between 0 and 100
ALTER TABLE profiles ADD CONSTRAINT profile_completion_percentage_range 
CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100);