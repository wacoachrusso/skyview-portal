import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useDisclaimerConsent = (userEmail: string | null) => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkDisclaimerConsent = async () => {
      console.log("Checking disclaimer consent for user:", userEmail);
      
      if (!userEmail) {
        const hasAcceptedDisclaimer = localStorage.getItem("disclaimer-consent");
        if (!hasAcceptedDisclaimer) setShowDisclaimer(true);
        return;
      }

      try {
        const { data: user } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", userEmail)
          .maybeSingle();

        if (!user) {
          console.error("No profile found for user");
          return;
        }

        const { data: disclaimerConsent } = await supabase
          .from("disclaimer_consents")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!disclaimerConsent) {
          console.log("No disclaimer consent found, showing dialog");
          setShowDisclaimer(true);
        } else {
          console.log("Existing disclaimer consent found:", disclaimerConsent);
          setShowDisclaimer(false);
        }
      } catch (error) {
        console.error("Error checking disclaimer consent:", error);
        setShowDisclaimer(true);
      }
    };

    checkDisclaimerConsent();
  }, [userEmail]);

  const handleDisclaimerConsent = async (accepted: boolean) => {
    console.log("Handling disclaimer consent:", accepted);
    
    if (userEmail) {
      try {
        const { data: user } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", userEmail)
          .maybeSingle();

        if (!user) {
          throw new Error("User profile not found");
        }

        const { error: upsertError } = await supabase
          .from("disclaimer_consents")
          .upsert({
            user_id: user.id,
            status: accepted ? "accepted" : "rejected",
            has_seen_chat_disclaimer: true
          });

        if (upsertError) {
          throw upsertError;
        }
      } catch (error) {
        console.error("Error saving disclaimer consent:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save disclaimer response. Please try again.",
        });
        return;
      }
    } else {
      localStorage.setItem("disclaimer-consent", accepted ? "accepted" : "rejected");
    }
    
    setShowDisclaimer(false);
    if (accepted) {
      toast({
        title: "Welcome to SkyGuide",
        description: "Thank you for accepting our terms.",
      });
    }
  };

  return { showDisclaimer, handleDisclaimerConsent };
};