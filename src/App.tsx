import { BrowserRouter as Router } from "react-router-dom";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { useAuthState } from "@/hooks/useAuthState";
import { DisclaimerDialog } from "@/components/consent/DisclaimerDialog";

function App() {
  const { showDisclaimer, handleDisclaimerAccept, handleDisclaimerReject } = useAuthState();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <DisclaimerDialog 
          open={showDisclaimer}
          onAccept={handleDisclaimerAccept}
          onReject={handleDisclaimerReject}
        />
        <AppRoutes />
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;