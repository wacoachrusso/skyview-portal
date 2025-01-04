import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardLogo } from "@/components/dashboard/DashboardLogo";
import { DesktopNav } from "@/components/dashboard/DesktopNav";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    console.log('Dashboard mounted, checking session...');
    checkSession();

    return () => {
      console.log('Dashboard unmounting, cleanup...');
      mounted.current = false;
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
        setIsAdmin(profile.is_admin || false);
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

  const handleSignOut = async () => {
    try {
      console.log('Signing out...');
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "Please try again."
      });
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
      <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-border bg-card">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <DashboardLogo />
            <DesktopNav isAccountPage={false} onSignOut={handleSignOut} />
          </div>
        </div>
      </div>
      
      <div className="md:pl-72 flex flex-col flex-1">
        <DashboardHeader userEmail={userEmail} onSignOut={handleSignOut} />
        <MobileNav isAccountPage={false} onSignOut={handleSignOut} />
        
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <WelcomeCard userEmail={userEmail} />
              <div className="mt-8">
                <QuickActions />
              </div>
              <div className="mt-8">
                <RecentActivity />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}