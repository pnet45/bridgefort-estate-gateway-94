import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Mail, Search, Users, Filter, Send } from 'lucide-react';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email?: string;
  phone_number: string | null;
  profile_completion_percentage: number | null;
  profile_completed: boolean | null;
  created_at: string | null;
}

const ProfilesManagementTab = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [completionFilter, setCompletionFilter] = useState<string>('all');
  const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set());
  const [sendingEmails, setSendingEmails] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchTerm, completionFilter]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch emails from auth.users
      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
      }

      // Merge profiles with emails
      const profilesWithEmails = profilesData?.map(profile => {
        const user = usersData?.users?.find((u: any) => u.id === profile.id);
        return {
          ...profile,
          email: user?.email
        };
      }) || [];

      setProfiles(profilesWithEmails);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Failed to load user profiles');
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = [...profiles];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(profile => 
        profile.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Completion filter
    if (completionFilter !== 'all') {
      filtered = filtered.filter(profile => {
        const percentage = profile.profile_completion_percentage || 0;
        switch (completionFilter) {
          case 'incomplete':
            return percentage < 70;
          case 'partial':
            return percentage >= 30 && percentage < 70;
          case 'complete':
            return percentage >= 70;
          case 'low':
            return percentage < 30;
          default:
            return true;
        }
      });
    }

    setFilteredProfiles(filtered);
  };

  const toggleProfileSelection = (profileId: string) => {
    const newSelected = new Set(selectedProfiles);
    if (newSelected.has(profileId)) {
      newSelected.delete(profileId);
    } else {
      newSelected.add(profileId);
    }
    setSelectedProfiles(newSelected);
  };

  const selectIncompleteProfiles = () => {
    const incompleteIds = new Set(
      filteredProfiles
        .filter(p => (p.profile_completion_percentage || 0) < 70)
        .map(p => p.id)
    );
    setSelectedProfiles(incompleteIds);
    toast.success(`Selected ${incompleteIds.size} incomplete profiles`);
  };

  const sendBulkReminders = async () => {
    if (selectedProfiles.size === 0) {
      toast.error('Please select at least one profile');
      return;
    }

    setSendingEmails(true);
    try {
      const selectedProfilesData = profiles.filter(p => selectedProfiles.has(p.id));
      
      const { data, error } = await supabase.functions.invoke('send-profile-completion-reminder', {
        body: { 
          profiles: selectedProfilesData.map(p => ({
            email: p.email,
            first_name: p.first_name,
            completion_percentage: p.profile_completion_percentage
          }))
        }
      });

      if (error) throw error;

      toast.success(`Successfully sent reminders to ${selectedProfiles.size} users`);
      setSelectedProfiles(new Set());
    } catch (error) {
      console.error('Error sending reminders:', error);
      toast.error('Failed to send email reminders');
    } finally {
      setSendingEmails(false);
    }
  };

  const getCompletionBadge = (percentage: number | null) => {
    const value = percentage || 0;
    if (value >= 70) return <Badge className="bg-success">Complete</Badge>;
    if (value >= 30) return <Badge className="bg-warning">Partial</Badge>;
    return <Badge variant="destructive">Incomplete</Badge>;
  };

  const stats = {
    total: profiles.length,
    complete: profiles.filter(p => (p.profile_completion_percentage || 0) >= 70).length,
    incomplete: profiles.filter(p => (p.profile_completion_percentage || 0) < 70).length,
    avgCompletion: profiles.length > 0
      ? Math.round(profiles.reduce((sum, p) => sum + (p.profile_completion_percentage || 0), 0) / profiles.length)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Profiles</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Complete (≥70%)</CardDescription>
            <CardTitle className="text-3xl text-success">{stats.complete}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Incomplete (&lt;70%)</CardDescription>
            <CardTitle className="text-3xl text-destructive">{stats.incomplete}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Completion</CardDescription>
            <CardTitle className="text-3xl">{stats.avgCompletion}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Profiles Management
              </CardTitle>
              <CardDescription>View, filter, and send completion reminders to users</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={selectIncompleteProfiles}
                disabled={loading}
              >
                <Filter className="h-4 w-4 mr-2" />
                Select Incomplete
              </Button>
              <Button
                onClick={sendBulkReminders}
                disabled={selectedProfiles.size === 0 || sendingEmails}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Reminders ({selectedProfiles.size})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={completionFilter} onValueChange={setCompletionFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by completion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Profiles</SelectItem>
                <SelectItem value="complete">Complete (≥70%)</SelectItem>
                <SelectItem value="partial">Partial (30-69%)</SelectItem>
                <SelectItem value="low">Low (&lt;30%)</SelectItem>
                <SelectItem value="incomplete">Incomplete (&lt;70%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Profiles List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading profiles...</div>
            ) : filteredProfiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No profiles found</div>
            ) : (
              filteredProfiles.map((profile) => (
                <Card key={profile.id} className={selectedProfiles.has(profile.id) ? 'border-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedProfiles.has(profile.id)}
                        onChange={() => toggleProfileSelection(profile.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">
                              {profile.first_name && profile.last_name
                                ? `${profile.first_name} ${profile.last_name}`
                                : 'Unnamed User'}
                            </h4>
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                            {profile.phone_number && (
                              <p className="text-sm text-muted-foreground">{profile.phone_number}</p>
                            )}
                          </div>
                          {getCompletionBadge(profile.profile_completion_percentage)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Profile Completion</span>
                            <span className="font-medium">{profile.profile_completion_percentage || 0}%</span>
                          </div>
                          <Progress value={profile.profile_completion_percentage || 0} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilesManagementTab;
