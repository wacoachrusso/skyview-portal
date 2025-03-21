
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface LogoProps {
  handleLogoClick?: (e: React.MouseEvent) => void;
}

export function Logo({ handleLogoClick }: LogoProps) {
  const defaultLogoClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check subscription status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_plan, subscription_status, query_count')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile in logo click:", profileError);
          window.location.href = '/';
          return;
        }
        
        console.log("User profile in Logo:", profile);
        
        // Check if the user has an active paid subscription
        if (profile?.subscription_status === 'active' && 
            profile?.subscription_plan !== 'free' && 
            profile?.subscription_plan !== 'trial_ended') {
          // User has an active paid subscription, go to dashboard
          console.log("User has active subscription, going to dashboard");
          window.location.href = '/dashboard';
          return;
        }
        
        // Free trial ended or inactive subscription - go to homepage with pricing
        if ((profile?.subscription_plan === 'free' && profile?.query_count >= 1) ||
            (profile?.subscription_status === 'inactive' && profile?.subscription_plan !== 'free')) {
          console.log("Free trial ended or inactive subscription, going to pricing");
          window.location.href = '/?scrollTo=pricing-section';
        } else {
          // Free trial remaining - go to dashboard
          window.location.href = '/dashboard';
        }
      } else {
        // Not logged in - go to homepage
        window.location.href = '/';
      }
    } catch (error) {
      console.error("Error in logo click:", error);
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
