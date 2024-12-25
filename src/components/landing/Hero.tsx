import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-brand-navy py-32 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold text-white mb-6">
            Your Personal Contract Guide
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Instant, accurate contract interpretation for airline professionals. Get the answers you need, when you need them.
          </p>
          <Button 
            asChild 
            size="lg"
            className="bg-white text-brand-navy hover:bg-gray-100"
          >
            <Link to="/signup">Get Started Free</Link>
          </Button>
        </div>
        <div className="hidden lg:block">
          <img 
            src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
            alt="SkyGuide Logo" 
            className="w-96 h-auto drop-shadow-2xl animate-fade-up"
          />
        </div>
      </div>
    </div>
  );
}