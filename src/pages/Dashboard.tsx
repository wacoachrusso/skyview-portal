import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ContactDirectory } from "@/components/contact/ContactDirectory";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuthManagement } from "@/hooks/useAuthManagement";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { userEmail, isLoading, handleSignOut } = useAuthManagement();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking session in Dashboard...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, redirecting to login");
          navigate('/login');
          return;
        }

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

        if (!profile.subscription_plan || profile.subscription_plan === 'free') {
          console.log("No subscription plan found");
          navigate('/?scrollTo=pricing-section');
          return;
        }

        setIsAdmin(profile.is_admin || false);
        setIsPageLoading(false);
      } catch (error) {
        console.error("Error in session check:", error);
        setIsPageLoading(false);
        navigate('/login');
      }
    };

    checkSession();
  }, [navigate, toast]);

  if (isLoading || isPageLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy/5 via-background to-brand-slate/5">
      <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />
      <DashboardHeader userEmail={userEmail} onSignOut={handleSignOut} />
      <main className="container mx-auto px-4 py-8 max-w-7xl relative">
        <div className="space-y-8">
          <WelcomeCard />
          {isAdmin && (
            <div className="p-4 bg-background/80 backdrop-blur-sm rounded-lg border border-border" />
          )}
          <QuickActions />
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact Directory</h2>
            <ContactDirectory />
          </div>
          <RecentActivity />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;