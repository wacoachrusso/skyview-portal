import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, MessageSquare, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { NotificationBell } from "@/components/shared/NotificationBell";

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking auth state in Navbar');
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
        if (session?.user) {
          console.log('User is logged in:', session.user.email);
          setUserEmail(session.user.email || "");
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      setIsLoggedIn(event === 'SIGNED_IN');
      if (session?.user) {
        setUserEmail(session.user.email || "");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing-section');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/', { state: { fromNavbar: true } });
  };

  if (isLoading) {
    return (
      <nav className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14 md:h-16">
          <a 
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
              alt="SkyGuide Logo" 
              className="h-6 w-auto md:h-8"
            />
            <span className="text-foreground text-base md:text-lg font-bold">SkyGuide</span>
          </a>
          <div className="flex items-center gap-2 md:gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden md:inline">Welcome back, {userEmail}</span>
                <NotificationBell />
                <Button 
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-accent"
                >
                  <Link to="/chat">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat Now
                  </Link>
                </Button>
                <Button 
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-accent"
                >
                  <Link to="/account">
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </Link>
                </Button>
                <Button 
                  asChild
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link to="/dashboard">
                    Dashboard
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-3">
                <Button 
                  asChild 
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-accent"
                >
                  <Link to="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button 
                  onClick={scrollToPricing}
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}