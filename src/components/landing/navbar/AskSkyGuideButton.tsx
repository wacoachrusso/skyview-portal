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
        className="text-white hover:bg-brand-gold hover:text-black"
      >
        <Link to="/chat" className="flex items-center">
          <MessageSquare className="h-5 w-5 md:mr-0 lg:mr-2" />
          <span className="hidden lg:inline">Ask SkyGuide</span>
        </Link>
      </Button>
    </div>
  );
}