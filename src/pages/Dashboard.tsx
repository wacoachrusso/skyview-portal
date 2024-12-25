import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Search, Flag, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

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
    // This is a placeholder - you'll need to implement the actual PDF download
    toast({
      title: "Coming Soon",
      description: "Contract download will be available shortly"
    });
  };

  const handleFileGrievance = () => {
    // This is a placeholder - you'll need to implement the grievance form
    toast({
      title: "Coming Soon",
      description: "Grievance filing system will be available shortly"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-navy to-brand-slate flex items-center justify-center p-4">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy to-brand-slate p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to SkyGuide</h1>
            <p className="text-gray-300">{userEmail}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="text-white hover:text-brand-navy"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/chat">
              <Button 
                className="w-full bg-gradient-to-r from-brand-gold to-yellow-500 hover:from-brand-gold/90 hover:to-yellow-500/90 text-brand-navy font-semibold h-24"
              >
                <Search className="h-6 w-6 mr-2" />
                Let SkyGuide Search The Contract
              </Button>
            </Link>
            <Button 
              onClick={handleFileGrievance}
              className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold h-24"
            >
              <Flag className="h-6 w-6 mr-2" />
              File a Grievance
            </Button>
            <Button 
              onClick={handleDownloadContract}
              className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold h-24"
            >
              <FileText className="h-6 w-6 mr-2" />
              Download Contract PDF
            </Button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <p className="text-gray-300">Your recent chat history and activities will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;