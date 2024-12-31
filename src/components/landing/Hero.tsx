import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";

export function Hero() {
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing-section');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-hero-gradient py-16 md:py-24 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-glow-gradient opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-gold/10 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            {/* Trust Badge */}
            <div className="inline-block px-4 py-2 bg-brand-gold/20 rounded-full text-brand-gold font-semibold text-sm mb-6 animate-fade-up">
              Trusted by Thousands of Aviation Professionals
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight animate-fade-up" style={{ animationDelay: "0.1s" }}>
              End Contract Confusion— <br className="hidden md:block" />
              Get Instant Answers Now
            </h1>

            {/* Subheading */}
            <p className="text-base md:text-lg text-gray-200 mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Tailored for flight attendants and pilots across all airlines. Get instant, accurate answers to your contract questions and make informed decisions about your schedule.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Button 
                size="lg"
                onClick={scrollToPricing}
                className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold w-full sm:w-auto px-8 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Start Free Trial Today
              </Button>
              <Button 
                size="lg"
                onClick={scrollToPricing}
                className="bg-white hover:bg-gray-100 text-brand-navy font-semibold w-full sm:w-auto px-8 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Sign Up for Instant Access
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 font-semibold w-full sm:w-auto px-6 backdrop-blur-sm shadow-lg transform transition-all duration-300 hover:scale-105"
              >
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </a>
              </Button>
            </div>

            {/* Trust Signals */}
            <div className="mt-8 text-gray-300 text-sm animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <p className="flex items-center justify-center lg:justify-start gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                Trusted by 10,000+ Aviation Professionals
              </p>
            </div>
          </div>

          {/* Hero Image */}
          <div className="w-full lg:w-1/2 flex items-center justify-center animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="relative w-full max-w-lg group">
              <div className="absolute inset-0 bg-glow-gradient opacity-75" />
              <div className="relative transform transition-transform duration-500 group-hover:scale-105">
                <img 
                  src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
                  alt="SkyGuide Interface - Your Professional Contract Assistant"
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
                {/* Floating Elements Animation */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-brand-gold/20 rounded-full animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-brand-gold/10 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}