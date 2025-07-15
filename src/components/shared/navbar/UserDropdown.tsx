import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { useAuthStore } from "@/stores/authStores";
interface UserDropdownProps {
  setIsAuthenticated?: React.Dispatch<React.SetStateAction<boolean>>;
  isPublicRoute?: boolean;
  userName: string;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
  setIsAuthenticated,
  isPublicRoute = false,
  userName,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const { logout: storeLogout } = useAuthStore();
  const handleSignOut = async () => {
    try {
      await storeLogout();

      // If setIsAuthenticated is provided, call it for backward compatibility
      if (setIsAuthenticated) {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error during sign out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  // Styling based on route type
  if (isPublicRoute) {
    // Public route styling (consistent regardless of theme)
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className="focus-visible:ring-0 bg-transparent hover:bg-transparent"
        >
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 ml-2 text-gray-800 transition-colors focus:outline-none focus-visible:ring-0"
          >
            <Avatar className="h-8 w-8 border border-gray-300">
              <AvatarFallback className="bg-indigo-700 text-white font-medium">
                {userName ? userName.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <span className="hidden lg:inline text-sm text-white">
              {userName || "User"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          sideOffset={5}
          className="w-56 bg-slate-900/95 border-gray-700 backdrop-blur-lg shadow-xl mt-4"
        >
          <DropdownMenuLabel className="text-white/70">
            Signed in as{" "}
            <span className="font-semibold text-white/90">
              {userName || "User"}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-300/50" />
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
  }

  // Private route styling (theme-aware)
  const textColor = theme === "dark" ? "text-white" : "text-gray-800";
  const textColorMuted = theme === "dark" ? "text-white/90" : "text-gray-600";
  const dropdownBgClass =
    theme === "dark"
      ? "bg-slate-900/95 border-gray-700"
      : "bg-white/95 border-gray-300";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="focus-visible:ring-0">
        <Button
          size="sm"
          className={`flex items-center space-x-2 ml-2 bg-transparent hover:bg-transparent ${textColor} transition-colors focus:outline-none focus-visible:ring-0`}
        >
          <Avatar
            className={`h-8 w-8 border ${
              theme === "dark" ? "border-white/20" : "border-gray-300"
            }`}
          >
            <AvatarFallback className="bg-indigo-700 text-white font-medium">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <span className={`hidden lg:inline text-sm ${textColorMuted}`}>
            {userName || "User"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        sideOffset={5}
        className={`w-56 ${dropdownBgClass} backdrop-blur-lg shadow-xl mt-4`}
      >
        <DropdownMenuLabel
          className={theme === "dark" ? "text-white/70" : "text-gray-600"}
        >
          Signed in as{" "}
          <span
            className={
              theme === "dark"
                ? "font-semibold text-white"
                : "font-semibold text-gray-900"
            }
          >
            {userName || "User"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator
          className={theme === "dark" ? "bg-gray-700/50" : "bg-gray-300/50"}
        />
        <DropdownMenuItem
          onClick={handleSignOut}
          className={`${
            theme === "dark" ? "text-white" : "text-gray-800"
          } focus:text-red-400 focus:bg-red-500/10 hover:bg-secondary my-1 cursor-pointer`}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
