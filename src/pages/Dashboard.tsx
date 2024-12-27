import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }
        setUserEmail(user.email);
        console.log("User logged in:", user.email);
      } catch (error) {
        console.error("Error checking user:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "There was a problem loading your information"
        });
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate, toast]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account"
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem signing out"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-foreground text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto mb-4"></div>
          <p className="text-sm font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userEmail={userEmail} onSignOut={handleSignOut} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeCard />
        <QuickActions />
        <RecentActivity />
      </main>
    </div>
  );
};

export default Dashboard;