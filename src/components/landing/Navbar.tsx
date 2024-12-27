import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogIn, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { ChatSettings } from "@/components/chat/ChatSettings";

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      if (session?.user) {
        setUserEmail(session.user.email || "");
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14 md:h-16">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
              alt="SkyGuide Logo" 
              className="h-6 w-auto md:h-8"
            />
            <span className="text-foreground text-base md:text-lg font-bold">SkyGuide</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden md:inline">Welcome back, {userEmail}</span>
                <Button 
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  <Link to="/chat">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat Now
                  </Link>
                </Button>
                <Button 
                  asChild
                  size="sm"
                  className="bg-brand-navy text-white hover:bg-brand-navy/90"
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
                  className="text-white hover:bg-white/10"
                >
                  <Link to="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button 
                  onClick={scrollToPricing}
                  size="sm"
                  className="bg-brand-navy text-white hover:bg-brand-navy/90"
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