import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export function AskSkyGuideButton() {
  return (
    <div className="hidden md:flex justify-center flex-1">
      <Button
        asChild
        variant="secondary"
        size="sm"
        className="relative text-white hover:bg-brand-gold hover:text-black transition-all duration-300 
          animate-pulse hover:animate-none hover:scale-105 group
          after:absolute after:inset-0 after:rounded-md after:ring-2 after:ring-brand-gold/50 
          after:animate-ping after:duration-1000"
      >
        <Link to="/chat" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-medium">Ask SkyGuide</span>
        </Link>
      </Button>
    </div>
  );
}