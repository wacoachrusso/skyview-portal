import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { useConsents } from "@/hooks/useConsents";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { DisclaimerDialog } from "@/components/consent/DisclaimerDialog";

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

// Separate component to use hooks inside Router context
function AppContent() {
  const { 
    showCookieConsent, 
    showDisclaimer, 
    handleCookieConsent, 
    handleDisclaimerConsent 
  } = useConsents();

  // Show disclaimer first, then cookie consent
  const showConsentBanner = showCookieConsent && !showDisclaimer;

  return (
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
  );
}

export default App;