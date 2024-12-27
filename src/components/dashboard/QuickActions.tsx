import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Flag, FileText, Calendar, Database, ChartBar, Users, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const QuickActions = () => {
  const { toast } = useToast();

  const handleComingSoon = (feature: string) => {
    toast({
      title: "Coming Soon",
      description: `${feature} will be available shortly`
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
        onClick={() => handleComingSoon("Grievance filing system")}
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
        className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-blue-500/90 to-blue-600 border-0"
        onClick={() => handleComingSoon("Contract download")}
      >
        <CardContent className="p-6 flex items-center space-x-4">
          <FileText className="h-6 w-6 text-white" />
          <div>
            <h3 className="font-semibold text-lg text-white">Download Contract</h3>
            <p className="text-white/80 text-sm">Get contract PDF</p>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-purple-500/90 to-purple-600 border-0"
        onClick={() => handleComingSoon("Calendar scheduling")}
      >
        <CardContent className="p-6 flex items-center space-x-4">
          <Calendar className="h-6 w-6 text-white" />
          <div>
            <h3 className="font-semibold text-lg text-white">Schedule</h3>
            <p className="text-white/80 text-sm">Manage your calendar</p>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-green-500/90 to-green-600 border-0"
        onClick={() => handleComingSoon("Database access")}
      >
        <CardContent className="p-6 flex items-center space-x-4">
          <Database className="h-6 w-6 text-white" />
          <div>
            <h3 className="font-semibold text-lg text-white">Resources</h3>
            <p className="text-white/80 text-sm">Access knowledge base</p>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-yellow-500/90 to-yellow-600 border-0"
        onClick={() => handleComingSoon("Analytics dashboard")}
      >
        <CardContent className="p-6 flex items-center space-x-4">
          <ChartBar className="h-6 w-6 text-white" />
          <div>
            <h3 className="font-semibold text-lg text-white">Analytics</h3>
            <p className="text-white/80 text-sm">View insights & reports</p>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-pink-500/90 to-pink-600 border-0"
        onClick={() => handleComingSoon("Team management")}
      >
        <CardContent className="p-6 flex items-center space-x-4">
          <Users className="h-6 w-6 text-white" />
          <div>
            <h3 className="font-semibold text-lg text-white">Team</h3>
            <p className="text-white/80 text-sm">Manage your team</p>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-gray-500/90 to-gray-600 border-0"
        onClick={() => handleComingSoon("Settings configuration")}
      >
        <CardContent className="p-6 flex items-center space-x-4">
          <Settings className="h-6 w-6 text-white" />
          <div>
            <h3 className="font-semibold text-lg text-white">Settings</h3>
            <p className="text-white/80 text-sm">Configure preferences</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};