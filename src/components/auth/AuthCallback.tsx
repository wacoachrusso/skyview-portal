import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error in auth callback:', error);
        navigate('/login');
        return;
      }

      if (session) {
        // Check if profile is complete
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type, airline')
          .eq('id', session.user.id)
          .single();

        if (profile?.user_type && profile?.airline) {
          navigate('/dashboard');
        } else {
          navigate('/complete-profile');
        }
      } else {
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto"></div>
        <p className="mt-4">Completing sign in...</p>
      </div>
    </div>
  );
};