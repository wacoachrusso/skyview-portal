import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Logo } from "./navbar/Logo";
import { AuthButtons } from "./navbar/AuthButtons";
import { Menu, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log('Checking auth state in Navbar');
        
        // First clear any existing session to ensure clean state
        const { error: clearError } = await supabase.auth.signOut({ scope: 'local' });
        if (clearError) {
          console.error("Error clearing existing session:", clearError);
        }

        // Get fresh session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            setIsLoggedIn(false);
            setIsLoading(false);
          }
          return;
        }

        if (!session) {
          console.log('No active session found');
          if (mounted) {
            setIsLoggedIn(false);
            setIsLoading(false);
          }
          return;
        }

        // Verify the session is still valid
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('Error getting user or no user found:', userError);
          if (mounted) {
            setIsLoggedIn(false);
            setIsLoading(false);
          }
          return;
        }

        console.log('Valid session found for user:', user.email);
        if (mounted) {
          setIsLoggedIn(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        if (mounted) {
          setIsLoggedIn(false);
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      if (mounted) {
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in:', session.user.email);
          setIsLoggedIn(true);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setIsLoggedIn(false);
        }
        setIsLoading(false);
      }
    });

    return () => {
      console.log("Navbar cleanup");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing-section');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/', { state: { fromNavbar: true } });
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Logo handleLogoClick={handleLogoClick} />
          
          {/* Center Ask SkyGuide Button - Desktop Only */}
          {isLoggedIn && (
            <div className="hidden md:flex justify-center flex-1">
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="text-white hover:bg-brand-gold hover:text-black"
              >
                <Link to="/chat">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Ask SkyGuide
                </Link>
              </Button>
            </div>
          )}
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <AuthButtons 
              isLoading={isLoading} 
              isLoggedIn={isLoggedIn} 
              scrollToPricing={scrollToPricing}
            />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            {isLoggedIn && (
              <AuthButtons 
                isLoading={isLoading} 
                isLoggedIn={isLoggedIn} 
                scrollToPricing={scrollToPricing}
                isMobile={true}
                showChatOnly={true}
              />
            )}
            <DropdownMenu 
              open={isMobileMenuOpen} 
              onOpenChange={setIsMobileMenuOpen}
            >
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 text-foreground hover:bg-accent rounded-md transition-colors"
                  aria-label="Toggle menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end"
                className="w-56 bg-background/95 backdrop-blur-sm border border-border mt-2"
              >
                <div className="p-2">
                  <AuthButtons 
                    isLoading={isLoading} 
                    isLoggedIn={isLoggedIn} 
                    scrollToPricing={scrollToPricing}
                    isMobile={true}
                    showChatOnly={false}
                  />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}