import { Link, useLocation } from "react-router-dom";
import { NotificationBell } from "../NotificationBell";
import { useProfile } from "../../utils/ProfileProvider";
import { Button } from "../../ui/button";
import { LogOut, Menu, MessageSquare, User } from "lucide-react";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../../ui/dropdown-menu";
import { ChatSettings } from "../../chat/ChatSettings";
import { NavButton } from "./NavButton";
import Logo from "./Logo";
const DashboardNavbar = () => {
  const location = useLocation();
  const isAccountPage = location.pathname === "/account";
  const isDashboardPage = location.pathname === "/dashboard";
  const { userName, logout } = useProfile();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  return (
    <nav className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 backdrop-blur-lg sticky top-0 z-50 shadow-lg border-b border-gray-800/50">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <NotificationBell />

            <NavButton to="/chat" icon={<MessageSquare className="h-4 w-4" />}>
              Ask SkyGuide
            </NavButton>

            <NavButton to="/dashboard" hideOnPath>
              Dashboard
            </NavButton>

            <NavButton to="/account" icon={<User className="h-4 w-4" />} hideOnPath>
              Account
            </NavButton>

            <ChatSettings />

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
                className="w-56 bg-slate-900/95 backdrop-blur-lg border border-gray-700 shadow-xl mt-5 "
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
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center space-x-2">
            <NotificationBell />

            <Button
              asChild
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10 w-8 h-8 transition-colors"
            >
              <Link to="/chat">
                <MessageSquare className="h-4 w-4" />
              </Link>
            </Button>
            <ChatSettings />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center space-x-1 hover:bg-white/10 bg-transparent border-none">
                  <Avatar className="h-7 w-7 border border-white/20">
                    <AvatarFallback className="bg-indigo-700 text-white text-xs font-medium">
                      {userName ? userName.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={5}
                className="w-56 bg-slate-900/95 backdrop-blur-lg border border-gray-700 shadow-xl mt-2"
              >
                <DropdownMenuLabel className="text-white/70 px-3 py-2">
                  Hello,{" "}
                  <span className="font-semibold text-white">
                    {userName || "User"}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700/50" />

                {!isDashboardPage && (
                  <DropdownMenuItem
                    asChild
                    className="rounded-md my-1 px-3 py-2 hover:bg-secondary focus:bg-white/10"
                  >
                    <Link to="/dashboard" className="flex items-center w-full">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}

                {!isAccountPage && (
                  <DropdownMenuItem
                    asChild
                    className="rounded-md my-1 px-3 py-2 hover:bg-secondary focus:bg-white/10"
                  >
                    <Link to="/account" className="flex items-center w-full">
                      <User className="mr-2 h-4 w-4" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="bg-gray-700/50" />
                <DropdownMenuItem
                  className="text-whitw focus:text-red-400 focus:bg-red-500/10 hover:bg-secondary -1 px-3 py-2 cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;