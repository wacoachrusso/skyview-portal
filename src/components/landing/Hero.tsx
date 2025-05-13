import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Hero() {
  const [showVideo, setShowVideo] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  const scrollToPricing = () => {
    const pricingSection = document.getElementById("pricing-section");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    // Ensure logo has rich styling immediately on load
    const preloadLogo = new Image();
    preloadLogo.src =
      "/lovable-uploads/c54bfa73-7d1d-464c-81d8-df88abe9a73a.png";
    preloadLogo.onload = () => setLogoLoaded(true);
  }, []);

  return (
    <section
      className="relative min-h-screen flex justify-center items-center bg-premium-gradient"
      role="banner"
      aria-labelledby="hero-heading"
    >
      {/* Layered background effects */}
      <div
        className="absolute inset-0 bg-[url('/lovable-uploads/c54bfa73-7d1d-464c-81d8-df88abe9a73a.png')] opacity-5 bg-repeat animate-slide"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-gold/10 via-transparent to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24">
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block px-3 py-1 bg-brand-gold/20 rounded-full text-brand-gold font-medium text-base mb-4 backdrop-blur-sm shadow-sm"
            >
              <span className="mr-2" aria-hidden="true">
                ✦
              </span>
              Tailored for flight attendants and pilots across all airlines
              <span className="ml-2" aria-hidden="true">
                ✦
              </span>
            </motion.div>
            <motion.h1
              id="hero-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight tracking-tight"
            >
              Navigate Your Contract <br className="hidden md:block" />
              <span className="text-gradient font-bold">Confidently</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base md:text-lg text-gray-200 mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Get instant, accurate answers to your contract questions with
              SkyGuide. Our advanced system helps you navigate complex contract
              details, ensuring you understand your rights and make informed
              decisions with ease.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap md:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold px-6 py-3 rounded-md shadow-lg w-full sm:w-auto"
                onClick={scrollToPricing}
                aria-label="Start your free trial today"
              >
                Start Your Free Trial Today
              </Button>
              <Button
                size="lg"
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 rounded-md shadow-lg w-full sm:w-auto"
                onClick={scrollToPricing}
                aria-label="Experience SkyGuide features and capabilities"
              >
                Experience SkyGuide Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 font-semibold px-6 py-3 rounded-md backdrop-blur-sm shadow-lg w-full sm:w-auto"
                onClick={() => setShowVideo(true)}
                aria-label="Watch demo video"
              >
                <Play className="mr-2 h-4 w-4" aria-hidden="true" />
                See How It Works
              </Button>
            </motion.div>
          </div>
          <div className="w-full lg:w-1/2 flex items-center justify-center mt-8 sm:mt-0 lg:pl-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative w-full max-w-sm"
            >
              <div className="relative animate-float">
                <img
                  src="/lovable-uploads/c54bfa73-7d1d-464c-81d8-df88abe9a73a.png"
                  alt="SkyGuide interface demonstration showing the chat interface and contract interpretation features"
                  className="w-full h-auto premium-logo-glow"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(212, 175, 55, 0.3))",
                    backgroundColor: "transparent",
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Dialog open={showVideo} onOpenChange={setShowVideo}>
        <DialogContent className="sm:max-w-[800px] p-0 bg-transparent border-none">
          <div className="relative pt-[56.25%] w-full overflow-hidden rounded-lg">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/your-video-id?autoplay=1"
              title="SkyGuide Product Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>

      {/* Skip link for keyboard navigation */}
      <a href="#pricing-section" className="skip-link hidden">
        Skip to pricing section
      </a>
    </section>
  );
}
