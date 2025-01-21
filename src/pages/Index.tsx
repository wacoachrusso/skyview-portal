import { CallToAction } from "@/components/landing/CallToAction";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/landing/Navbar";
import { PricingSection } from "@/components/landing/pricing/PricingSection";
import { ReferralSection } from "@/components/landing/ReferralSection";
import { Testimonials } from "@/components/landing/Testimonials";
import { ReleaseNotePopup } from "@/components/release-notes/ReleaseNotePopup";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    console.log('Index page mounted, checking auth status...');
    
    const checkAuthAndRedirect = async () => {
      // Only redirect on initial load
      if (!initialLoadComplete) {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth status:', error);
          return;
        }

        if (session?.user) {
          console.log('User is logged in, redirecting to chat on initial load...');
          navigate('/chat');
          return;
        }

        setInitialLoadComplete(true);
      }

      // Handle scroll to pricing section regardless of auth status
      const searchParams = new URLSearchParams(location.search);
      const scrollTo = searchParams.get('scrollTo');
      if (scrollTo === 'pricing-section') {
        const pricingSection = document.getElementById('pricing-section');
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    checkAuthAndRedirect();

    // Check if it's iOS and not in standalone mode
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const hasShownPrompt = localStorage.getItem('iosInstallPromptShown');
    
    console.log('Device checks:', { isIOS, isStandalone, hasShownPrompt });
    
    if (isIOS && !isStandalone && !hasShownPrompt) {
      setShowIOSPrompt(true);
      localStorage.setItem('iosInstallPromptShown', 'true');
    }

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' && session && !initialLoadComplete) {
        console.log('User signed in, redirecting to chat...');
        navigate('/chat');
      }
    });

    return () => {
      console.log('Index page unmounted');
      subscription.unsubscribe();
    };
  }, [location, navigate, initialLoadComplete]);

  const handleClosePrompt = () => {
    setShowIOSPrompt(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <PricingSection />
        <ReferralSection />
        <CallToAction />
      </main>
      <Footer />
      <ReleaseNotePopup />

      <Sheet open={showIOSPrompt} onOpenChange={handleClosePrompt}>
        <SheetContent side="bottom" className="h-[40vh]">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold">Install SkyGuide App</SheetTitle>
            <SheetDescription className="text-base">
              <div className="space-y-4">
                <p>Install SkyGuide on your iOS device for the best experience:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Tap the Share button <span className="inline-block w-6 h-6 align-middle">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L8 6h3v8h2V6h3L12 2zm0 10H3v10h18V12h-9zm-7 8v-6h14v6H5z"/>
                    </svg>
                  </span> in Safari</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" to install SkyGuide</li>
                </ol>
                <div className="mt-6">
                  <button
                    onClick={handleClosePrompt}
                    className="w-full bg-brand-gold text-brand-navy font-semibold py-3 rounded-lg hover:bg-brand-gold/90 transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}