
import { supabase } from "@/integrations/supabase/client";
import { disableRedirects } from "@/utils/navigation";

export function useDefaultLogoClickHandler() {
  const defaultLogoClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      console.log("[Logo] Logo clicked, determining redirect");
      
      // Disable redirects temporarily to prevent redirect loops
      disableRedirects(3000);
      
      // First check for post-payment state - highest priority
      const isPostPayment = localStorage.getItem('subscription_activated') === 'true';
      
      if (isPostPayment) {
        console.log("[Logo] Post-payment state detected, going to chat");
        window.location.href = '/chat';
        return;
      }
      
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("[Logo] No active session, going to homepage");
        window.location.href = '/';
        return;
      }
      
      // Check if user is admin first - admins always go to chat or admin page
      const isAdmin = localStorage.getItem('user_is_admin') === 'true';
      if (isAdmin) {
        console.log("[Logo] Admin user detected in logo click, redirecting to chat");
        window.location.href = '/chat';
        return;
      }
      
      // For non-admin users: Ensure we have the latest profile data for redirect decisions
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_plan, subscription_status, query_count')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error("[Logo] Error fetching profile:", profileError);
        window.location.href = '/';
        return;
      }
      
      console.log("[Logo] User profile:", profile);
      
      // Check for active paid subscription first - most important!
      if (profile?.subscription_status === 'active' && 
          profile?.subscription_plan !== 'free' && 
          profile?.subscription_plan !== 'trial_ended') {
        console.log("[Logo] User has active subscription, going to chat");
        window.location.href = '/chat';
        return;
      }
      
      // Free trial ended or inactive subscription - go to homepage with pricing
      if ((profile?.subscription_plan === 'free' && profile?.query_count >= 2) ||
          (profile?.subscription_status === 'inactive' && profile?.subscription_plan !== 'free')) {
        console.log("[Logo] Free trial ended/inactive subscription, going to pricing");
        window.location.href = '/?scrollTo=pricing-section';
      } else {
        // Free trial remaining - go to chat
        console.log("[Logo] Free trial available, going to chat");
        window.location.href = '/chat';
      }
    } catch (error) {
      console.error("[Logo] Error in logo click:", error);
      window.location.href = '/';
    }
  };
  
  return { defaultLogoClick };
}
