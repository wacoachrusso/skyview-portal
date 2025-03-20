
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "./Logo";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  MessageSquare, 
  LogOut, 
  User, 
  Menu, 
  ChevronDown
} from "lucide-react";
import { useLogout } from "@/hooks/useLogout";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { cn } from "@/lib/utils";

export function NavbarContainer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { handleLogout } = useLogout();

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
            setUserEmail(session.user.email);
            
            // Check user's subscription and free trial status
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('user_type, airline, subscription_plan, query_count')
              .eq('id', session.user.id)
              .maybeSingle();
            
            if (profileError) {
              console.error('Error fetching profile:', profileError);
            }
            
            // Redirect based on subscription status and current page
            if (window.location.pathname === '/') {
              if (profile?.subscription_plan === 'free' && profile?.query_count >= 1) {
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
          setUserEmail(session.user.email);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out in NavbarContainer');
          setIsLoggedIn(false);
          setUserEmail(null);
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
      
      // If user is logged in, check subscription status
      if (session) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_plan, query_count')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile in logo click:", profileError);
        }
        
        // Free trial ended - go to homepage with pricing
        if (profile?.subscription_plan === 'free' && profile?.query_count >= 1) {
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

  const renderDesktopMenu = () => {
    if (!isLoggedIn) {
      return (
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-gray-200 hover:text-white">
              Login
            </Button>
          </Link>
          <Button 
            onClick={scrollToPricing} 
            size="sm" 
            className="bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
          >
            Sign Up
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <Button 
          asChild
          variant="ghost" 
          size="sm" 
          className="text-gray-200 hover:text-white"
        >
          <Link to="/chat">
            <MessageSquare className="mr-2 h-4 w-4" />
            Ask SkyGuide
          </Link>
        </Button>

        <Button 
          asChild
          variant="ghost" 
          size="sm" 
          className="text-gray-200 hover:text-white"
        >
          <Link to="/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        
        <NotificationBell />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-gray-200 hover:text-white">
              <User className="mr-2 h-4 w-4" />
              {userEmail ? userEmail.split('@')[0] : 'Account'}
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link to="/account" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Account Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer focus:text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const renderMobileMenu = () => {
    return (
      <div className="md:hidden">
        {isLoggedIn && (
          <div className="flex items-center mr-2">
            <Button 
              asChild
              variant="ghost" 
              size="sm" 
              className="p-2"
            >
              <Link to="/chat">
                <MessageSquare className="h-5 w-5" />
              </Link>
            </Button>
            <NotificationBell />
          </div>
        )}
        
        <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {isLoggedIn ? (
              <>
                <DropdownMenuItem asChild className="py-2">
                  <Link to="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="py-2">
                  <Link to="/account">
                    <User className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="text-red-500 focus:text-red-500 py-2"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild className="py-2">
                  <Link to="/login">
                    Login
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={scrollToPricing} className="py-2">
                  Sign Up
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <nav className="fixed w-full top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/95 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Logo handleLogoClick={handleLogoClick} />
          
          <div className="hidden md:flex items-center">{renderDesktopMenu()}</div>
          
          <div className="flex md:hidden items-center">
            {renderMobileMenu()}
          </div>
        </div>
      </div>
    </nav>
  );
}
