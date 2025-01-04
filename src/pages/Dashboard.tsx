import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardLogo } from "@/components/dashboard/DashboardLogo";
import { DesktopNav } from "@/components/dashboard/DesktopNav";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuthManagement } from "@/hooks/useAuthManagement";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { userEmail, isLoading: authLoading, handleSignOut } = useAuthManagement();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        console.log("Checking session in Dashboard...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session && mounted) {
          console.log("No session found, redirecting to login");
          navigate('/login');
          return;
        }

        if (session && mounted) {
          // Check if profile exists and subscription is valid
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('subscription_plan, account_status, is_admin')
            .eq('id', session.user.id)
            .maybeSingle();

          if (error) {
            console.error("Error fetching profile:", error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to load user profile. Please try again."
            });
            return;
          }

          if (!profile || profile.account_status === 'deleted') {
            console.log("No profile found or account deleted");
            navigate('/login');
            return;
          }

          if (mounted) {
            setIsAdmin(profile.is_admin || false);
          }
        }
      } catch (error) {
        console.error("Error in session check:", error);
        if (mounted) {
          navigate('/login');
        }
      }
    };

    if (!authLoading) {
      checkSession();
    }

    return () => {
      mounted = false;
    };
  }, [navigate, toast, authLoading]);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
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
                <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="py-4">
                  {/* Add your dashboard content here */}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;