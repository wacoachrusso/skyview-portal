import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log("Checking session in Dashboard");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (mounted) {
            setIsLoading(false);
            navigate('/login');
          }
          return;
        }

        if (!session) {
          console.log("No active session found");
          if (mounted) {
            setIsLoading(false);
            navigate('/login');
          }
          return;
        }

        // Verify user exists and session is valid
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("Error getting user or no user found:", userError);
          if (mounted) {
            // Clear any invalid session state
            await supabase.auth.signOut({ scope: 'local' });
            localStorage.clear();
            setIsLoading(false);
            navigate('/login');
          }
          return;
        }

        console.log("Valid session found for user:", user.email);
        if (mounted) {
          setUserEmail(user.email);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Unexpected error in checkAuth:", error);
        if (mounted) {
          localStorage.clear();
          setIsLoading(false);
          navigate('/login');
        }
      }
    };

    // Initial auth check
    checkAuth();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session) {
        console.log("User signed out or session ended");
        localStorage.clear();
        navigate('/login');
      } else if (session?.user) {
        console.log("Valid session detected");
        setUserEmail(session.user.email);
      }
    });

    // Cleanup function
    return () => {
      console.log("Dashboard component unmounting");
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      console.log("Starting sign out process");
      setIsLoading(true);
      
      // First check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No active session found, cleaning up");
        localStorage.clear();
        navigate('/login');
        return;
      }

      // Attempt to sign out
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) {
        console.error("Error during sign out:", error);
        throw error;
      }
      
      console.log("Sign out successful");
      localStorage.clear();
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, clean up and redirect
      localStorage.clear();
      navigate('/login');
      
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-navy/5 via-background to-brand-slate/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy/5 via-background to-brand-slate/5">
      <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />
      <DashboardHeader userEmail={userEmail} onSignOut={handleSignOut} />
      <main className="container mx-auto px-4 py-8 max-w-7xl relative">
        <div className="space-y-6">
          <WelcomeCard />
          <QuickActions />
          <RecentActivity />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;