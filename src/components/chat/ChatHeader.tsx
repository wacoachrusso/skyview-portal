import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";

export function ChatHeader() {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="text-foreground/70 hover:text-foreground"
      >
        <Link to="/dashboard" className="flex items-center">
          <LayoutDashboard className="h-5 w-5 md:mr-0 lg:mr-2" />
          <span className="hidden lg:inline">Dashboard</span>
        </Link>
      </Button>
    </div>
  );
}