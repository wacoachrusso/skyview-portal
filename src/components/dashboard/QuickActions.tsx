import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Search, FileText, HelpCircle, MessageSquare } from "lucide-react";
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
    <div>
      <h2 className="text-xl font-semibold mb-4 text-foreground/90">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/chat" className="block">
          <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-brand-navy/90 to-brand-slate/90 border-0">
            <CardContent className="p-6 flex items-center space-x-4">
              <MessageSquare className="h-6 w-6 text-white/90" />
              <div>
                <h3 className="font-medium text-lg text-white/90">Contract Query</h3>
                <p className="text-white/70 text-sm">Ask about your contract</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/union-news" className="block" onClick={(e) => { e.preventDefault(); handleComingSoon("Union News"); }}>
          <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-brand-navy/90 to-brand-slate/90 border-0">
            <CardContent className="p-6 flex items-center space-x-4">
              <FileText className="h-6 w-6 text-white/90" />
              <div>
                <h3 className="font-medium text-lg text-white/90">Union News</h3>
                <p className="text-white/70 text-sm">Latest updates</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/search" className="block">
          <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-brand-navy/90 to-brand-slate/90 border-0">
            <CardContent className="p-6 flex items-center space-x-4">
              <Search className="h-6 w-6 text-white/90" />
              <div>
                <h3 className="font-medium text-lg text-white/90">Search</h3>
                <p className="text-white/70 text-sm">Find information</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/help" className="block" onClick={(e) => { e.preventDefault(); handleComingSoon("Help Center"); }}>
          <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-brand-navy/90 to-brand-slate/90 border-0">
            <CardContent className="p-6 flex items-center space-x-4">
              <HelpCircle className="h-6 w-6 text-white/90" />
              <div>
                <h3 className="font-medium text-lg text-white/90">Help Center</h3>
                <p className="text-white/70 text-sm">How to use SkyGuide</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};