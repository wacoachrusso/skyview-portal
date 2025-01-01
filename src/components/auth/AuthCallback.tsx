import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  checkSession,
  getCurrentUser,
  signOutGlobally,
  reAuthenticateSession,
  checkUserProfile
} from "@/utils/authCallbackUtils";

export function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check session validity
        const session = await checkSession({ navigate, toast });
        if (!session) return;

        // Get current user
        const user = await getCurrentUser({ navigate, toast });
        if (!user) return;

        // Sign out all other sessions
        const signOutSuccess = await signOutGlobally({ navigate, toast });
        if (!signOutSuccess) return;

        // Re-authenticate if needed
        if (session.provider_token) {
          const reAuthSuccess = await reAuthenticateSession('google', { navigate, toast });
          if (!reAuthSuccess) return;
        } else {
          navigate('/login');
          toast({
            title: "Please Sign In Again",
            description: "For security reasons, please sign in again to continue."
          });
          return;
        }

        // Check user profile
        const profile = await checkUserProfile(user.id, { navigate, toast });
        if (!profile) return;

        // Handle profile completion status
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