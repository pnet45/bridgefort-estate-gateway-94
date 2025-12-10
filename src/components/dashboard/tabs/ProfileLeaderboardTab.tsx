import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Medal, Award, Crown, Star } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  profile_picture_url: string | null;
  profile_completion_percentage: number | null;
  profile_completed: boolean | null;
}

const getBadge = (rank: number, percentage: number) => {
  if (percentage >= 100) {
    return { icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Champion' };
  }
  if (percentage >= 90) {
    return { icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Gold' };
  }
  if (percentage >= 80) {
    return { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-400/10', label: 'Silver' };
  }
  if (percentage >= 70) {
    return { icon: Award, color: 'text-orange-600', bg: 'bg-orange-600/10', label: 'Bronze' };
  }
  return { icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Rising' };
};

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/50';
    case 2:
      return 'bg-gradient-to-r from-gray-300/20 to-gray-400/10 border-gray-400/50';
    case 3:
      return 'bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-orange-500/50';
    default:
      return 'bg-card border-border';
  }
};

export const ProfileLeaderboardTab = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, profile_picture_url, profile_completion_percentage, profile_completed')
        .order('profile_completion_percentage', { ascending: false })
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const topThree = users.slice(0, 3);
  const restOfUsers = users.slice(3);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Profile Completion Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* Second Place */}
            <div className="flex flex-col items-center pt-8">
              {topThree[1] && (
                <div className={`p-4 rounded-xl border-2 ${getRankStyle(2)} w-full text-center`}>
                  <div className="relative inline-block mb-2">
                    <Avatar className="h-16 w-16 border-2 border-gray-400">
                      <AvatarImage src={topThree[1].profile_picture_url || ''} />
                      <AvatarFallback className="bg-gray-400/20">
                        {topThree[1].first_name?.[0]}{topThree[1].last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                  </div>
                  <p className="font-semibold text-sm truncate">
                    {topThree[1].first_name} {topThree[1].last_name}
                  </p>
                  <p className="text-2xl font-bold text-gray-400">
                    {topThree[1].profile_completion_percentage || 0}%
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    <Medal className="h-3 w-3 mr-1" />
                    Silver
                  </Badge>
                </div>
              )}
            </div>

            {/* First Place */}
            <div className="flex flex-col items-center">
              {topThree[0] && (
                <div className={`p-4 rounded-xl border-2 ${getRankStyle(1)} w-full text-center`}>
                  <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="relative inline-block mb-2">
                    <Avatar className="h-20 w-20 border-2 border-yellow-500">
                      <AvatarImage src={topThree[0].profile_picture_url || ''} />
                      <AvatarFallback className="bg-yellow-500/20">
                        {topThree[0].first_name?.[0]}{topThree[0].last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                  </div>
                  <p className="font-semibold truncate">
                    {topThree[0].first_name} {topThree[0].last_name}
                  </p>
                  <p className="text-3xl font-bold text-yellow-500">
                    {topThree[0].profile_completion_percentage || 0}%
                  </p>
                  <Badge className="mt-1 bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30">
                    <Trophy className="h-3 w-3 mr-1" />
                    Champion
                  </Badge>
                </div>
              )}
            </div>

            {/* Third Place */}
            <div className="flex flex-col items-center pt-12">
              {topThree[2] && (
                <div className={`p-4 rounded-xl border-2 ${getRankStyle(3)} w-full text-center`}>
                  <div className="relative inline-block mb-2">
                    <Avatar className="h-14 w-14 border-2 border-orange-500">
                      <AvatarImage src={topThree[2].profile_picture_url || ''} />
                      <AvatarFallback className="bg-orange-500/20">
                        {topThree[2].first_name?.[0]}{topThree[2].last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                  </div>
                  <p className="font-semibold text-sm truncate">
                    {topThree[2].first_name} {topThree[2].last_name}
                  </p>
                  <p className="text-xl font-bold text-orange-500">
                    {topThree[2].profile_completion_percentage || 0}%
                  </p>
                  <Badge variant="secondary" className="mt-1 bg-orange-500/20 text-orange-600">
                    <Award className="h-3 w-3 mr-1" />
                    Bronze
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Rest of Leaderboard */}
          <div className="space-y-2">
            {restOfUsers.map((user, index) => {
              const rank = index + 4;
              const percentage = user.profile_completion_percentage || 0;
              const badge = getBadge(rank, percentage);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-8 text-center font-bold text-muted-foreground">
                    #{rank}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profile_picture_url || ''} />
                    <AvatarFallback>
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {user.first_name} {user.last_name}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded ${badge.bg}`}>
                    <BadgeIcon className={`h-4 w-4 ${badge.color}`} />
                    <span className={`text-xs font-medium ${badge.color}`}>{badge.label}</span>
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-lg font-bold">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {users.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No users found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
