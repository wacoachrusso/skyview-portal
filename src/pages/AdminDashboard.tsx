import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ReleaseNotesAdmin } from "@/components/admin/ReleaseNotesAdmin";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (!profile?.is_admin) {
        navigate('/dashboard');
      }
    };

    checkAdminStatus();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userEmail={null} onSignOut={async () => {
        await supabase.auth.signOut();
        navigate('/login');
      }} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReleaseNotesAdmin />
      </main>
    </div>
  );
};

export default AdminDashboard;