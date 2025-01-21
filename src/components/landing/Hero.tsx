import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { CTASection } from "@/components/ui/cta-with-rectangle";

export function Hero() {
  const [showVideo, setShowVideo] = useState(false);

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing-section');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen bg-hero-gradient pt-28 pb-16 md:pt-32 md:pb-20" role="banner">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy/90 to-brand-navy/80 animate-gradient" />
      <div className="absolute inset-0 bg-[url('/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png')] opacity-5 bg-repeat animate-slide" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-gold/10 via-transparent to-transparent" aria-hidden="true" />
      
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24">
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <div className="inline-block px-3 py-1 bg-brand-gold/20 rounded-full text-brand-gold font-semibold text-base mb-4 animate-fade-up">
              Tailored for flight attendants and pilots across all airlines
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Navigate Your Contract <br className="hidden md:block" />
              Confidently
            </h1>
            <p className="text-base md:text-lg text-gray-200 mb-12 max-w-xl mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Get instant, accurate answers to your contract questions with SkyGuide. Our advanced system helps you navigate complex contract details, ensuring you understand your rights and make informed decisions with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up mb-8 lg:mb-0" style={{ animationDelay: "0.3s" }}>
              <Button 
                size="lg"
                className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold w-full sm:w-auto px-8 shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-brand-gold/20 text-base"
                onClick={scrollToPricing}
                aria-label="Start your free trial today"
              >
                Start Free Trial Today
              </Button>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold w-full sm:w-auto px-8 shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl text-base"
                onClick={scrollToPricing}
                aria-label="Get instant answers to your contract questions"
              >
                Sign Up & Start Using SkyGuide
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 font-semibold w-full sm:w-auto px-6 backdrop-blur-sm shadow-lg transform transition-all duration-200 hover:scale-105 text-base"
                onClick={() => setShowVideo(true)}
                aria-label="Watch demo video"
              >
                <Play className="mr-2 h-4 w-4" aria-hidden="true" />
                Watch Demo
              </Button>
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex items-center justify-center mt-8 sm:mt-0 animate-fade-up lg:pl-8">
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-0 bg-glow-gradient opacity-75" aria-hidden="true" />
              <div className="relative animate-float">
                <img 
                  src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
                  alt="SkyGuide interface demonstration showing the chat interface and contract interpretation features" 
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <CTASection
          badge={{
            text: "Experience the Future of Contract Navigation"
          }}
          title="Your Contract, Decoded"
          description="Get instant, accurate answers to your most complex contract questions. Join thousands of aviation professionals who trust SkyGuide for contract clarity."
          action={{
            text: "Start Your Journey Today",
            href: "/signup",
            variant: "default"
          }}
          className="mt-16 lg:mt-24"
        />
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
    </section>
  );
}
