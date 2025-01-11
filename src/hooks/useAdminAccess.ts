import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAdminAccess = () => {
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

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          throw error;
        }

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
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify admin access. Please try again."
        });
        navigate('/login');
      }
    };

    checkAdminAccess();
  }, [navigate, toast]);
};