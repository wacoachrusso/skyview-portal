import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <div className="relative bg-hero-gradient py-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 to-brand-slate/95" />
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <div className="inline-block px-3 py-1 bg-brand-gold/20 rounded-full text-brand-gold font-semibold text-sm mb-4 animate-fade-up">
              Your AI-Powered Contract Assistant
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Navigate Your Contract <br className="hidden md:block" />
              With Confidence
            </h1>
            <p className="text-base md:text-lg text-gray-200 mb-6 max-w-xl mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Get instant, accurate answers to your contract questions. Let AI help you understand your rights and make informed decisions about your schedule.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Button 
                asChild 
                size="lg"
                className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold w-full sm:w-auto px-6"
              >
                <Link to="/signup">Start Free Trial</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-white/20 text-white hover:bg-white/10 font-semibold w-full sm:w-auto px-6"
              >
                <Link to="/login">Watch Demo</Link>
              </Button>
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex items-center justify-center animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-0 bg-brand-gold/5 blur-3xl rounded-full" />
              <div className="relative bg-gradient-to-b from-slate-800/90 to-slate-900/90 p-4 md:p-6 rounded-xl shadow-2xl border border-white/10 backdrop-blur-sm">
                <img 
                  src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
                  alt="SkyGuide Interface" 
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}