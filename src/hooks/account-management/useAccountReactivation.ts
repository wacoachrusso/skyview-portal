
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "./types";

export const useAccountReactivation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const reactivateAccount = async (deletedProfile: Profile) => {
    try {
      console.log("Attempting to reactivate deleted account:", deletedProfile.id);
      
      // Update the profile to reactivate it
      const { data: reactivatedProfile, error: reactivationError } = await supabase
        .from('profiles')
        .update({
          account_status: 'active',
          // Reset to free plan (user can upgrade later)
          subscription_plan: 'free',
          // Reset query count for free plan
          query_count: 0,
          last_query_timestamp: new Date().toISOString()
        })
        .eq('id', deletedProfile.id)
        .select()
        .single();
      
      if (reactivationError) {
        console.error("Error reactivating account:", reactivationError);
        throw reactivationError;
      }
      
      console.log("Account successfully reactivated:", reactivatedProfile);
      
      // Show success toast
      toast({
        title: "Account Reactivated",
        description: "Your account has been successfully reactivated. Please upgrade your subscription plan.",
      });
      
      // Redirect to pricing section or dashboard
      navigate('/?scrollTo=pricing-section');
      
      return reactivatedProfile;
      
    } catch (error) {
      console.error("Failed to reactivate account:", error);
      toast({
        variant: "destructive",
        title: "Reactivation Failed",
        description: "We couldn't reactivate your account. Please contact support.",
      });
      
      // Sign out the user if reactivation fails
      await supabase.auth.signOut();
      navigate('/login');
      return null;
    }
  };

  return { reactivateAccount };
};
