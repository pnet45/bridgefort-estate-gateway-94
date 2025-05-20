
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { ChevronDown, User, LogOut } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface NavbarUserMenuProps {
  profile: any;
  userRole: string | null;
}

const NavbarUserMenu = ({ profile, userRole }: NavbarUserMenuProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const getInitials = () => {
    if (!profile) return 'U';
    return `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`;
  };

  const getUserName = () => {
    if (!profile) return 'User';
    return `${profile.first_name} ${profile.last_name}`;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 border-0">
          <Avatar className="h-8 w-8">
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
          {getUserName()}
          {userRole && <p className="text-xs text-gray-500 capitalize">{userRole}</p>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/dashboard')}>
          <User size={16} className="mr-2" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut size={16} className="mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavbarUserMenu;
