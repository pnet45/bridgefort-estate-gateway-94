
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { ChevronDown, User, LogOut, Eye } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProfilePreview from '@/components/profile/ProfilePreview';

interface NavbarUserMenuProps {
  profile: any;
  userRole: string | null;
}

const NavbarUserMenu = ({ profile, userRole }: NavbarUserMenuProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [showProfilePreview, setShowProfilePreview] = React.useState(false);

  const getInitials = () => {
    if (!profile) return 'U';
    return `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`;
  };

  const getUserName = () => {
    if (!profile) return 'User';
    return profile.first_name || 'User';
  };

  const getFullName = () => {
    if (!profile) return 'User';
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
  };

  const getProfileImageUrl = () => {
    // Use passport photo if available, otherwise use avatar_url
    if (profile?.kyc_docs && typeof profile.kyc_docs === 'object') {
      const kycData = profile.kyc_docs as any;
      if (kycData.passport_photo) {
        return kycData.passport_photo;
      }
    }
    return profile?.avatar_url || null;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 border-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={getProfileImageUrl() || undefined} alt="Profile picture" />
              <AvatarFallback className="bg-estate-blue text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline">{getUserName()}</span>
            <ChevronDown size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            {getFullName()}
            {userRole && <p className="text-xs text-gray-500 capitalize">{userRole}</p>}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/dashboard')}>
            <User size={16} className="mr-2" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowProfilePreview(true)}>
            <Eye size={16} className="mr-2" />
            View Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut size={16} className="mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Dialog open={showProfilePreview} onOpenChange={setShowProfilePreview}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile Information</DialogTitle>
          </DialogHeader>
          {profile && <ProfilePreview profile={profile} />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NavbarUserMenu;
