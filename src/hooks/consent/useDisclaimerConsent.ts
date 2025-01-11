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

      const { data: user } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", userEmail)
        .single();

      if (user) {
        const { data: disclaimerConsent } = await supabase
          .from("disclaimer_consents")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (!disclaimerConsent) setShowDisclaimer(true);
      }
    };

    checkDisclaimerConsent();
  }, [userEmail]);

  const handleDisclaimerConsent = async (accepted: boolean) => {
    console.log("Handling disclaimer consent:", accepted);
    
    if (userEmail) {
      const { data: user } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", userEmail)
        .single();

      if (user) {
        await supabase.from("disclaimer_consents").upsert({
          user_id: user.id,
          status: accepted ? "accepted" : "rejected",
          has_seen_chat_disclaimer: true
        });
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