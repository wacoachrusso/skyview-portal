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

const GlobalNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isPrivateRoute = ["/dashboard", "/account", "/chat"].some((path) =>
    location.pathname.startsWith(path)
  );

  // Get user authentication state
  const userName = localStorage.getItem("auth_user_name");
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

  // Choose the appropriate navbar style based on private/public route
  const navbarClasses = isPrivateRoute
    ? "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 backdrop-blur-lg sticky top-0 z-50 shadow-lg border-b border-gray-800/50"
    : "fixed-nav fixed top-0 left-0 right-0 z-50 border-b border-border/40";
    useEffect(() => {
      const storedAuthStatus = localStorage.getItem("auth_status");
      if (storedAuthStatus === "authenticated" || userName) {
        setIsAuthenticated(true);
      }
    }, [userName]);
  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div
          className={`flex justify-between items-center ${
            isPrivateRoute ? "h-16 sm:h-20" : "h-14"
          }`}
        >
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {isAuthenticated ? (
              <>
                <NotificationBell />

                <NavButton
                  to="/chat"
                  icon={<MessageSquare className="h-4 w-4" />}
                >
                  Ask SkyGuide
                </NavButton>

                <NavButton
                  to="/dashboard"
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  hideOnPath
                >
                  Dashboard
                </NavButton>

                <NavButton
                  to="/account"
                  icon={<User className="h-4 w-4" />}
                  hideOnPath
                >
                  Account
                </NavButton>

                {isPrivateRoute && <ChatSettings />}

                {/* User Dropdown */}
                <UserDropdown
                  userName={userName}
                  setIsAuthenticated={setIsAuthenticated}
                />
              </>
            ) : (
              // Public navigation options
              <div className="flex items-center gap-4">
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="text-white hover:text-white/90 cta-button high-contrast-focus"
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
                  className="primary-cta text-white hover:text-white/90 cta-button high-contrast-focus"
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
                  className="text-white/70 hover:text-white hover:bg-white/10 w-8 h-8 transition-colors"
                >
                  <Link to="/chat">
                    <MessageSquare className="h-4 w-4" />
                  </Link>
                </Button>

                {isPrivateRoute && <ChatSettings />}

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
                        className="rounded-md my-1 px-3 py-2 hover:bg-secondary focus:bg-white/10"
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

                    <DropdownMenuSeparator className="bg-gray-700/50" />
                    <DropdownMenuItem
                      className="text-white focus:text-red-400 focus:bg-red-500/10 hover:bg-secondary px-3 py-2 cursor-pointer"
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
                className="text-white hover:text-white/90"
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
