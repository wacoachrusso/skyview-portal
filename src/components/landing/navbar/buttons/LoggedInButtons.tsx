import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LoggedInButtonsProps {
  isMobile?: boolean;
  showChatOnly?: boolean;
  handleLogout: () => Promise<void>;
}

export function LoggedInButtons({ isMobile = false, showChatOnly = false, handleLogout }: LoggedInButtonsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDashboardClick = async () => {
    console.log('Dashboard button clicked, checking session...');
    
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
      // Force a hard navigation to dashboard
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Error navigating to dashboard:', error);
      toast({
        variant: "destructive",
        title: "Navigation Error",
        description: "Unable to access dashboard. Please try again.",
      });
    }
  };

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
        asChild
        variant={isMobile ? "ghost" : "secondary"}
        size="sm"
        className={`${isMobile ? 'w-full justify-start' : 'text-white hover:text-white/90'}`}
      >
        <Link to="/account">
          <User className="mr-2 h-4 w-4" />
          Account
        </Link>
      </Button>
      
      <Button
        onClick={handleDashboardClick}
        size="sm"
        variant={isMobile ? "ghost" : "default"}
        className={`${isMobile ? 'w-full justify-start' : 'text-white hover:text-white/90'}`}
      >
        Dashboard
      </Button>

      <Button 
        onClick={handleLogout}
        size="sm"
        variant={isMobile ? "ghost" : "destructive"}
        className={`${isMobile ? 'w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10' : ''}`}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}