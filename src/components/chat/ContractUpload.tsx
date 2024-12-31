import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function ContractUpload() {
  const { toast } = useToast();

  const handleViewContract = async () => {
    try {
      // Get current user's profile
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Not logged in",
          description: "Please log in to view your contract",
          variant: "destructive",
        });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('airline, user_type')
        .eq('id', session.user.id)
        .single();

      if (!profile?.airline || !profile?.user_type) {
        toast({
          title: "Profile incomplete",
          description: "Please complete your profile with airline and position information",
          variant: "destructive",
        });
        return;
      }

      // Construct the file path based on airline and user type
      const fileName = `${profile.airline.toLowerCase()}_${profile.user_type.toLowerCase()}.pdf`;
      
      // Get the file URL from storage
      const { data: { publicUrl } } = supabase
        .storage
        .from('contracts')
        .getPublicUrl(fileName);

      // Open in new tab
      window.open(publicUrl, '_blank');

    } catch (error) {
      console.error('Error viewing contract:', error);
      toast({
        title: "Error",
        description: "Could not retrieve your contract. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleViewContract}
      className="bg-white/5 hover:bg-white/10 text-white border-white/10"
    >
      <FileText className="h-4 w-4 mr-2" />
      View Contract
    </Button>
  );
}