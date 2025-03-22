
import { supabase } from "@/integrations/supabase/client";
import { disableRedirects } from "@/utils/navigation";

export function useLogoClickHandler() {
  const handleLogoClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error checking session in logo click:", error);
      }
      
      // If user is logged in, check admin status and subscription status
      if (session) {
        // First check if admin status is already in localStorage
        if (localStorage.getItem('user_is_admin') === 'true') {
          console.log("Admin user detected from localStorage, redirecting to chat");
          window.location.href = '/chat';
          return;
        }
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_plan, query_count, is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile in logo click:", profileError);
        }
        
        // Admin users always go to chat (changed from admin dashboard)
        if (profile?.is_admin) {
          console.log("Admin user detected in logo click, redirecting to chat");
          localStorage.setItem('user_is_admin', 'true');
          window.location.href = '/chat';
        }
        // Free trial ended - go to homepage with pricing
        else if (profile?.subscription_plan === 'free' && profile?.query_count >= 2) {
          console.log("Free trial ended, going to homepage with pricing");
          window.location.href = '/?scrollTo=pricing-section';
        } else {
          // Active subscription or trials remaining - go to dashboard
          window.location.href = '/dashboard';
        }
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error("Unexpected error in logo click handler:", error);
      window.location.href = '/';
    }
  };

  return { handleLogoClick };
}
