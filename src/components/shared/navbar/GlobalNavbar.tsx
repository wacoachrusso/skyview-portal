import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { NotificationBell } from "../NotificationBell";
import { Button } from "../../ui/button";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageSquare,
  User,
  Shield,
} from "lucide-react";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { NavButton } from "./NavButton";
import { ChatSettings } from "../../chat/ChatSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Logo from "./Logo";
import UserDropdown from "./UserDropdown";
import { useTheme } from "@/components/theme-provider";
import { useProfile } from "@/components/utils/ProfileProvider";

const GlobalNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();

  const isPrivateRoute = ["/dashboard", "/account", "/chat", "/referrals"].some((path) =>
    location.pathname.startsWith(path)
  );

  // Get user authentication state
  const userName = localStorage.getItem("auth_user_name");
  const  userProfile  = sessionStorage.getItem('cached_user_profile');
  const profile = JSON.parse(userProfile);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const isAccountPage = location.pathname === "/account";
  const isDashboardPage = location.pathname === "/dashboard";

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("auth_status");
      localStorage.removeItem("userName");
      localStorage.clear();
      sessionStorage.removeItem("cached_user_profile");
      sessionStorage.removeItem("cached_auth_user");
      sessionStorage.removeItem("auth_status");
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

  const scrollToPricing = () => {
    const pricingSection = document.getElementById("pricing-section");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Choose the appropriate navbar style based on private/public route and theme
  const privateRouteNavbarClasses =
    theme === "dark"
      ? "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 backdrop-blur-lg sticky top-0 z-50 shadow-lg border-b border-gray-800/50"
      : "bg-gradient-to-br from-sky-100 via-blue-50 to-slate-100 backdrop-blur-lg sticky top-0 z-50 shadow-md border-b border-blue-200/70";

  const publicRouteNavbarClasses =
    theme === "dark"
      ? "fixed-nav fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-slate-900/90 backdrop-blur-lg"
      : "fixed-nav fixed top-0 left-0 right-0 z-50 border-b border-blue-200/50 bg-white/90 backdrop-blur-lg";

  const navbarClasses = isPrivateRoute
    ? privateRouteNavbarClasses
    : publicRouteNavbarClasses;

  // Public route buttons always have consistent styling
  const publicButtonTextColor = "text-gray-800";
  const publicDropdownBgClass = "bg-white border-blue-200 shadow-lg";
  const publicHoverBgClass = "hover:bg-black/10";

  // Private route buttons follow the theme
  const privateTextColor = theme === "dark" ? "text-white" : "text-gray-800";
  const privateDropdownBgClass = theme === "dark" 
    ? "bg-slate-900/95 border-gray-700" 
    : "bg-white border-blue-200 shadow-lg";
  const privateHoverBgClass = theme === "dark" ? "hover:bg-white/10" : "hover:bg-black/10";

  // Use the appropriate styling based on route type
  const textColor = isPrivateRoute ? privateTextColor : publicButtonTextColor;
  const dropdownBgClass = isPrivateRoute ? privateDropdownBgClass : publicDropdownBgClass;
  const hoverBgClass = isPrivateRoute ? privateHoverBgClass : publicHoverBgClass;

  useEffect(() => {
    const storedAuthStatus = localStorage.getItem("auth_status");
    if (storedAuthStatus === "authenticated" || userName) {
      setIsAuthenticated(true);
    }
  }, [userName]);

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-3">
        <div
          className={`flex justify-between items-center ${
            isPrivateRoute ? "h-16 sm:h-14" : "h-14"
          }`}
        >
          {/* Logo */}
          <Logo isPublicRoute={!isPrivateRoute} />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {isAuthenticated ? (
              <>
                <NotificationBell />

                <NavButton
                  to="/chat"
                  icon={<MessageSquare className="h-4 w-4" />}
                  isPublicRoute={!isPrivateRoute}
                >
                  Ask SkyGuide
                </NavButton>

                <NavButton
                  to="/dashboard"
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  hideOnPath
                  isPublicRoute={!isPrivateRoute}
                >
                  Dashboard
                </NavButton>

                <NavButton
                  to="/account"
                  icon={<User className="h-4 w-4" />}
                  hideOnPath
                  isPublicRoute={!isPrivateRoute}
                >
                  Account
                </NavButton>

                {/* Admin Dashboard Button - only show if user is admin and on dashboard */}
                {profile?.is_admin && isDashboardPage && (
                  <NavButton
                    to="/admin"
                    icon={<Shield className="h-4 w-4" />}
                    isPublicRoute={!isPrivateRoute}
                  >
                    Admin Dashboard
                  </NavButton>
                )}

                {isPrivateRoute && <ChatSettings />}

                {/* User Dropdown */}
                <UserDropdown
                  userName={userName}
                  setIsAuthenticated={setIsAuthenticated}
                  isPublicRoute={!isPrivateRoute}
                />
              </>
            ) : (
              // Public navigation options
              <div className="flex items-center gap-4">
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className={`text-white hover:opacity-90 cta-button high-contrast-focus`}
                  aria-label="Sign in to your account"
                >
                  <Link to="/login">
                    <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>Sign In</span>
                  </Link>
                </Button>

                <Button
                  onClick={scrollToPricing}
                  size="sm"
                  variant="default"
                  className={`primary-cta tezt-white hover:opacity-90 cta-button high-contrast-focus`}
                  aria-label="Get started with a free trial"
                >
                  Get Started Free
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center space-x-2">
            {isAuthenticated ? (
              <>
                <NotificationBell />

                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className={`text-[#ffffff] ${hoverBgClass} w-8 h-8 transition-colors`}
                >
                  <Link to="/chat">
                    <MessageSquare className="h-4 w-4" />
                  </Link>
                </Button>

                {/* Admin button for mobile - only show if user is admin and on dashboard */}
                {profile?.is_admin && isDashboardPage && (
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className={`text-[#ffffff] ${hoverBgClass} w-8 h-8 transition-colors`}
                  >
                    <Link to="/admin">
                      <Shield className="h-4 w-4" />
                    </Link>
                  </Button>
                )}

                {isPrivateRoute && <ChatSettings />}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className={`flex items-center space-x-1 ${hoverBgClass} bg-transparent border-none`}
                    >
                      <Avatar
                        className={`h-7 w-7 border ${
                          isPrivateRoute && theme === "dark"
                            ? "border-white/20"
                            : "border-black/20"
                        }`}
                      >
                        <AvatarFallback className="bg-indigo-700 text-white text-xs font-medium">
                          {userName ? userName.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={5}
                    className={`w-56 ${dropdownBgClass} backdrop-blur-lg shadow-xl mt-2`}
                  >
                    <DropdownMenuLabel
                      className={
                        isPrivateRoute && theme === "dark"
                          ? "text-white/70 px-3 py-2"
                          : "text-gray-600 px-3 py-2"
                      }
                    >
                      Hello,{" "}
                      <span
                        className={
                          isPrivateRoute && theme === "dark"
                            ? "font-semibold text-white"
                            : "font-semibold text-gray-900"
                        }
                      >
                        {userName || "User"}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator
                      className={
                        isPrivateRoute && theme === "dark" ? "bg-gray-700/50" : "bg-gray-300/50"
                      }
                    />

                    {!isDashboardPage && (
                      <DropdownMenuItem
                        asChild
                        className={`rounded-md my-1 px-3 py-2 hover:bg-secondary focus:${
                          isPrivateRoute && theme === "dark" ? "bg-white/10" : "bg-black/10"
                        }`}
                      >
                        <Link
                          to="/dashboard"
                          className="flex items-center w-full"
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {!isAccountPage && (
                      <DropdownMenuItem
                        asChild
                        className={`rounded-md my-1 px-3 py-2 hover:bg-secondary focus:${
                          isPrivateRoute && theme === "dark" ? "bg-white/10" : "bg-black/10"
                        }`}
                      >
                        <Link
                          to="/account"
                          className="flex items-center w-full"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Account
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {/* Admin Dashboard in mobile dropdown - only show if user is admin and on dashboard */}
                    {profile?.is_admin && isDashboardPage && (
                      <DropdownMenuItem
                        asChild
                        className={`rounded-md my-1 px-3 py-2 hover:bg-secondary focus:${
                          isPrivateRoute && theme === "dark" ? "bg-white/10" : "bg-black/10"
                        }`}
                      >
                        <Link
                          to="/admin"
                          className="flex items-center w-full"
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator
                      className={
                        isPrivateRoute && theme === "dark" ? "bg-gray-700/50" : "bg-gray-300/50"
                      }
                    />
                    <DropdownMenuItem
                      className={`${textColor} focus:text-red-400 focus:bg-red-500/10 hover:bg-secondary px-3 py-2 cursor-pointer`}
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Mobile public navigation
              <Button
                asChild
                variant="secondary"
                size="sm"
                className={`text-[#ffffff] hover:opacity-90`}
                aria-label="Sign in to your account"
              >
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>Sign In</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GlobalNavbar;