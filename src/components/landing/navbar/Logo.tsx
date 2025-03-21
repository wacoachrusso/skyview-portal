
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface LogoProps {
  handleLogoClick?: (e: React.MouseEvent) => void;
}

export function Logo({ handleLogoClick }: LogoProps) {
  const defaultLogoClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      // First check for post-payment state
      const isPostPayment = localStorage.getItem('subscription_activated') === 'true';
      
      if (isPostPayment) {
        console.log("Logo: Post-payment state detected, going to chat");
        window.location.href = '/chat';
        return;
      }
      
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("Logo: No active session, going to homepage");
        window.location.href = '/';
        return;
      }
      
      // Check subscription status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_plan, subscription_status, query_count')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error("Logo: Error fetching profile in logo click:", profileError);
        window.location.href = '/';
        return;
      }
      
      console.log("Logo: User profile:", profile);
      
      // Check for active paid subscription first - most important!
      if (profile?.subscription_status === 'active' && 
          profile?.subscription_plan !== 'free' && 
          profile?.subscription_plan !== 'trial_ended') {
        console.log("Logo: User has active subscription, going to chat");
        window.location.href = '/chat';
        return;
      }
      
      // Free trial ended or inactive subscription - go to homepage with pricing
      if ((profile?.subscription_plan === 'free' && profile?.query_count >= 2) ||
          (profile?.subscription_status === 'inactive' && profile?.subscription_plan !== 'free')) {
        console.log("Logo: Free trial ended/inactive subscription, going to pricing");
        window.location.href = '/?scrollTo=pricing-section';
      } else {
        // Free trial remaining - go to chat
        window.location.href = '/chat';
      }
    } catch (error) {
      console.error("Logo: Error in logo click:", error);
      window.location.href = '/';
    }
  };
  
  const logoClickHandler = handleLogoClick || defaultLogoClick;

  return (
    <Link 
      to="#"
      onClick={logoClickHandler}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      aria-label="SkyGuide"
    >
      <img 
        src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
        alt="SkyGuide Logo - Your trusted companion for contract interpretation" 
        className="h-6 w-auto md:h-8"
      />
      <span className="text-foreground text-xl md:text-2xl font-bold">SkyGuide</span>
    </Link>
  );
}
