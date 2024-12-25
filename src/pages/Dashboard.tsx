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
      <div className="min-h-screen bg-gradient-to-br from-[#1a365d] to-[#334155] flex items-center justify-center p-4">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-sm font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a365d] to-[#334155] px-4 py-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 md:mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Welcome to SkyGuide</h1>
            <p className="text-gray-300 text-base md:text-lg">{userEmail}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="w-full md:w-auto bg-white/10 text-white hover:bg-white/20 border-white/20 transition-all duration-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 md:p-8 mb-6 md:mb-8 border border-white/10 shadow-xl">
          <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-6">Quick Actions</h2>
          <div className="grid gap-4 md:gap-6 md:grid-cols-3">
            <Link to="/chat" className="block">
              <Button 
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F0C75E] hover:from-[#D4AF37]/90 hover:to-[#F0C75E]/90 text-[#1a365d] font-semibold h-24 md:h-28 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <Search className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
                <span className="text-base md:text-lg whitespace-normal leading-tight">Search Contract</span>
              </Button>
            </Link>
            <Button 
              onClick={handleFileGrievance}
              className="w-full bg-white/10 hover:bg-white/15 text-white font-semibold h-24 md:h-28 rounded-xl border border-white/10 shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <Flag className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
              <span className="text-base md:text-lg">File a Grievance</span>
            </Button>
            <Button 
              onClick={handleDownloadContract}
              className="w-full bg-white/10 hover:bg-white/15 text-white font-semibold h-24 md:h-28 rounded-xl border border-white/10 shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <FileText className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
              <span className="text-base md:text-lg">Download Contract PDF</span>
            </Button>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 md:p-8 border border-white/10 shadow-xl">
          <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-6">Recent Activity</h2>
          <div className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
            <p className="text-gray-300 text-base md:text-lg">Your recent chat history and activities will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;