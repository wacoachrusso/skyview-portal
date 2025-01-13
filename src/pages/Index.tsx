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
import { useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function Index() {
  const location = useLocation();
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [skipLinkFocus, setSkipLinkFocus] = useState(false);

  useEffect(() => {
    console.log('Index page mounted');
    
    // Check for pricing section scroll
    const searchParams = new URLSearchParams(location.search);
    const scrollTo = searchParams.get('scrollTo');
    if (scrollTo === 'pricing-section') {
      const pricingSection = document.getElementById('pricing-section');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
        pricingSection.focus();
      }
    }

    // Check if it's iOS and not in standalone mode
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const hasShownPrompt = localStorage.getItem('iosInstallPromptShown');
    
    if (isIOS && !isStandalone && !hasShownPrompt) {
      setShowIOSPrompt(true);
      localStorage.setItem('iosInstallPromptShown', 'true');
    }
  }, [location]);

  const handleClosePrompt = () => {
    setShowIOSPrompt(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className={`sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded ${
          skipLinkFocus ? 'focus:outline-none' : ''
        }`}
        onFocus={() => setSkipLinkFocus(true)}
        onBlur={() => setSkipLinkFocus(false)}
      >
        Skip to main content
      </a>

      <header role="banner">
        <Navbar />
      </header>

      <main id="main-content" tabIndex={-1} className="outline-none">
        <Hero />
        <Features />
        <Testimonials />
        <PricingSection />
        <ReferralSection />
        <CallToAction />
      </main>

      <Footer />
      <ReleaseNotePopup />

      <Sheet 
        open={showIOSPrompt} 
        onOpenChange={handleClosePrompt}
        role="dialog"
        aria-labelledby="ios-prompt-title"
        aria-describedby="ios-prompt-description"
      >
        <SheetContent side="bottom" className="h-[40vh]">
          <SheetHeader>
            <SheetTitle id="ios-prompt-title" className="text-xl font-bold">
              Install SkyGuide App
            </SheetTitle>
            <SheetDescription id="ios-prompt-description" className="text-base">
              <div className="space-y-4">
                <p>Install SkyGuide on your iOS device for the best experience:</p>
                <ol className="list-decimal pl-5 space-y-2" role="list">
                  <li>
                    Tap the Share button{" "}
                    <span 
                      className="inline-block w-6 h-6 align-middle"
                      role="img"
                      aria-label="Share button icon"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L8 6h3v8h2V6h3L12 2zm0 10H3v10h18V12h-9zm-7 8v-6h14v6H5z"/>
                      </svg>
                    </span>
                    {" "}in Safari
                  </li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" to install SkyGuide</li>
                </ol>
                <div className="mt-6">
                  <button
                    onClick={handleClosePrompt}
                    className="w-full bg-brand-gold text-brand-navy font-semibold py-3 rounded-lg hover:bg-brand-gold/90 transition-colors"
                    aria-label="Close installation instructions"
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