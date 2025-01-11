import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { useConsents } from "@/hooks/useConsents";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { DisclaimerDialog } from "@/components/consent/DisclaimerDialog";

function App() {
  const { 
    showCookieConsent, 
    showDisclaimer, 
    handleCookieConsent, 
    handleDisclaimerConsent 
  } = useConsents();

  // Show disclaimer first, then cookie consent
  const showConsentBanner = showCookieConsent && !showDisclaimer;

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppRoutes />
        <Toaster />
        
        {showConsentBanner && (
          <ConsentBanner onAccept={handleCookieConsent} />
        )}
        
        <DisclaimerDialog
          open={showDisclaimer}
          onAccept={() => handleDisclaimerConsent(true)}
          onReject={() => handleDisclaimerConsent(false)}
        />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;