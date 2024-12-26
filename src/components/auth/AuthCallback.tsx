import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AuthCallback: Starting authentication callback handling");
    
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log("AuthCallback: Session check result", { session: !!session, error });
        
        if (error) {
          console.error("AuthCallback: Error getting session:", error);
          throw error;
        }

        if (session) {
          console.log("AuthCallback: Session found, checking profile");
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          console.log("AuthCallback: Profile check result", { profile });

          if (profile?.full_name) {
            console.log("AuthCallback: Profile complete, redirecting to dashboard");
            navigate('/dashboard');
          } else {
            console.log("AuthCallback: Profile incomplete, redirecting to complete-profile");
            navigate('/complete-profile');
          }
        } else {
          console.log("AuthCallback: No session found, redirecting to login");
          navigate('/login');
        }
      } catch (error) {
        console.error("AuthCallback: Unexpected error:", error);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Logging you in...</p>
      </div>
    </div>
  );
};