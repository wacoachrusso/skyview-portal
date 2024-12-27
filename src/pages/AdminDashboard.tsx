import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ReleaseNotesAdmin } from "@/components/admin/ReleaseNotesAdmin";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        console.log('Checking admin access...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('No session found, redirecting to login');
          navigate('/login');
          return;
        }

        // Check if user has admin privileges
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        console.log('Admin check result:', profile);

        if (!profile?.is_admin) {
          console.log('User is not an admin, redirecting to dashboard');
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You don't have permission to access the admin dashboard."
          });
          navigate('/dashboard');
          return;
        }

        console.log('Admin access granted');
      } catch (error) {
        console.error('Error checking admin access:', error);
        navigate('/login');
      }
    };

    checkAdminAccess();
  }, [navigate, toast]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <ReleaseNotesAdmin />
    </div>
  );
};

export default AdminDashboard;