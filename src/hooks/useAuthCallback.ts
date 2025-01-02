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
import {
  handleSelectedPlan,
  handleProfileRedirect
} from "@/utils/authCallbackHandlers";

export const useAuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCallback = async () => {
    try {
      console.log('Starting auth callback process...');
      
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
      }

      // Get the selected plan from URL state
      const params = new URLSearchParams(window.location.search);
      const selectedPlan = params.get('selectedPlan');
      console.log('Selected plan from URL:', selectedPlan);

      // Handle selected plan if present
      const planHandled = await handleSelectedPlan(selectedPlan, { navigate, toast });
      if (planHandled) return;

      // Check user profile and handle redirect
      const profile = await checkUserProfile(user.id, { navigate, toast });
      if (!profile) return;

      await handleProfileRedirect(profile, selectedPlan, { navigate, toast });

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

  return { handleCallback };
};