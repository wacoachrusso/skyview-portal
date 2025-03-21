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
        console.log("SessionCheck: Checking session status...");
        
        // Check for post-payment state - MOST IMPORTANT
        const isPostPayment = localStorage.getItem('subscription_activated') === 'true';
        
        // If this is post-payment, we need to ensure we have a valid session
        if (isPostPayment) {
          console.log("SessionCheck: Post-payment state detected, ensuring valid session");
          
          // Get the current session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            console.error("SessionCheck: No session found after payment - attempting to restore");
            
            // Try to restore from saved tokens
            const savedRefreshToken = localStorage.getItem('supabase.refresh-token');
            if (savedRefreshToken) {
              console.log("SessionCheck: Found saved refresh token, attempting to restore");
              try {
                const { error: refreshError } = await supabase.auth.refreshSession();
                if (refreshError) {
                  console.error("SessionCheck: Failed to refresh session:", refreshError);
                  // Continue with normal flow below
                } else {
                  console.log("SessionCheck: Successfully refreshed session");
                }
              } catch (refreshErr) {
                console.error("SessionCheck: Error in refresh attempt:", refreshErr);
              }
            }
            
            // Re-check session after refresh attempt
            const { data: { session: refreshedSession } } = await supabase.auth.getSession();
            
            if (!refreshedSession) {
              console.error("SessionCheck: Still no session after refresh attempts");
              // Important: Do NOT clear subscription_activated flag here yet
              // Just navigate to login
              navigate('/login');
              return;
            }
            
            console.log("SessionCheck: Session restored successfully");
          }
          
          // Critical: Update profile to mark subscription as active right away
          const userId = session?.user?.id;
          if (userId) {
            console.log("SessionCheck: Updating user profile with active subscription");
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ 
                subscription_status: 'active',
                subscription_plan: localStorage.getItem('selected_plan') || 'monthly'
              })
              .eq('id', userId);
              
            if (updateError) {
              console.error("SessionCheck: Error updating profile:", updateError);
            } else {
              console.log("SessionCheck: Profile updated with active subscription");
              
              // Do NOT clear flags yet - keep them for other components
              // Only set additional cookies for persistence
              if (session) {
                document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
                document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
              }
            }
          }
          
          // Navigate to chat WITHOUT clearling local storage yet
          navigate('/chat');
          return;
        }

        // Regular session check for all scenarios
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("SessionCheck: No active session found");
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
          console.error("SessionCheck: Error fetching profile:", profileError);
        } else {
          console.log("SessionCheck: User profile:", profile);
          
          // Only redirect if explicitly NOT active AND not free
          // This is to prevent redirect loops during login/signup
          if (profile?.subscription_status === 'inactive' && 
              profile?.subscription_plan !== 'free' && 
              profile?.subscription_plan !== 'trial_ended') {
            console.log("SessionCheck: Subscription inactive, redirecting to pricing");
            navigate('/?scrollTo=pricing-section');
            return;
          }
          
          // Check for free trial ended condition separately
          if (profile?.subscription_plan === 'free' && profile?.query_count >= 2 && 
              window.location.pathname !== '/' && !localStorage.getItem('login_in_progress')) {
            console.log("SessionCheck: Free trial ended, redirecting to pricing");
            navigate('/?scrollTo=pricing-section');
            return;
          }
        }

        // If user is authenticated and on the root route, redirect to chat
        if (window.location.pathname === '/' && 
            !window.location.href.includes('scrollTo=pricing') && 
            !localStorage.getItem('payment_in_progress')) {
          navigate('/chat');
        }
      } catch (error) {
        console.error("SessionCheck error:", error);
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
      else if (event === 'SIGNED_IN' && !localStorage.getItem('subscription_activated') && 
               !localStorage.getItem('payment_in_progress')) {
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
