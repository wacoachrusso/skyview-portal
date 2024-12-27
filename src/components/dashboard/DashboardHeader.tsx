import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Bell, User, FileText } from "lucide-react";
import { ChatSettings } from "@/components/chat/ChatSettings";
import { useEffect, useState } from "react";
import { setupPushNotifications, requestNotificationPermission } from "@/utils/pushNotifications";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DashboardHeaderProps {
  userEmail: string | null;
  onSignOut: () => Promise<void>;
}

export const DashboardHeader = ({ userEmail, onSignOut }: DashboardHeaderProps) => {
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const initializeNotifications = async () => {
      console.log("Initializing notifications...");
      const cleanup = await setupPushNotifications();
      
      // Load initial unread count
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
        
        setUnreadCount(count || 0);
      }

      return cleanup;
    };

    initializeNotifications();
  }, []);

  const handleNotificationClick = async () => {
    console.log("Notification bell clicked");
    const isGranted = await requestNotificationPermission();
    
    if (isGranted) {
      toast({
        title: "Notifications Enabled",
        description: "You'll now receive notifications for important updates.",
      });
    } else {
      toast({
        title: "Notifications Not Enabled",
        description: "Please enable notifications in your browser settings to receive updates.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="border-b border-border bg-card shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" state={{ fromDashboard: true }} replace>
              <Button variant="ghost" size="sm" className="text-white hover:bg-brand-navy hover:text-white">
                <Home className="h-5 w-5 mr-2" />
                Home
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-white hidden sm:block">Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Link to="/release-notes">
              <Button variant="ghost" size="sm" className="text-white hover:bg-brand-navy hover:text-white">
                <FileText className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Release Notes</span>
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-brand-navy hover:text-white relative"
              onClick={handleNotificationClick}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-brand-navy hover:text-white">
              <User className="h-5 w-5" />
            </Button>
            <span className="text-sm font-semibold text-white hidden sm:block">{userEmail}</span>
            <ChatSettings />
            <Button 
              variant="outline" 
              size="sm"
              onClick={onSignOut}
              className="text-white border-white/20 hover:bg-brand-navy hover:text-white hover:border-white"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};