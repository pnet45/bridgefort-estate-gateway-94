import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

const ProfileCompletionWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfileCompletion();
    }
  }, [user]);

  const fetchProfileCompletion = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (profile) {
        calculateCompletion(profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = (profile: any) => {
    const fields = [
      { key: 'first_name', weight: 10 },
      { key: 'last_name', weight: 10 },
      { key: 'phone_number', weight: 10 },
      { key: 'date_of_birth', weight: 10 },
      { key: 'gender', weight: 5 },
      { key: 'address', weight: 10 },
      { key: 'state_of_origin', weight: 5 },
      { key: 'local_government', weight: 5 },
      { key: 'marital_status', weight: 5 },
      { key: 'occupation', weight: 10 },
      { key: 'next_of_kin_name', weight: 5 },
      { key: 'next_of_kin_relationship', weight: 5 },
      { key: 'next_of_kin_phone', weight: 5 },
      { key: 'next_of_kin_email', weight: 5 },
    ];

    let totalWeight = 0;
    let completedWeight = 0;

    fields.forEach(({ key, weight }) => {
      totalWeight += weight;
      if (profile[key] && profile[key] !== '') {
        completedWeight += weight;
      }
    });

    const percentage = Math.round((completedWeight / totalWeight) * 100);
    setCompletionPercentage(percentage);
  };

  if (loading || !user) return null;

  return (
    <Button
      variant="ghost"
      onClick={() => navigate('/profile')}
      className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50"
    >
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <div className="flex flex-col items-start min-w-[80px]">
          <span className="text-xs text-muted-foreground">Profile</span>
          <div className="flex items-center gap-2 w-full">
            <Progress value={completionPercentage} className="h-1.5 w-12" />
            <span className="text-xs font-medium">{completionPercentage}%</span>
          </div>
        </div>
      </div>
    </Button>
  );
};

export default ProfileCompletionWidget;
