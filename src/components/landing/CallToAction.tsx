import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CallToAction() {
  return (
    <div className="relative py-20 bg-cta-gradient overflow-hidden">
      <div className="absolute inset-0 bg-glow-gradient opacity-30" />
      <div className="container mx-auto px-4 relative">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
          Ready to Simplify Your Contract Interpretation?
        </h2>
        <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
          Join thousands of airline professionals who trust SkyGuide for instant, accurate contract guidance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            asChild 
            size="lg"
            className="bg-gradient-to-r from-brand-gold to-brand-gold/90 hover:from-brand-gold/90 hover:to-brand-gold text-white"
          >
            <Link to="/signup">Start Free Trial</Link>
          </Button>
          <Button 
            asChild 
            size="lg"
            variant="outline"
            className="bg-transparent border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
          >
            <Link to="/login">Learn More</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}