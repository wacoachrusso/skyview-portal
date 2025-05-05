import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { NotificationBell } from "../NotificationBell";
import { Button } from "../../ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { LayoutDashboard, LogIn, MessageSquare, User } from "lucide-react";
import { NavButton } from "./NavButton";
import UserDropdown from "./UserDropdown";
const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const storedAuthStatus = localStorage.getItem("auth_status");
  useEffect(() => {
    if (storedAuthStatus === "authenticated") {
      setIsAuthenticated(true);
    }
  }, []);
  const scrollToPricing = () => {
    const pricingSection = document.getElementById("pricing-section");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  return (
    <nav className="fixed-nav fixed top-0 left-0 right-0 z-50 border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
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

          <div className="hidden md:flex items-center space-x-4">
            {/* First put NavbarActions for logged-in users */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <NotificationBell />
                <NavButton
                  to="/chat"
                  icon={<MessageSquare className="h-4 w-4" />}
                >
                  Ask SkyGuide
                </NavButton>

                <NavButton to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} hideOnPath>
                  Dashboard
                </NavButton>

                <NavButton
                  to="/account"
                  icon={<User className="h-4 w-4" />}
                  hideOnPath
                >
                  Account
                </NavButton>
                <UserDropdown/>
              </div>
            ) : (
              <div
                className={`flex ${
                  isMobile ? "flex-col w-full gap-2" : "items-center gap-4"
                }`}
              >
                <Button
                  asChild
                  variant={isMobile ? "ghost" : "secondary"}
                  size="sm"
                  className={`${
                    isMobile
                      ? "w-full justify-start"
                      : "text-white hover:text-white/90"
                  } cta-button high-contrast-focus`}
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
                  variant={isMobile ? "ghost" : "default"}
                  className={`${
                    isMobile
                      ? "w-full justify-start"
                      : "primary-cta text-white hover:text-white/90"
                  } cta-button high-contrast-focus`}
                  aria-label="Get started with a free trial"
                >
                  Get Started Free
                </Button>
              </div>
            )}
          </div>

          {/* <MobileMenu
            isLoggedIn={isLoggedIn}
            isLoading={isLoading}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            scrollToPricing={scrollToPricing}
          /> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
