import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="bg-white/5 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png" 
            alt="SkyGuide Logo" 
            className="h-8 w-auto"
          />
          <span className="text-white text-xl font-semibold">SkyGuide</span>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild variant="secondary" className="bg-brand-gold text-brand-navy hover:bg-brand-gold/90">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild variant="secondary" className="bg-brand-gold text-brand-navy hover:bg-brand-gold/90">
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}