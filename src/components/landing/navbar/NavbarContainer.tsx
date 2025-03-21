
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "./Logo";
import { AuthButtons } from "./AuthButtons";
import { MobileMenu } from "./MobileMenu";
import { AskSkyGuideButton } from "./AskSkyGuideButton";
import { NotificationBell } from "@/components/shared/NotificationBell";

export function NavbarContainer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log('Checking auth state in Navbar');
        setIsLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error retrieving session:', sessionError);
          if (mounted) {
            setIsLoggedIn(false);
            setIsLoading(false);
          }
          return;
        }
        
        if (mounted) {
          if (session?.user) {
            console.log('User is logged in:', session.user.email);
            setIsLoggedIn(true);
            
            // Check user's subscription, free trial status, and admin status
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('user_type, airline, subscription_plan, query_count, is_admin')
              .eq('id', session.user.id)
              .maybeSingle();
            
            if (profileError) {
              console.error('Error fetching profile:', profileError);
            }
            
            // Update admin state
            setIsAdmin(profile?.is_admin || false);
            
            // Admin users bypass subscription checks
            if (profile?.is_admin) {
              console.log('Admin user detected, bypassing subscription checks');
              // Store admin status in localStorage for quick access
              localStorage.setItem('user_is_admin', 'true');
              
              // Only redirect admin if they're on the homepage or login page
              const currentPath = window.location.pathname;
              if (currentPath === '/' || currentPath === '/login') {
                console.log('Admin on homepage or login page, redirecting to chat');
                // Use timeout to avoid immediate redirect during rendering
                setTimeout(() => {
                  window.location.href = '/chat';
                }, 100);
                return;
              }
              // Always return early for admin users to prevent any subscription checks
              setIsLoading(false);
              return;
            } else {
              localStorage.removeItem('user_is_admin');
            }
            
            // Redirect based on subscription status and current page for non-admin users
            if (window.location.pathname === '/') {
              if (profile?.subscription_plan === 'free' && profile?.query_count >= 2) {
                // Free trial ended - stay on homepage but scroll to pricing
                console.log('Free trial ended, scrolling to pricing section');
                const pricingSection = document.getElementById('pricing-section');
                if (pricingSection) {
                  setTimeout(() => {
                    pricingSection.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              } else if (profile?.subscription_plan && profile?.subscription_plan !== 'free' && 
                profile?.subscription_plan !== 'trial_ended' && profile?.user_type && profile?.airline) {
                // Active subscription and profile complete - redirect to dashboard
                console.log('Active subscription and profile complete, redirecting to dashboard');
                window.location.href = '/dashboard';
              }
            }
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
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed in NavbarContainer:', event);
      if (mounted) {
        setIsLoading(true);
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in in NavbarContainer:', session.user.email);
          setIsLoggedIn(true);
          
          // Check if user is admin
          const checkAdminStatus = async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', session.user.id)
                .single();
                
              if (profile?.is_admin) {
                setIsAdmin(true);
                localStorage.setItem('user_is_admin', 'true');
                
                // Redirect admin to chat page
                console.log('Admin signed in, redirecting to chat');
                window.location.href = '/chat';
              } else {
                setIsAdmin(false);
                localStorage.removeItem('user_is_admin');
              }
            } catch (err) {
              console.error('Error checking admin status:', err);
            }
          };
          
          checkAdminStatus();
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out in NavbarContainer');
          setIsLoggedIn(false);
          setIsAdmin(false);
          localStorage.removeItem('user_is_admin');
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
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error checking session in logo click:", error);
      }
      
      setIsLoggedIn(!!session);
      setIsLoading(false);
      
      // If user is logged in, check admin status and subscription status
      if (session) {
        // First check if admin status is already in localStorage
        if (localStorage.getItem('user_is_admin') === 'true') {
          console.log("Admin user detected from localStorage, redirecting to chat");
          window.location.href = '/chat';
          return;
        }
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_plan, query_count, is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile in logo click:", profileError);
        }
        
        // Admin users always go to chat (changed from admin dashboard)
        if (profile?.is_admin) {
          console.log("Admin user detected in logo click, redirecting to chat");
          localStorage.setItem('user_is_admin', 'true');
          window.location.href = '/chat';
        }
        // Free trial ended - go to homepage with pricing
        else if (profile?.subscription_plan === 'free' && profile?.query_count >= 2) {
          console.log("Free trial ended, going to homepage with pricing");
          window.location.href = '/?scrollTo=pricing-section';
        } else {
          // Active subscription or trials remaining - go to dashboard
          window.location.href = '/dashboard';
        }
      } else {
        window.location.href = '/';
      }
      
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Unexpected error in logo click handler:", error);
      window.location.href = '/';
    }
  };

  return (
    <nav className="fixed-nav fixed top-0 left-0 right-0 z-50 border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <Logo handleLogoClick={handleLogoClick} />
          
          <div className="flex items-center gap-2">
            {isLoggedIn && !isLoading && <AskSkyGuideButton />}
            
            {isLoggedIn && !isLoading && <NotificationBell />}
          </div>
          
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
