import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Search, Flag, FileText, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChatSettings } from "@/components/chat/ChatSettings";
import { useTheme } from "@/components/theme-provider";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }
        setUserEmail(user.email);
        console.log("User logged in:", user.email);
      } catch (error) {
        console.error("Error checking user:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "There was a problem loading your information"
        });
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate, toast]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account"
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem signing out"
      });
    }
  };

  const handleDownloadContract = () => {
    toast({
      title: "Coming Soon",
      description: "Contract download will be available shortly"
    });
  };

  const handleFileGrievance = () => {
    toast({
      title: "Coming Soon",
      description: "Grievance filing system will be available shortly"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-foreground text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto mb-4"></div>
          <p className="text-sm font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="hover:bg-accent">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-foreground hidden sm:block">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground hidden sm:block">{userEmail}</span>
              <ChatSettings />
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
                className="hover:bg-accent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <Card className="mb-8 bg-gradient-to-br from-brand-navy to-brand-slate border-0">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome to SkyGuide</h2>
            <p className="text-white/80">Access your contract information and resources</p>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link to="/chat" className="block">
            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-primary/90 to-primary border-0">
              <CardContent className="p-6 flex items-center space-x-4">
                <Search className="h-6 w-6 text-white" />
                <div>
                  <h3 className="font-semibold text-lg text-white">Search Contract</h3>
                  <p className="text-white/80 text-sm">Find specific contract details</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card 
            className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-secondary/90 to-secondary border-0"
            onClick={handleFileGrievance}
          >
            <CardContent className="p-6 flex items-center space-x-4">
              <Flag className="h-6 w-6 text-white" />
              <div>
                <h3 className="font-semibold text-lg text-white">File Grievance</h3>
                <p className="text-white/80 text-sm">Submit a new grievance</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-secondary/90 to-secondary border-0"
            onClick={handleDownloadContract}
          >
            <CardContent className="p-6 flex items-center space-x-4">
              <FileText className="h-6 w-6 text-white" />
              <div>
                <h3 className="font-semibold text-lg text-white">Download Contract</h3>
                <p className="text-white/80 text-sm">Get contract PDF</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="bg-muted/50 rounded-lg p-4 text-muted-foreground">
              <p>Your recent chat history and activities will appear here.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;