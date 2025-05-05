import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { LogOut } from 'lucide-react';
import { useProfile } from '../../utils/ProfileProvider';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserDropdownProps{
  userName: string;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}
const UserDropdown: React.FC<UserDropdownProps> = ({setIsAuthenticated, userName}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
    const logout = async () => {
      try {
        await supabase.auth.signOut();
        
        localStorage.removeItem("auth_status");
        localStorage.removeItem("userName");
        localStorage.clear();
        sessionStorage.removeItem("cached_user_profile");
        sessionStorage.removeItem("cached_auth_user");
        setIsAuthenticated(false);
        navigate("/login");
      } catch (error) {
        console.error("Error during logout:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to sign out. Please try again.",
        });
      }
    };
    const handleSignOut = async () => {
      try {
        await logout();
      } catch (error) {
        console.error("Error during sign out:", error);
      }
    };
  
    return (
        <DropdownMenu>
              <DropdownMenuTrigger asChild className="focus-visible:ring-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 ml-2 hover:bg-transparent hover:text-white transition-colors focus:outline-none focus-visible:ring-0"
                >
                  <Avatar className="h-8 w-8 border border-white/20">
                    <AvatarFallback className="bg-indigo-700 text-white font-medium">
                      {userName ? userName.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline text-sm text-white/90">
                    {userName || "User"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                sideOffset={5}
                className="w-56 bg-slate-900/95 backdrop-blur-lg border border-gray-700 shadow-xl mt-2"
              >
                <DropdownMenuLabel className="text-white/70">
                  Signed in as{" "}
                  <span className="font-semibold text-white">
                    {userName || "User"}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700/50" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-white focus:text-red-400 focus:bg-red-500/10 hover:bg-secondary my-1 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
    );
};

export default UserDropdown;