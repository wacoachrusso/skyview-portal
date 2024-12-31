import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";

export const useContractHandler = () => {
  const { toast } = useToast();
  const { userProfile } = useUserProfile();

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

    const formattedAirline = userProfile.airline.toLowerCase().replace(/\s+/g, '_');
    const formattedJobType = userProfile.user_type.toLowerCase().replace(/\s+/g, '_');
    const fileName = `${formattedAirline}_${formattedJobType}.pdf`;
    
    console.log("Attempting to fetch contract:", fileName);

    try {
      const { data, error } = await supabase.storage
        .from('contracts')
        .createSignedUrl(fileName, 60);

      if (error) {
        console.error('Error fetching contract:', error);
        
        if (error.message.includes('Object not found')) {
          toast({
            title: "Contract Not Found",
            description: `No contract found for ${userProfile.airline} ${userProfile.user_type}. Please contact support.`,
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Contract Unavailable",
          description: "Unable to access the contract. Please try again later.",
          variant: "destructive"
        });
        return;
      }

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

  return { handleContractClick };
};