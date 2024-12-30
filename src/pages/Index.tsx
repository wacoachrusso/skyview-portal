import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { PricingSection } from "@/components/landing/PricingSection";
import { Testimonials } from "@/components/landing/Testimonials";
import { CallToAction } from "@/components/landing/CallToAction";
import { ReferralSection } from "@/components/landing/ReferralSection";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const scrollTo = searchParams.get('scrollTo');

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        console.log('Checking auth state on Index page');
        const { data: { session } } = await supabase.auth.getSession();
        
        // Only redirect to dashboard if there's no scrollTo parameter
        // and not coming from dashboard or logout
        if (session && 
            !scrollTo && 
            !location.state?.fromDashboard && 
            !location.state?.fromLogout) {
          console.log('User is authenticated, checking profile');
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type, airline')
            .eq('id', session.user.id)
            .single();

          if (profile?.user_type && profile?.airline) {
            console.log('Profile complete, redirecting to dashboard');
            navigate('/dashboard');
          } else {
            console.log('Profile incomplete, redirecting to complete-profile');
            navigate('/complete-profile');
          }
        } else if (scrollTo === 'pricing') {
          console.log('Scrolling to pricing section');
          setTimeout(() => {
            const pricingSection = document.getElementById('pricing-section');
            if (pricingSection) {
              pricingSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      }
    };

    checkAuthAndRedirect();
  }, [navigate, location.state, scrollTo]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <PricingSection />
        <Testimonials />
        <ReferralSection />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;