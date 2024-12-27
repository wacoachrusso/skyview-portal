import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Bell, User, FileText } from "lucide-react";
import { ChatSettings } from "@/components/chat/ChatSettings";

interface DashboardHeaderProps {
  userEmail: string | null;
  onSignOut: () => Promise<void>;
}

export const DashboardHeader = ({ userEmail, onSignOut }: DashboardHeaderProps) => {
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" state={{ fromDashboard: true }} replace>
              <Button variant="ghost" size="sm" className="hover:bg-accent">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-foreground hidden sm:block">Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Link to="/release-notes">
              <Button variant="ghost" size="sm" className="hover:bg-accent">
                <FileText className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Release Notes</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="hover:bg-accent">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-accent">
              <User className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:block">{userEmail}</span>
            <ChatSettings />
            <Button 
              variant="outline" 
              size="sm"
              onClick={onSignOut}
              className="hover:bg-accent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};