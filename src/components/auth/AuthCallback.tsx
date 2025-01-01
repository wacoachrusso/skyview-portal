import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("Checking for existing session...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "There was a problem with your session. Please try logging in again."
          });
          navigate('/login');
          return;
        }

        if (!session) {
          console.log("No active session");
          toast({
            variant: "destructive",
            title: "Session Error",
            description: "No active session found. Please log in again."
          });
          navigate('/login');
          return;
        }

        // Check for existing sessions for this user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error getting user:", userError);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Could not verify user identity. Please try again."
          });
          navigate('/login');
          return;
        }

        // Sign out from other sessions
        const { error: signOutError } = await supabase.auth.signOut({ scope: 'others' });
        
        if (signOutError) {
          console.error("Error signing out other sessions:", signOutError);
          toast({
            variant: "destructive",
            title: "Session Error",
            description: "Could not manage existing sessions. Please try again."
          });
          navigate('/login');
          return;
        }

        // Check if profile exists and is complete
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          toast({
            variant: "destructive",
            title: "Profile Error",
            description: "Could not fetch your profile. Please try again."
          });
          navigate('/login');
          return;
        }

        if (!profile) {
          console.log('No profile found, redirecting to complete profile');
          navigate('/complete-profile');
          return;
        }

        // Check if profile is complete
        if (!profile.user_type || !profile.airline) {
          console.log('Profile incomplete, redirecting to complete profile');
          navigate('/complete-profile');
          return;
        }

        console.log('Profile complete, redirecting to dashboard');
        toast({
          title: "Login Successful",
          description: "Other sessions have been signed out for security."
        });
        navigate('/dashboard');

      } catch (error) {
        console.error('Unexpected error in callback:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred. Please try again."
        });
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return null;
}