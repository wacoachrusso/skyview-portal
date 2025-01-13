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

    // Format the airline name by removing spaces and converting to lowercase
    const formattedAirline = userProfile.airline.toLowerCase().replace(/\s+/g, '_');
    const formattedJobType = userProfile.user_type.toLowerCase().replace(/\s+/g, '_');
    
    // Try different possible filenames
    const fileNames = [
      `${formattedAirline}_${formattedJobType}.pdf`,
      `${userProfile.airline.toLowerCase()}_${userProfile.user_type.toLowerCase()}.pdf`,
      `${formattedAirline.replace(/_/g, '')}_${formattedJobType}.pdf`
    ];

    console.log("Attempting to fetch contract with possible filenames:", fileNames);

    let signedUrl = null;
    let error = null;

    // Try each filename until we find one that works
    for (const fileName of fileNames) {
      const { data, error: fetchError } = await supabase.storage
        .from('contracts')
        .createSignedUrl(fileName, 300);

      if (data && !fetchError) {
        signedUrl = data.signedUrl;
        break;
      }
      error = fetchError;
    }

    if (!signedUrl) {
      console.error('Error fetching contract:', error);
      
      toast({
        title: "Contract Not Found",
        description: `No contract found for ${userProfile.airline} ${userProfile.user_type}. Please contact support.`,
        variant: "destructive"
      });
      return;
    }

    console.log("Contract URL generated:", { url: signedUrl, isMobile });

    if (isMobile) {
      // For iOS/mobile devices, try to force download behavior
      const link = document.createElement('a');
      link.href = signedUrl;
      link.target = '_self'; // Force same window
      link.rel = 'noopener noreferrer';
      link.click();
    } else {
      // For desktop, open in new tab
      window.open(signedUrl, '_blank');
    }
  };

  return { handleContractClick };
};