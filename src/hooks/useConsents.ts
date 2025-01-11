import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";

export const useConsents = () => {
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const { toast } = useToast();
  const { userEmail } = useAuthState();

  useEffect(() => {
    const checkConsents = async () => {
      console.log("Checking consents for user:", userEmail);
      
      if (!userEmail) {
        // For non-authenticated users, check localStorage
        const hasAcceptedCookies = localStorage.getItem("cookie-consent");
        const hasAcceptedDisclaimer = localStorage.getItem("disclaimer-consent");
        
        if (!hasAcceptedCookies) setShowCookieConsent(true);
        if (!hasAcceptedDisclaimer) setShowDisclaimer(true);
        return;
      }

      // For authenticated users, check database
      const { data: user } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", userEmail)
        .single();

      if (user) {
        const { data: cookieConsent } = await supabase
          .from("cookie_consents")
          .select("*")
          .eq("user_id", user.id)
          .single();

        const { data: disclaimerConsent } = await supabase
          .from("disclaimer_consents")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (!cookieConsent) setShowCookieConsent(true);
        if (!disclaimerConsent) setShowDisclaimer(true);
      }
    };

    checkConsents();
  }, [userEmail]);

  const handleCookieConsent = async (preferences: "essential" | "analytics" | "marketing" | "all" | "none") => {
    console.log("Handling cookie consent:", preferences);
    
    if (userEmail) {
      const { data: user } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", userEmail)
        .single();

      if (user) {
        await supabase.from("cookie_consents").upsert({
          user_id: user.id,
          preferences,
          updated_at: new Date().toISOString()
        });
      }
    } else {
      localStorage.setItem("cookie-consent", preferences);
    }
    
    setShowCookieConsent(false);
    toast({
      title: "Preferences Saved",
      description: "Your cookie preferences have been saved.",
    });
  };

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

  return {
    showCookieConsent,
    showDisclaimer,
    handleCookieConsent,
    handleDisclaimerConsent
  };
};