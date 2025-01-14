import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { AuthButtons } from "./AuthButtons";
import { MobileMenu } from "./MobileMenu";
import { AskSkyGuideButton } from "./AskSkyGuideButton";

export function NavbarContainer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log('Checking auth state in Navbar');
        setIsLoading(true);

        // First clear any stale session data
        const currentSession = localStorage.getItem('supabase.auth.token');
        if (!currentSession) {
          console.log('No session found in storage');
          if (mounted) {
            setIsLoggedIn(false);
            setIsLoading(false);
          }
          return;
        }

        // Try to refresh the session first
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('Error refreshing session:', refreshError);
          throw refreshError;
        }

        // Get current session after refresh
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          throw sessionError;
        }
        
        if (mounted) {
          if (session?.user) {
            console.log('Valid session found for user:', session.user.email);
            setIsLoggedIn(true);
          } else {
            console.log('No active session found');
            setIsLoggedIn(false);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        if (mounted) {
          setIsLoggedIn(false);
          setIsLoading(false);
          localStorage.removeItem('supabase.auth.token');
        }
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (mounted) {
        setIsLoading(true);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in:', session.user.email);
          setIsLoggedIn(true);
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          console.log('User signed out or deleted');
          setIsLoggedIn(false);
          localStorage.removeItem('supabase.auth.token');
        }
        
        setIsLoading(false);
      }
    });

    return () => {
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

  const handleLogoClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setIsLoading(false);
      navigate('/', { replace: true });
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Error checking session:', error);
      setIsLoggedIn(false);
      setIsLoading(false);
    }
  };

  return (
    <nav className="fixed-nav fixed top-0 left-0 right-0 z-50 border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <Logo handleLogoClick={handleLogoClick} />
          
          {isLoggedIn && !isLoading && <AskSkyGuideButton />}
          
          <div className="hidden md:flex items-center space-x-4">
            <AuthButtons 
              isLoading={isLoading} 
              isLoggedIn={isLoggedIn} 
              scrollToPricing={scrollToPricing}
            />
          </div>

          <MobileMenu 
            isLoggedIn={isLoggedIn}
            isLoading={isLoading}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            scrollToPricing={scrollToPricing}
          />
        </div>
      </div>
    </nav>
  );
}