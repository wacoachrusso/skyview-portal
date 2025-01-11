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

      try {
        const { data: user, error: userError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", userEmail)
          .maybeSingle();

        if (userError) {
          console.error("Error fetching user profile:", userError);
          setShowCookieConsent(true);
          return;
        }

        if (user) {
          const { data: cookieConsent, error: consentError } = await supabase
            .from("cookie_consents")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          if (consentError) {
            console.error("Error fetching cookie consent:", consentError);
            setShowCookieConsent(true);
            return;
          }

          if (!cookieConsent) {
            console.log("No cookie consent found, showing banner");
            setShowCookieConsent(true);
          }
        }
      } catch (error) {
        console.error("Error checking cookie consent:", error);
        setShowCookieConsent(true);
      }
    };

    checkCookieConsent();
  }, [userEmail]);

  const handleCookieConsent = async (preferences: "essential" | "analytics" | "marketing" | "all" | "none") => {
    console.log("Handling cookie consent:", preferences);
    
    if (userEmail) {
      try {
        const { data: user, error: userError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", userEmail)
          .maybeSingle();

        if (userError) {
          throw userError;
        }

        if (user) {
          const { error: upsertError } = await supabase
            .from("cookie_consents")
            .upsert({
              user_id: user.id,
              preferences,
              updated_at: new Date().toISOString()
            });

          if (upsertError) {
            throw upsertError;
          }
        }
      } catch (error) {
        console.error("Error saving cookie consent:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save cookie preferences. Please try again.",
        });
        return;
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