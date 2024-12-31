import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Search, FileText, Settings, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";

export const QuickActions = () => {
  const { toast } = useToast();
  const { userProfile } = useUserProfile();

  const handleComingSoon = (feature: string) => {
    toast({
      title: "Coming Soon",
      description: `${feature} will be available shortly`
    });
  };

  const handleContractClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!userProfile?.airline || !userProfile?.user_type) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your profile with airline and job title information.",
        variant: "destructive"
      });
      return;
    }

    const fileName = `${userProfile.airline.toLowerCase()}_${userProfile.user_type.toLowerCase()}.pdf`;
    console.log("Attempting to fetch contract:", fileName);

    try {
      const { data, error } = await supabase.storage
        .from('contracts')
        .createSignedUrl(fileName, 60); // URL valid for 60 seconds

      if (error) {
        console.error('Error fetching contract:', error);
        toast({
          title: "Contract Unavailable",
          description: "The contract document is not available. Please contact support.",
          variant: "destructive"
        });
        return;
      }

      // Open the PDF in a new tab
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Error handling contract click:', error);
      toast({
        title: "Error",
        description: "Unable to access the contract. Please try again later.",
        variant: "destructive"
      });
    }
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
                <h3 className="font-medium text-lg text-white/90">Chat</h3>
                <p className="text-white/70 text-sm">Start a conversation</p>
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

        <a href="#" onClick={handleContractClick} className="block">
          <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-brand-navy/90 to-brand-slate/90 border-0">
            <CardContent className="p-6 flex items-center space-x-4">
              <FileText className="h-6 w-6 text-white/90" />
              <div>
                <h3 className="font-medium text-lg text-white/90">Contract</h3>
                <p className="text-white/70 text-sm">View contract</p>
              </div>
            </CardContent>
          </Card>
        </a>

        <Link to="/settings" className="block">
          <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-brand-navy/90 to-brand-slate/90 border-0">
            <CardContent className="p-6 flex items-center space-x-4">
              <Settings className="h-6 w-6 text-white/90" />
              <div>
                <h3 className="font-medium text-lg text-white/90">Settings</h3>
                <p className="text-white/70 text-sm">Manage preferences</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};