
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function SessionCheck() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking session status...");
        
        // Check for post-payment state
        const isPostPayment = localStorage.getItem('subscription_activated') === 'true';
        
        // If this is post-payment, we need to ensure we have a valid session
        if (isPostPayment) {
          console.log("Post-payment state detected, checking session validity");
          
          // Get the current session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            console.error("No session found after payment - attempting to restore");
            
            // Try to restore from saved tokens (additional safety)
            const savedRefreshToken = localStorage.getItem('supabase.refresh-token');
            if (savedRefreshToken) {
              console.log("Found saved refresh token, attempting to restore");
              try {
                const { error: refreshError } = await supabase.auth.refreshSession();
                if (refreshError) {
                  console.error("Failed to refresh session:", refreshError);
                  // Continue with normal flow
                }
              } catch (refreshErr) {
                console.error("Error in refresh attempt:", refreshErr);
              }
            }
            
            // Re-check session after refresh attempt
            const { data: { session: refreshedSession } } = await supabase.auth.getSession();
            
            if (!refreshedSession) {
              console.error("Still no session after refresh attempts");
              localStorage.removeItem('subscription_activated');
              navigate('/login');
              return;
            }
            
            console.log("Session restored successfully");
          }
          
          // Critical: Update profile to mark subscription as active right away
          const userId = session?.user?.id;
          if (userId) {
            console.log("Updating user profile with active subscription");
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ 
                subscription_status: 'active',
                subscription_plan: localStorage.getItem('selected_plan') || 'monthly'
              })
              .eq('id', userId);
              
            if (updateError) {
              console.error("Error updating profile:", updateError);
            } else {
              console.log("Profile updated with active subscription");
              // Set cookies for additional persistence
              document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
              document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
            }
            
            // Clear payment flags at the very end
            setTimeout(() => {
              localStorage.removeItem('subscription_activated');
              localStorage.removeItem('selected_plan');
              localStorage.removeItem('payment_in_progress');
            }, 2000);
          }
        }

        // Regular session check for all scenarios
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No active session found");
          navigate('/login');
          return;
        }

        // Check subscription status after successful session verification
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_plan, query_count')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else {
          console.log("User profile in SessionCheck:", profile);
          
          // IMPORTANT: Only redirect if explicitly NOT active AND not free
          if (profile?.subscription_status === 'inactive' && 
              profile?.subscription_plan !== 'free' && 
              profile?.subscription_plan !== 'trial_ended') {
            console.log("Subscription inactive, redirecting to pricing");
            navigate('/?scrollTo=pricing-section');
            return;
          }
          
          // Check for free trial ended condition separately
          if (profile?.subscription_plan === 'free' && profile?.query_count >= 2) {
            console.log("Free trial ended, redirecting to pricing");
            navigate('/?scrollTo=pricing-section');
            return;
          }
        }

        // If user is authenticated and on the root route, redirect to chat
        if (window.location.pathname === '/') {
          navigate('/chat');
        }
      } catch (error) {
        console.error("Session check error:", error);
        navigate('/login');
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login');
      }
      // Do not navigate on SIGNED_IN during the post-payment flow
      else if (event === 'SIGNED_IN' && !localStorage.getItem('subscription_activated')) {
        // Only navigate if not in post-payment flow
        navigate('/chat');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return null;
}
