import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { PricingSection } from "@/components/landing/pricing/PricingSection";
import { Testimonials } from "@/components/landing/Testimonials";
import { ReleaseNotePopup } from "@/components/release-notes/ReleaseNotePopup";
import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { HomeFAQ } from "@/components/landing/HomeFAQ";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/layout/PublicLayout";

export default function Index() {
  const location = useLocation();
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const hasPricingSectionScrolled = useRef(false);
  // Access profile context to check if user is authenticated
  const isAuthenticated = localStorage.getItem("auth_status");

  useEffect(() => {
    console.log("Index page mounted");
    
    // Get URL parameters
    const searchParams = new URLSearchParams(location.search);
    
    // Check if the user is authenticated and there are no URL parameters
    if (isAuthenticated === "authenticated" && searchParams.toString() === "") {
      // Redirect to /chat route
      navigate("/chat", { replace: true });
      return; // Stop execution of the rest of the effect
    }

    // Check if we need to scroll to pricing section
    const scrollTo = searchParams.get("scrollTo");
    const needsToScrollToPricing = scrollTo === "pricing-section";

    // Check if pricing section needs to be scrolled to
    if (needsToScrollToPricing && !hasPricingSectionScrolled.current) {
      // Use a small timeout to ensure the page has rendered properly
      setTimeout(() => {
        const pricingSection = document.getElementById("pricing-section");
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: "smooth" });
          hasPricingSectionScrolled.current = true;
        }
      }, 500);
    }

    // Always complete loading regardless of auth status
    setIsLoading(false);

    // Check if it's iOS and not in standalone mode
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;

    // Check if the prompt has been shown before
    const hasShownPrompt = localStorage.getItem("iosInstallPromptShown");

    console.log("Device checks:", { isIOS, isStandalone, hasShownPrompt });

    if (isIOS && !isStandalone && !hasShownPrompt) {
      setShowIOSPrompt(true);
      localStorage.setItem("iosInstallPromptShown", "true");
    }

    return () => {
      console.log("Index page unmounted");
    };
  }, [location, navigate, isAuthenticated]);

  const handleClosePrompt = () => {
    setShowIOSPrompt(false);
  };

  const handleReferralClick = () => {
    if (isAuthenticated) {
      navigate("/referrals");
    } else {
      navigate("/login", { state: { redirectTo: "/referrals" } });
    }
  };

  // Animation variants for sections
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <PublicLayout>
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
            id="pricing-section-container"
          >
            <div id="pricing-section">
              <PricingSection />
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <HomeFAQ />
          </motion.div>

          {/* Referral CTA section - customized based on auth status */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionVariants}
          >
            <div className="container mx-auto px-4 py-20 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Invite Friends & Earn Rewards
              </h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                {isAuthenticated
                  ? "Share SkyGuide with your friends and earn rewards when they join."
                  : "Sign in to access our referral program and earn rewards when your friends join SkyGuide."}
              </p>
              <Button
                onClick={handleReferralClick}
                className="premium-button bg-brand-gold text-brand-navy font-semibold py-3 px-8 rounded-lg hover:bg-brand-gold/90 transition-colors shadow-gold hover:shadow-gold-hover"
              >
                {isAuthenticated
                  ? "Access Referral Program"
                  : "Sign in to refer friends"}
              </Button>
            </div>
          </motion.div>
          
        </div>
      </main>
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
            <SheetTitle className="text-xl font-bold text-white">
              Install SkyGuide App
            </SheetTitle>
            <SheetDescription className="text-base text-gray-300">
              <div className="space-y-4 pb-6">
                <p>
                  Install SkyGuide on your iOS device for the best experience:
                </p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li className="text-sm sm:text-base">
                    Tap the Share button{" "}
                    <span className="inline-block w-5 h-5 align-middle">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2L8 6h3v8h2V6h3L12 2zm0 10H3v10h18V12h-9zm-7 8v-6h14v6H5z" />
                      </svg>
                    </span>{" "}
                    in Safari
                  </li>
                  <li className="text-sm sm:text-base">
                    Scroll down and tap "Add to Home Screen"
                  </li>
                  <li className="text-sm sm:text-base">
                    Tap "Add" to install SkyGuide
                  </li>
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
      </PublicLayout>
  );
}