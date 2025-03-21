
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function useProfileVerification(currentUserId: string | null, isOffline: boolean) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<{
    subscription_plan: string;
    subscription_status: string;
    query_count: number;
  } | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUserId) return;

      try {
        console.log("[useProfileVerification] Fetching profile for user:", currentUserId);
        
        // CRITICAL: Check for post-payment condition first
        const isPostPayment = localStorage.getItem('subscription_activated') === 'true';
        
        if (isPostPayment) {
          console.log("[useProfileVerification] Post-payment state detected");
          
          // Wait briefly to ensure other components have had time to process
          // the post-payment state and update the profile
          console.log("[useProfileVerification] Waiting briefly before checking profile");
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Fetch the profile to verify it's been updated
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("subscription_plan, subscription_status, query_count")
            .eq("id", currentUserId)
            .single();

          if (error) {
            console.error("[useProfileVerification] Error fetching profile after payment:", error);
            // Don't throw error, proceed with verification
          } else if (profile) {
            console.log("[useProfileVerification] Profile after payment:", profile);
            setUserProfile(profile);
            
            // Verify subscription was properly updated
            if (profile.subscription_status !== 'active' || 
                profile.subscription_plan === 'free' ||
                profile.subscription_plan === 'trial_ended') {
              
              console.log("[useProfileVerification] Subscription not properly updated, applying fix");
              
              // Perform an emergency fix - update profile again
              try {
                const planType = localStorage.getItem('selected_plan') || 'monthly';
                const { error: updateError } = await supabase
                  .from("profiles")
                  .update({
                    subscription_status: 'active',
                    subscription_plan: planType
                  })
                  .eq("id", currentUserId);
                  
                if (updateError) {
                  console.error("[useProfileVerification] Error in emergency profile update:", updateError);
                } else {
                  console.log("[useProfileVerification] Emergency profile update successful");
                  
                  // Update local state to reflect the change
                  setUserProfile({
                    ...profile,
                    subscription_status: 'active',
                    subscription_plan: planType
                  });
                }
              } catch (e) {
                console.error("[useProfileVerification] Exception in emergency update:", e);
              }
            }
          }
          
          // Clear payment flags after a successful verification
          // But use a delay to ensure all components have processed the state
          const clearFlags = () => {
            console.log("[useProfileVerification] Clearing post-payment flags");
            localStorage.removeItem('subscription_activated');
            localStorage.removeItem('selected_plan');
            localStorage.removeItem('payment_in_progress');
            localStorage.removeItem('login_in_progress');
            localStorage.removeItem('auth_access_token');
            localStorage.removeItem('auth_refresh_token');
            localStorage.removeItem('auth_user_id');
            localStorage.removeItem('auth_user_email');
          };
          
          // Set a longer timeout to clear flags - much longer than in previous versions
          setTimeout(clearFlags, 10000); // 10 seconds
          return;
        }
        
        // For non-payment flow: Standard profile fetch
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("subscription_plan, subscription_status, query_count")
          .eq("id", currentUserId)
          .single();

        if (error) {
          console.error("[useProfileVerification] Error fetching user profile:", error);
          return;
        }

        console.log("[useProfileVerification] User profile:", profile);
        setUserProfile(profile);
        
        // Skip trial end check during login/payment processes
        const skipCheck = 
          localStorage.getItem('login_in_progress') === 'true' || 
          localStorage.getItem('payment_in_progress') === 'true';
        
        if (!skipCheck && profile.subscription_plan === "free" && profile.query_count >= 2) {
          console.log("[useProfileVerification] Free trial ended, redirecting to pricing");
          toast({
            title: "Subscription Required",
            description: "Please select a subscription plan to continue.",
            variant: "destructive",
          });
          navigate("/?scrollTo=pricing-section", { replace: true });
        }
      } catch (error) {
        console.error("[useProfileVerification] Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [currentUserId, navigate, toast]);

  return { userProfile };
}
