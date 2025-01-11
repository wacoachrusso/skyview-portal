import { useAuthState } from "@/hooks/useAuthState";
import { useCookieConsent } from "./consent/useCookieConsent";
import { useDisclaimerConsent } from "./consent/useDisclaimerConsent";

export const useConsents = () => {
  const { userEmail } = useAuthState();
  const { showCookieConsent, handleCookieConsent } = useCookieConsent(userEmail);
  const { showDisclaimer, handleDisclaimerConsent } = useDisclaimerConsent(userEmail);

  return {
    showCookieConsent,
    showDisclaimer,
    handleCookieConsent,
    handleDisclaimerConsent
  };
};