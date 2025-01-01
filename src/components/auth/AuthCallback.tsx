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
        console.log("Starting auth callback process...");
        
        // First check if there's an existing session
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

        // Always attempt to sign out other sessions first
        console.log("Signing out other sessions...");
        const { error: signOutError } = await supabase.auth.signOut({ 
          scope: 'others',
          shouldRefresh: false // Don't refresh current session
        });
        
        if (signOutError) {
          console.error("Error signing out other sessions:", signOutError);
          // If we can't sign out other sessions, prevent this login
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Session Conflict",
            description: "Another session is already active. Please sign out from other devices first."
          });
          navigate('/login');
          return;
        }

        // Verify current user after signing out others
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("Error getting user:", userError);
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Could not verify user identity. Please try again."
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
          await supabase.auth.signOut();
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
          description: "You've been signed in. Any other active sessions have been signed out for security."
        });
        navigate('/dashboard');

      } catch (error) {
        console.error('Unexpected error in callback:', error);
        await supabase.auth.signOut();
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred. Please try again."
        });
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return null;
}