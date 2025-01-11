import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useCookieConsent = (userEmail: string | null) => {
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkCookieConsent = async () => {
      console.log("Checking cookie consent for user:", userEmail);
      
      if (!userEmail) {
        const hasAcceptedCookies = localStorage.getItem("cookie-consent");
        if (!hasAcceptedCookies) setShowCookieConsent(true);
        return;
      }

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

        if (!cookieConsent) setShowCookieConsent(true);
      }
    };

    checkCookieConsent();
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

  return { showCookieConsent, handleCookieConsent };
};