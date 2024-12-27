import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Flag, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const QuickActions = () => {
  const { toast } = useToast();

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

  return (
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
  );
};