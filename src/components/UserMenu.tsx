import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn, User, Settings, Crown, Shield, Users, ChevronDown, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  user: { username: string; role: string; id?: string } | null;
  onLogout: () => void;
  isAdminPage?: boolean;
}

const UserMenu = ({ user, onLogout, isAdminPage = false }: UserMenuProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('adminToken');
    onLogout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const handleAdminPanel = () => {
    navigate('/admin');
  };

  const handleBackToWebsite = () => {
    navigate('/');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Crown size={16} className="text-yellow-600 mr-2" />;
      case 'admin':
        return <Shield size={16} className="text-blue-600 mr-2" />;
      case 'user':
        return <Users size={16} className="text-green-600 mr-2" />;
      case 'guest':
        return <Users size={16} className="text-gray-600 mr-2" />;
      default:
        return <User size={16} className="text-yoga-sage mr-2" />;
    }
  };

  if (!user) return null;

  const isAdmin = user.role === 'admin' || user.role === 'superadmin';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1 border-yoga-sage text-yoga-forest hover:bg-yoga-sage/10 px-3">
          {getRoleIcon(user.role)}
          <span className="font-medium truncate max-w-[100px]">{user.username}</span>
          <ChevronDown size={14} className="opacity-50 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-yoga-forest">{user.username}</p>
            <p className="text-xs leading-none text-yoga-sage capitalize">
              Role: {user.role}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin && !isAdminPage && (
          <DropdownMenuItem onClick={handleAdminPanel} className="cursor-pointer text-yoga-forest focus:bg-yoga-sage/10 focus:text-yoga-forest">
            <Settings className="mr-2 h-4 w-4" />
            <span>Admin Panel</span>
          </DropdownMenuItem>
        )}
        {isAdminPage && (
          <DropdownMenuItem onClick={handleBackToWebsite} className="cursor-pointer text-yoga-forest focus:bg-yoga-sage/10 focus:text-yoga-forest">
            <Home className="mr-2 h-4 w-4" />
            <span>Back to Website</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
          <LogIn className="mr-2 h-4 w-4 rotate-180" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
