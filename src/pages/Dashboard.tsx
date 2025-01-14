import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthManagement } from "@/hooks/useAuthManagement";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { FAQ } from "@/components/dashboard/FAQ";

export default function Dashboard() {
  const navigate = useNavigate();
  const { userEmail, handleSignOut } = useAuthManagement();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Checking session in Dashboard page');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          navigate('/login', { replace: true });
          return;
        }

        if (!session) {
          console.log('No active session found, redirecting to login');
          navigate('/login', { replace: true });
          return;
        }

        // Check if profile exists and is complete
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type, airline')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }

        if (!profile?.user_type || !profile?.airline) {
          console.log('Incomplete profile, redirecting to account setup');
          navigate('/account', { replace: true });
        }
      } catch (error) {
        console.error('Error in dashboard session check:', error);
        navigate('/login', { replace: true });
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userEmail={userEmail} onSignOut={handleSignOut} />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <WelcomeCard />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <QuickActions />
          <RecentActivity />
        </div>
        
        <FAQ />
      </main>
    </div>
  );
}