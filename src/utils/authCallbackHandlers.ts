import { NavigateFunction } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { ProfilesRow } from "@/integrations/supabase/types/tables.types";

interface HandlerOptions {
  navigate: NavigateFunction;
  toast: typeof toast;
}

export const handleSelectedPlan = async (
  selectedPlan: string | null,
  { navigate, toast }: HandlerOptions
) => {
  if (selectedPlan) {
    console.log('Redirecting to pricing section with selected plan');
    navigate(`/?scrollTo=pricing-section&selectedPlan=${selectedPlan}`);
    return true;
  }
  return false;
};

export const handleProfileRedirect = async (
  profile: ProfilesRow,
  selectedPlan: string | null,
  { navigate, toast }: HandlerOptions
) => {
  console.log('Handling profile redirect');

  if (!profile.full_name || !profile.user_type || !profile.airline) {
    console.log('Profile incomplete, redirecting to complete profile');
    navigate('/complete-profile');
    return;
  }

  if (profile.account_status === 'deleted') {
    console.log('Account deleted, redirecting to login');
    toast({
      variant: "destructive",
      title: "Account Unavailable",
      description: "This account has been deleted. Please contact support."
    });
    navigate('/login');
    return;
  }

  console.log('Profile complete, redirecting to chat');
  navigate('/chat');
};