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
    
    console.log("Contract click handler initiated", { 
      userProfile,
      airline: userProfile?.airline,
      userType: userProfile?.user_type
    });
    
    if (!userProfile?.airline || !userProfile?.user_type) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your profile with airline and job title information.",
        variant: "destructive"
      });
      return;
    }

    // Format the airline name and job type in various ways
    const airline = userProfile.airline.toLowerCase();
    const jobType = userProfile.user_type.toLowerCase();
    const airlineUnderscored = airline.replace(/\s+/g, '_');
    const airlineNoSpace = airline.replace(/\s+/g, '');
    const jobTypeUnderscored = jobType.replace(/\s+/g, '_');
    
    // Try different possible filenames
    const fileNames = [
      `${airlineUnderscored}_${jobTypeUnderscored}.pdf`,
      `${airline}_${jobType}.pdf`,
      `${airlineNoSpace}_${jobTypeUnderscored}.pdf`,
      `${airlineUnderscored}_${jobType}.pdf`,
      `${airline.replace(/airlines?/i, '')}_${jobType}.pdf`.trim(),
      `${airlineNoSpace}${jobType}.pdf`
    ];

    console.log("Attempting to fetch contract with possible filenames:", fileNames);

    let signedUrl = null;
    let error = null;

    // Try each filename until we find one that works
    for (const fileName of fileNames) {
      console.log("Trying filename:", fileName);
      
      const { data, error: fetchError } = await supabase.storage
        .from('contracts')
        .createSignedUrl(fileName, 300);

      if (data && !fetchError) {
        console.log("Successfully found contract with filename:", fileName);
        signedUrl = data.signedUrl;
        break;
      }
      error = fetchError;
      console.log("Failed to fetch with filename:", fileName, "Error:", fetchError);
    }

    if (!signedUrl) {
      console.error('Error fetching contract:', error);
      
      toast({
        title: "Contract Not Found",
        description: "Unable to locate the contract file. Please contact support and provide your airline and job title.",
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