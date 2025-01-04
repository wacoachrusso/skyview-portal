import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuthManagement } from "@/hooks/useAuthManagement";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { userEmail, isLoading: authLoading, signOut } = useAuthManagement();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        console.log("Checking admin status...");
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
          
          setIsAdmin(profile?.is_admin || false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        setIsPageLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Show loading spinner while authentication or page is loading
  if (authLoading || isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-navy/5 via-background to-brand-slate/5">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy/5 via-background to-brand-slate/5">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader 
          userEmail={userEmail} 
          isAdmin={isAdmin} 
          onSignOut={signOut}
        />
        <div className="grid gap-6 mt-6">
          <WelcomeCard />
          <QuickActions />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;