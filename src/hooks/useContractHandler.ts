import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

export const useContractHandler = () => {
  const { toast } = useToast();
  const { userProfile } = useUserProfile();
  const isMobile = useIsMobile();

  const handleContractClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    console.log("Contract click handler initiated", { isMobile, userProfile });
    
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
        .createSignedUrl(fileName, 300); // Increased to 5 minutes

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

      console.log("Contract URL generated:", { url: data.signedUrl, isMobile });

      if (isMobile) {
        // For iOS/mobile devices, try to force download behavior
        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.target = '_self'; // Force same window
        link.rel = 'noopener noreferrer';
        link.click();
      } else {
        // For desktop, open in new tab
        window.open(data.signedUrl, '_blank');
      }
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