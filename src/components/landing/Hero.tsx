import { Button } from "@/components/ui/button";
import { TypeAnimation } from "react-type-animation";

export const Hero = () => {
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-hero-gradient py-20 sm:py-32">
      <div className="absolute inset-0 bg-glow-gradient pointer-events-none"></div>
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center gap-4 text-center lg:text-left lg:items-start">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 lg:mb-6">
            Your Aviation AI Assistant for
            <br className="hidden sm:inline" />
            <TypeAnimation
              sequence={[
                'Flight Operations',
                2000,
                'Safety Procedures',
                2000,
                'Weather Briefings',
                2000,
                'Technical Knowledge',
                2000,
              ]}
              wrapper="span"
              speed={50}
              className="text-brand-gold"
              repeat={Infinity}
            />
          </h1>
          <p className="max-w-[600px] text-gray-300 md:text-xl dark:text-gray-400">
            Empowering aviation professionals with instant access to regulations, procedures, and expert guidance through advanced AI technology.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold w-full sm:w-auto px-6 shadow-lg"
              onClick={scrollToPricing}
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold w-full sm:w-auto px-6 shadow-lg"
              onClick={scrollToPricing}
            >
              Sign Up Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};