import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface LoggedInButtonsProps {
  isMobile?: boolean;
  showChatOnly?: boolean;
  handleLogout: () => Promise<void>;
}

export function LoggedInButtons({ isMobile = false, showChatOnly = false, handleLogout }: LoggedInButtonsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Check session when component mounts
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error on mount:', error);
          return;
        }
        setSessionChecked(true);
        console.log('Initial session check complete:', session ? 'Session exists' : 'No session');
      } catch (error) {
        console.error('Error checking session on mount:', error);
      }
    };

    checkSession();
  }, []);

  const handleDashboardClick = async () => {
    if (isLoading) return;
    
    console.log('Dashboard button clicked, checking session...');
    setIsLoading(true);
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        toast({
          variant: "destructive",
          title: "Session Error",
          description: "Please try logging in again",
        });
        navigate('/login', { replace: true });
        return;
      }

      if (!session) {
        console.log('No active session found, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }

      console.log('Valid session found, navigating to dashboard');
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error navigating to dashboard:', error);
      toast({
        variant: "destructive",
        title: "Navigation Error",
        description: "Unable to access dashboard. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountClick = async () => {
    if (isLoading) return;
    
    console.log('Account button clicked, verifying session...');
    setIsLoading(true);
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.log('No valid session for account access');
        toast({
          variant: "destructive",
          title: "Session Error",
          description: "Please log in again to access your account",
        });
        navigate('/login', { replace: true });
        return;
      }

      console.log('Session valid, navigating to account');
      navigate('/account');
    } catch (error) {
      console.error('Error accessing account:', error);
      toast({
        variant: "destructive",
        title: "Navigation Error",
        description: "Unable to access account. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  if (!sessionChecked) {
    return null; // Don't render buttons until session is checked
  }

  if (showChatOnly) {
    return (
      <Button 
        asChild
        variant="ghost"
        size="sm"
        className="text-foreground hover:bg-accent"
      >
        <Link to="/chat">
          <User className="h-5 w-5" />
        </Link>
      </Button>
    );
  }

  return (
    <div className={`flex ${isMobile ? 'flex-col w-full gap-2' : 'items-center gap-4'}`}>
      {!isMobile && <NotificationBell />}
      
      <Button
        onClick={handleAccountClick}
        variant={isMobile ? "ghost" : "secondary"}
        size="sm"
        className={`${isMobile ? 'w-full justify-start' : 'text-white hover:text-white/90'}`}
        disabled={isLoading}
      >
        <User className="mr-2 h-4 w-4" />
        Account
      </Button>
      
      <Button
        onClick={handleDashboardClick}
        size="sm"
        variant={isMobile ? "ghost" : "default"}
        className={`${isMobile ? 'w-full justify-start' : 'text-white hover:text-white/90'}`}
        disabled={isLoading}
      >
        Dashboard
      </Button>

      <Button 
        onClick={handleLogoutClick}
        size="sm"
        variant={isMobile ? "ghost" : "destructive"}
        className={`${isMobile ? 'w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10' : ''}`}
        disabled={isLoading}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}