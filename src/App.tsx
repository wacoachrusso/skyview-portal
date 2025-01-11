import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { useConsents } from "@/hooks/useConsents";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { DisclaimerDialog } from "@/components/consent/DisclaimerDialog";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client with specific configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  console.log('Rendering App component');
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function AppContent() {
  console.log('Rendering AppContent');
  
  const { 
    showCookieConsent, 
    showDisclaimer, 
    handleCookieConsent, 
    handleDisclaimerConsent 
  } = useConsents();

  const showConsentBanner = showCookieConsent && !showDisclaimer;

  return (
    <ThemeProvider>
      <AppRoutes />
      <Toaster />
      
      {/* Only show consent banners if user is logged in */}
      {showConsentBanner && (
        <ConsentBanner onAccept={handleCookieConsent} />
      )}
      
      {showDisclaimer && (
        <DisclaimerDialog
          open={showDisclaimer}
          onAccept={() => handleDisclaimerConsent(true)}
          onReject={() => handleDisclaimerConsent(false)}
        />
      )}
    </ThemeProvider>
  );
}

export default App;