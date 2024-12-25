import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";

export function Navbar() {
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing-section');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
              alt="SkyGuide Logo" 
              className="h-8 w-auto"
            />
            <span className="text-brand-navy text-lg font-bold">SkyGuide</span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              asChild 
              className="bg-brand-navy text-white hover:bg-brand-navy/90 font-semibold shadow-sm"
            >
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
            <Button 
              onClick={scrollToPricing}
              className="bg-brand-navy text-white hover:bg-brand-navy/90 font-semibold shadow-sm"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}