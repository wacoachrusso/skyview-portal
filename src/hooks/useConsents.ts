import { useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { useCookieConsent } from "./consent/useCookieConsent";
import { useDisclaimerConsent } from "./consent/useDisclaimerConsent";
import { supabase } from "@/integrations/supabase/client";

export const useConsents = () => {
  const { userEmail } = useAuthState();
  const { showCookieConsent, handleCookieConsent } = useCookieConsent(userEmail);
  const { showDisclaimer, handleDisclaimerConsent } = useDisclaimerConsent(userEmail);

  useEffect(() => {
    const checkExistingConsents = async () => {
      // Only check consents if user is logged in
      if (!userEmail) {
        console.log('No user logged in, skipping consent checks');
        return;
      }

      try {
        console.log('Checking existing consents for user:', userEmail);
        
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', userEmail)
          .single();

        if (!profile) {
          console.log('No profile found for user');
          return;
        }

        // Check cookie consent
        const { data: cookieConsent } = await supabase
          .from('cookie_consents')
          .select('*')
          .eq('user_id', profile.id)
          .maybeSingle();

        // Check disclaimer consent
        const { data: disclaimerConsent } = await supabase
          .from('disclaimer_consents')
          .select('*')
          .eq('user_id', profile.id)
          .maybeSingle();

        console.log('Existing consents:', { cookieConsent, disclaimerConsent });

        // If consents exist, update local state
        if (cookieConsent) {
          handleCookieConsent(cookieConsent.preferences);
        }

        if (disclaimerConsent) {
          handleDisclaimerConsent(disclaimerConsent.status === 'accepted');
        }
      } catch (error) {
        console.error('Error checking existing consents:', error);
      }
    };

    checkExistingConsents();
  }, [userEmail, handleCookieConsent, handleDisclaimerConsent]);

  // Only show consents if user is logged in
  const shouldShowCookieConsent = !!userEmail && showCookieConsent;
  const shouldShowDisclaimer = !!userEmail && showDisclaimer;

  return {
    showCookieConsent: shouldShowCookieConsent,
    showDisclaimer: shouldShowDisclaimer,
    handleCookieConsent,
    handleDisclaimerConsent
  };
};