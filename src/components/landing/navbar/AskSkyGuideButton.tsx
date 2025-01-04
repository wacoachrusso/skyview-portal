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
        <Link to="/chat">
          <MessageSquare className="mr-2 h-4 w-4" />
          Ask SkyGuide
        </Link>
      </Button>
    </div>
  );
}