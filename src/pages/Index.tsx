import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { PricingSection } from "@/components/landing/PricingSection";
import { Testimonials } from "@/components/landing/Testimonials";
import { CallToAction } from "@/components/landing/CallToAction";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        console.log('Checking auth state on Index page');
        const { data: { session } } = await supabase.auth.getSession();
        
        // Only redirect to dashboard on initial load, not when coming from dashboard
        if (session && !location.state?.fromDashboard) {
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
        } else {
          console.log('No session found or coming from dashboard, showing landing page');
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      }
    };

    checkAuthAndRedirect();
  }, [navigate, location.state]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <PricingSection />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;