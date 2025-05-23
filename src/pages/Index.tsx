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
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const hasPricingSectionScrolled = useRef(false);

  // Enhanced authentication check function
  const checkAuthenticationStatus = () => {
    try {
      // Check multiple possible auth indicators
      const authStatus = localStorage.getItem("auth_status");
      const authToken = localStorage.getItem("auth_token"); // if you use tokens
      const userSession = localStorage.getItem("user_session"); // if you store user data
      const loginInProgress = localStorage.getItem("login_in_progress");
      // You might also want to check sessionStorage as a fallback
      const sessionAuth = sessionStorage.getItem("auth_status");

      // Don't redirect if login is in progress (OAuth flow)
      if (loginInProgress === "true") {
        console.log("Login in progress, skipping auth redirect");
        return false;
      }

      // Return true if any authentication indicator is present
      return (
        authStatus === "authenticated" ||
        authToken !== null ||
        userSession !== null ||
        sessionAuth === "authenticated"
      );
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  };

  // Check if running as PWA with better type safety
  const isPWA = () => {
    // Check for test parameter to simulate PWA
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("pwa-test") === "true") {
      console.log("🧪 PWA test mode enabled");
      return true;
    }

    // Check display mode (works on most modern browsers)
    const isStandaloneDisplay = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;

    // Check iOS standalone mode (iOS Safari specific)
    const isIOSStandalone =
      "standalone" in window.navigator &&
      (window.navigator as any).standalone === true;

    // Check if launched from Android home screen
    const isAndroidPWA =
      document.referrer.includes("android-app://") ||
      window.location.search.includes("homescreen=1");

    // Check for PWA-specific window properties
    const hasPWAProperties =
      window.matchMedia("(display-mode: fullscreen)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches;

    return (
      isStandaloneDisplay || isIOSStandalone || isAndroidPWA || hasPWAProperties
    );
  };

  useEffect(() => {
    console.log("Index page mounted");
    console.log("Is PWA:", isPWA());

    // Add a small delay for PWA context to fully initialize
    const authCheckDelay = isPWA() ? 500 : 100;

    setTimeout(() => {
      const isAuthenticated = checkAuthenticationStatus();

      // Enhanced debugging for PWA testing
      const debugInfo = {
        isPWA: isPWA(),
        isAuthenticated,
        displayMode: window.matchMedia("(display-mode: standalone)").matches,
        fullscreen: window.matchMedia("(display-mode: fullscreen)").matches,
        minimalUI: window.matchMedia("(display-mode: minimal-ui)").matches,
        referrer: document.referrer,
        searchParams: location.search,
        pathname: location.pathname,
        localStorage: {
          auth_status: localStorage.getItem("auth_status"),
          auth_token: localStorage.getItem("auth_token"),
        },
      };

      console.log("🔍 PWA Debug Info:", debugInfo);
      console.log("🔐 Authentication status:", isAuthenticated);

      // Get URL parameters
      const searchParams = new URLSearchParams(location.search);

      // Check if the user is authenticated and there are no URL parameters
      if (isAuthenticated && searchParams.toString() === "") {
        console.log("Redirecting authenticated user to /chat");
        // For PWA, use replace to avoid back button issues
        navigate("/chat", { replace: true });
        return;
      }

      // Handle pricing section scrolling
      const scrollTo = searchParams.get("scrollTo");
      const needsToScrollToPricing = scrollTo === "pricing-section";

      if (needsToScrollToPricing && !hasPricingSectionScrolled.current) {
        setTimeout(() => {
          const pricingSection = document.getElementById("pricing-section");
          if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: "smooth" });
            hasPricingSectionScrolled.current = true;
          }
        }, 500);
      }

      setAuthChecked(true);
      setIsLoading(false);

      // Handle iOS install prompt (only for iOS, not Android PWA)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const hasShownPrompt = localStorage.getItem("iosInstallPromptShown");

      if (isIOS && !isStandalone && !hasShownPrompt) {
        setShowIOSPrompt(true);
        localStorage.setItem("iosInstallPromptShown", "true");
      }
    }, authCheckDelay);

    return () => {
      console.log("Index page unmounted");
    };
  }, [location, navigate]);

  // Also add a secondary auth check that runs periodically for PWAs
  useEffect(() => {
    if (!isPWA() || !authChecked) return;

    const authCheckInterval = setInterval(() => {
      const isAuthenticated = checkAuthenticationStatus();
      const searchParams = new URLSearchParams(location.search);

      if (
        isAuthenticated &&
        searchParams.toString() === "" &&
        location.pathname === "/"
      ) {
        console.log("Secondary auth check: redirecting to /chat");
        navigate("/chat", { replace: true });
      }
    }, 2000); // Check every 2 seconds

    // Clear interval after 10 seconds to avoid indefinite checking
    const clearTimer = setTimeout(() => {
      clearInterval(authCheckInterval);
    }, 10000);

    return () => {
      clearInterval(authCheckInterval);
      clearTimeout(clearTimer);
    };
  }, [authChecked, location, navigate]);

  const handleClosePrompt = () => {
    setShowIOSPrompt(false);
  };

  const handleReferralClick = () => {
    const isAuthenticated = checkAuthenticationStatus();
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

  // Get current auth status for rendering
  const isAuthenticated = checkAuthenticationStatus();

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
