
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { FAQ } from "@/components/dashboard/FAQ";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLogout } from "@/hooks/useLogout";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [queryCount, setQueryCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const mounted = useRef(true);
  const isMobile = useIsMobile();
  const { handleLogout } = useLogout();
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading && mounted.current) {
        setIsLoading(false);
      }
    }, 1500);

    console.log('Dashboard mounted, checking session...');
    checkSession();

    return () => {
      console.log('Dashboard unmounting, cleanup...');
      mounted.current = false;
      clearTimeout(timer);
    };
  }, []);

  const checkSession = async () => {
    try {
      console.log('Fetching session data...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }

      if (!session) {
        console.log('No active session, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('Session found, fetching profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      if (!profile) {
        console.log('No profile found, redirecting to login');
        navigate('/login');
        return;
      }

      if (mounted.current) {
        console.log('Setting user data...');
        setUserEmail(session.user.email || "");
        
        if (profile.full_name && profile.full_name.trim() !== '') {
          setUserName(profile.full_name);
        } else {
          setUserName("");
        }
        
        setUserId(session.user.id);
        setIsAdmin(profile.is_admin || false);
        setQueryCount(profile.query_count || 0);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error in checkSession:', error);
      if (mounted.current) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "There was a problem loading your dashboard. Please try again."
        });
        navigate('/login');
      }
    }
  };

    // Handle custom sign out to clear cached data
    const handleSignOut = async () => {
      try {
        // Clear cached data on sign out
        sessionStorage.removeItem("cached_user_profile");
        sessionStorage.removeItem("cached_auth_user");
        handleLogout();
      } catch (error) {
        console.error("Error during sign out:", error);
      }
    };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userEmail={userEmail} onSignOut={handleSignOut} />
      
      <main className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 max-w-7xl">
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          <div className="w-full">
            <WelcomeCard userName={userName} />
          </div>
          
          <div className="w-full">
            <QuickActions />
          </div>
          
          <div className="w-full">
            <FAQ />
          </div>
        </div>
      </main>
    </div>
  );
};
