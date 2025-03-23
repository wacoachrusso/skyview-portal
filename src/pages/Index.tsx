
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/landing/Navbar";
import { PricingSection } from "@/components/landing/pricing/PricingSection";
import { ReferralSection } from "@/components/landing/ReferralSection";
import { Testimonials } from "@/components/landing/Testimonials";
import { ReleaseNotePopup } from "@/components/release-notes/ReleaseNotePopup";
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { WaitlistPage } from "@/components/waitlist/WaitlistPage";
import { Button } from "@/components/ui/button";

export default function Index() {
  const location = useLocation();
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false); // Default to false until confirmed otherwise
  const [waitlistForceOpen, setWaitlistForceOpen] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(true);

  useEffect(() => {
    console.log("Index page mounted - checking waitlist settings");
    
    const loadWaitlistSettings = async () => {
      try {
        setWaitlistLoading(true);
        
        // Add multiple attempts to load waitlist settings
        let attempts = 0;
        const maxAttempts = 3;
        let waitlistData = null;
        let forceOpenData = null;
        
        while (attempts < maxAttempts && (waitlistData === null || forceOpenData === null)) {
          try {
            console.log(`Waitlist settings fetch attempt ${attempts + 1}`);
            
            const { data: showWaitlistResult, error: showError } = await supabase
              .from('app_settings')
              .select('value')
              .eq('key', 'show_waitlist')
              .single();

            const { data: forceOpenResult, error: forceError } = await supabase
              .from('app_settings')
              .select('value')
              .eq('key', 'waitlist_force_open')
              .single();
              
            // Only update if we got valid results
            if (showWaitlistResult && !showError) {
              waitlistData = showWaitlistResult;
            } else {
              console.error("Error fetching waitlist setting:", showError);
            }
            
            if (forceOpenResult && !forceError) {
              forceOpenData = forceOpenResult;
            } else {
              console.error("Error fetching force open setting:", forceError);
            }
            
            if (waitlistData && forceOpenData) break;
          } catch (fetchError) {
            console.error(`Fetch attempt ${attempts + 1} failed:`, fetchError);
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            // Wait 1 second before next attempt
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        console.log("Final waitlist settings:", { 
          showWaitlist: waitlistData?.value, 
          forceOpen: forceOpenData?.value
        });

        // If we failed to fetch data after all attempts, default to NOT showing waitlist
        // This is the key change
        if (!waitlistData) {
          console.warn("Could not fetch waitlist settings - defaulting to NOT show waitlist");
          setShowWaitlist(false);
        } else {
          // Explicitly convert to boolean using double negation to handle any type issues
          const waitlistEnabled = !!waitlistData.value;
          console.log("Setting waitlist enabled to:", waitlistEnabled);
          setShowWaitlist(waitlistEnabled);
        }
        
        if (!forceOpenData) {
          setWaitlistForceOpen(false);
        } else {
          setWaitlistForceOpen(!!forceOpenData.value);
        }
      } catch (error) {
        console.error("Error loading waitlist settings:", error);
        // Default to NOT showing waitlist on error - this is our key change
        setShowWaitlist(false);
      } finally {
        setWaitlistLoading(false);
      }
    };

    loadWaitlistSettings();
  }, []);

  useEffect(() => {
    console.log('Index page mounted');
    
    const searchParams = new URLSearchParams(location.search);
    const scrollTo = searchParams.get('scrollTo');
    if (scrollTo === 'pricing-section') {
      const pricingSection = document.getElementById('pricing-section');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    const hasShownPrompt = localStorage.getItem('iosInstallPromptShown');
    
    console.log('Device checks:', { isIOS, isStandalone, hasShownPrompt });
    
    if (isIOS && !isStandalone && !hasShownPrompt) {
      setShowIOSPrompt(true);
      localStorage.setItem('iosInstallPromptShown', 'true');
    }

    return () => {
      console.log('Index page unmounted');
    };
  }, [location]);

  const handleClosePrompt = () => {
    setShowIOSPrompt(false);
  };

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  if (waitlistLoading) {
    return (
      <div className="min-h-screen bg-luxury-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log("Rendering Index with showWaitlist:", showWaitlist);

  if (showWaitlist) {
    return (
      <div>
        <WaitlistPage forceOpen={waitlistForceOpen} />
        <div className="absolute bottom-4 right-4">
          <Link to="/login?admin=true">
            <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-400">
              Admin Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-dark flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 w-full">
        <div className="max-w-[100vw] overflow-x-hidden">
          <Hero />
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <Features />
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <Testimonials />
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <PricingSection />
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <ReferralSection />
          </motion.div>
        </div>
      </main>
      <Footer />
      <ReleaseNotePopup />

      <Sheet open={showIOSPrompt} onOpenChange={handleClosePrompt}>
        <SheetContent 
          side="bottom" 
          className="glass-morphism border-t border-white/10 max-h-[80vh] overflow-y-auto pb-safe"
          style={{
            height: "auto",
            minHeight: "280px",
            maxHeight: "min(450px, 80vh)",
            paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
          }}
        >
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-white">Install SkyGuide App</SheetTitle>
            <SheetDescription className="text-base text-gray-300">
              <div className="space-y-4 pb-6">
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
                <div className="mt-6 mb-4">
                  <button
                    onClick={handleClosePrompt}
                    className="premium-button w-full bg-brand-gold text-brand-navy font-semibold py-3 rounded-lg hover:bg-brand-gold/90 transition-colors shadow-gold hover:shadow-gold-hover"
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
