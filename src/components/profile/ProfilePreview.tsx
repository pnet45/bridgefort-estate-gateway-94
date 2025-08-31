import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Briefcase, Calendar } from 'lucide-react';
import { UserProfile } from '@/contexts/auth/authTypes';

interface ProfilePreviewProps {
  profile: UserProfile;
}

const ProfilePreview = ({ profile }: ProfilePreviewProps) => {
  const getInitials = () => {
    return `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`;
  };

  const getProfileImageUrl = () => {
    // Use passport photo if available, otherwise use avatar_url
    if (profile.kyc_docs && typeof profile.kyc_docs === 'object') {
      const kycData = profile.kyc_docs as any;
      if (kycData.passport_photo) {
        return kycData.passport_photo;
      }
    }
    return profile.avatar_url || null;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={getProfileImageUrl() || undefined} alt="Profile picture" />
            <AvatarFallback className="bg-estate-blue text-white text-lg">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-2xl">
          {profile.first_name} {profile.last_name}
        </CardTitle>
        <div className="flex justify-center gap-2 mt-2">
          <Badge variant={profile.profile_completed ? "default" : "secondary"}>
            {profile.profile_completed ? "Profile Complete" : "Profile Incomplete"}
          </Badge>
          {profile.is_pbo && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              PBO
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{profile.email || 'No email provided'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{profile.phone_number || 'No phone provided'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{profile.address || 'No address provided'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{profile.occupation || 'No occupation provided'}</span>
          </div>
          
          {profile.date_of_birth && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {new Date(profile.date_of_birth).toLocaleDateString()}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{profile.gender || 'Not specified'}</span>
          </div>
        </div>
        
        {profile.next_of_kin_name && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Next of Kin</h4>
            <div className="text-sm text-muted-foreground">
              <p>{profile.next_of_kin_name} ({profile.next_of_kin_relationship})</p>
              {profile.next_of_kin_phone && <p>Phone: {profile.next_of_kin_phone}</p>}
              {profile.next_of_kin_email && <p>Email: {profile.next_of_kin_email}</p>}
            </div>
          </div>
        )}
        
        {profile.pbo_referral_code && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">PBO Information</h4>
            <div className="text-sm text-muted-foreground">
              <p>Referral Code: <span className="font-mono">{profile.pbo_referral_code}</span></p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfilePreview;