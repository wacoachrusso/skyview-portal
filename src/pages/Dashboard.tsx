import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { useToast } from "@/hooks/use-toast";
import { Settings, FileText, Download, Calendar, Users, BarChart3, Search, Flag } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No active session, redirecting to login');
        navigate('/login');
      } else {
        setUserEmail(session.user.email);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const cards = [
    {
      title: "Contract",
      description: "Find specific contract details",
      icon: FileText,
      color: "bg-navy-600",
      link: "/contract"
    },
    {
      title: "Submit Grievance",
      description: "Submit a new grievance",
      icon: Flag,
      color: "bg-navy-700",
      link: "/grievance"
    },
    {
      title: "Download Contract",
      description: "Get contract PDF",
      icon: Download,
      color: "bg-blue-600",
      link: "/download"
    },
    {
      title: "Schedule",
      description: "Manage your calendar",
      icon: Calendar,
      color: "bg-purple-600",
      link: "/schedule"
    },
    {
      title: "Resources",
      description: "Access knowledge base",
      icon: Search,
      color: "bg-green-600",
      link: "/resources"
    },
    {
      title: "Analytics",
      description: "View insights & reports",
      icon: BarChart3,
      color: "bg-amber-600",
      link: "/analytics"
    },
    {
      title: "Team",
      description: "Manage your team",
      icon: Users,
      color: "bg-pink-600",
      link: "/team"
    },
    {
      title: "Settings",
      description: "Configure preferences",
      icon: Settings,
      color: "bg-slate-600 hover:bg-slate-700",
      link: "/settings"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] to-[#2A2F3C]">
      <DashboardHeader userEmail={userEmail} onSignOut={handleSignOut} />
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <WelcomeCard />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
              <Link
                key={card.title}
                to={card.link}
                className={`${card.color} p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1`}
              >
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3">
                    <card.icon className="h-6 w-6 text-white" />
                    <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                  </div>
                  <p className="text-sm text-white/80">{card.description}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <QuickActions />
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;