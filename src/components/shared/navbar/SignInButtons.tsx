import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";

export const SignInButtons = ({ scrollToPricing }: { scrollToPricing: () => void }) => (
  <div className="flex items-center gap-4">
    <Button asChild variant="secondary" size="sm" className="text-white hover:opacity-90">
      <Link to="/login">
        <LogIn className="mr-2 h-4 w-4" />
        <span>Sign In</span>
      </Link>
    </Button>

    <Button
      onClick={scrollToPricing}
      size="sm"
      variant="default"
      className="text-white hover:opacity-90"
    >
      Get Started Free
    </Button>
  </div>
);
