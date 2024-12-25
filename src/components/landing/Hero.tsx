import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-brand-navy py-16 md:py-24 lg:py-32 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
              Your Personal Contract Guide
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-6 md:mb-8">
              Instant, accurate contract interpretation for airline professionals. Get the answers you need, when you need them.
            </p>
            <Button 
              asChild 
              size="lg"
              className="bg-white text-brand-navy hover:bg-gray-100 w-full sm:w-auto"
            >
              <Link to="/signup">Get Started Free</Link>
            </Button>
          </div>
          <div className="w-full lg:w-1/2 flex items-center justify-center mt-8 lg:mt-0">
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