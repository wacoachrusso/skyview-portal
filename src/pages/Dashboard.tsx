import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ContactDirectory } from "@/components/contact/ContactDirectory";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuthManagement } from "@/hooks/useAuthManagement";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { userEmail, isLoading, handleSignOut } = useAuthManagement();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  const checkAdminStatus = async () => {
    try {
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
    }
  };

  // Check admin status on component mount
  useEffect(() => {
    checkAdminStatus();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
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