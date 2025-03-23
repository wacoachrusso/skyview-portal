
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/landing/Navbar";
import { PricingSection } from "@/components/landing/pricing/PricingSection";
import { ReferralSection } from "@/components/landing/ReferralSection";
import { Testimonials } from "@/components/landing/Testimonials";
import { ReleaseNotePopup } from "@/components/release-notes/ReleaseNotePopup";
import { Features } from "@/components/landing/Features";
import { motion } from "framer-motion";
import { InstallPrompt } from "./InstallPrompt";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const LandingPageContent = () => {
  const location = useLocation();

  useEffect(() => {
    console.log('Landing page content mounted');
    
    const searchParams = new URLSearchParams(location.search);
    const scrollTo = searchParams.get('scrollTo');
    if (scrollTo === 'pricing-section') {
      const pricingSection = document.getElementById('pricing-section');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }

    return () => {
      console.log('Landing page content unmounted');
    };
  }, [location]);

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

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
      <InstallPrompt />
    </div>
  );
};
