import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-brand-navy py-16 md:py-24 lg:py-32 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <div className="inline-block px-4 py-2 bg-brand-gold/10 rounded-full text-brand-gold font-medium text-sm mb-6">
              Your AI-Powered Contract Assistant
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
              Understand Your Contract <br className="hidden md:block" />
              in Seconds
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-6 md:mb-8">
              Get instant, accurate answers to your contract questions. No more searching through pages of documents - just ask and receive clear explanations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                asChild 
                size="lg"
                className="bg-white text-brand-navy hover:bg-gray-100 w-full sm:w-auto"
              >
                <Link to="/signup">Start Free Trial</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 w-full sm:w-auto"
              >
                <Link to="/login">See How It Works</Link>
              </Button>
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex items-center justify-center">
            <div className="bg-slate-800/90 p-6 md:p-8 rounded-lg shadow-xl max-w-[80%] md:max-w-[70%] lg:max-w-[90%]">
              <img 
                src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
                alt="SkyGuide Logo" 
                className="w-full h-auto animate-fade-up"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}