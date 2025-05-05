import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { NotificationBell } from "../shared/NotificationBell";
import { Button } from "../ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { NavButton } from "./NavButton";
import { useProfile } from "../utils/ProfileProvider";
import { ChatSettings } from "../chat/ChatSettings";

const GlobalNavbar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine if we're on a private route
  const isPrivateRoute = ["/dashboard", "/account", "/chat"].some((path) =>
    location.pathname.startsWith(path)
  );

  // Get user authentication state
  const { userName, logout } = useProfile();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const storedAuthStatus = localStorage.getItem("auth_status");
    if (storedAuthStatus === "authenticated" || userName) {
      setIsAuthenticated(true);
    }
  }, [userName]);

  const isAccountPage = location.pathname === "/account";
  const isDashboardPage = location.pathname === "/dashboard";

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("auth_status");
      // Any other local storage items that need to be cleared
      localStorage.clear();
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

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div
          className={`flex justify-between items-center ${
            isPrivateRoute ? "h-16 sm:h-20" : "h-14"
          }`}
        >
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-90 transition-opacity duration-200"
              aria-label="SkyGuide"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center"
              >
                <img
                  src="/lovable-uploads/c54bfa73-7d1d-464c-81d8-df88abe9a73a.png"
                  alt="SkyGuide Logo - Your trusted companion for contract interpretation"
                  className="h-6 w-auto md:h-8"
                  style={{
                    filter: "drop-shadow(0 0 5px rgba(212, 175, 55, 0.3))",
                    transition: "filter 0.3s ease",
                  }}
                />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-foreground text-xl md:text-2xl font-bold rich-text"
              >
                SkyGuide
              </motion.span>
            </Link>
          </div>

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
                    className="w-56 bg-slate-900/95 backdrop-blur-lg border border-gray-700 shadow-xl mt-5"
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
