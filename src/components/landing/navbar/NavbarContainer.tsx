import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { Logo } from "./Logo";
import { AuthButtons } from "./AuthButtons";
import { MobileMenu } from "./MobileMenu";
import { AskSkyGuideButton } from "./AskSkyGuideButton";

export function NavbarContainer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = useCallback(async () => {
    try {
      console.log('Checking auth state in Navbar');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('User is logged in:', session.user.email);
        setIsLoggedIn(true);
      } else {
        console.log('No active session found');
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      if (mounted) {
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in:', session.user.email);
          setIsLoggedIn(true);
          navigate('/chat', { replace: true });
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setIsLoggedIn(false);
          navigate('/', { replace: true });
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, checkAuth]);

  const scrollToPricing = useCallback(() => {
    const pricingSection = document.getElementById('pricing-section');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  }, []);

  const handleLogoClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Logo clicked, current path:', location.pathname);
    
    if (location.pathname !== '/') {
      console.log('Navigating to home page with fromDashboard state');
      navigate('/', { 
        state: { fromDashboard: true }
      });
    }
    setIsMobileMenuOpen(false);
  }, [location.pathname, navigate]);

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