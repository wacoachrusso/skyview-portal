import { BrowserRouter as Router } from "react-router-dom";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { useAuthState } from "@/hooks/useAuthState";
import { DisclaimerDialog } from "@/components/consent/DisclaimerDialog";

function App() {
  const { showDisclaimer, handleDisclaimerAccept, handleDisclaimerReject } = useAuthState();

  return (
    <Router>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <DisclaimerDialog 
          open={showDisclaimer}
          onAccept={handleDisclaimerAccept}
          onReject={handleDisclaimerReject}
        />
        <AppRoutes />
        <Toaster />
      </ThemeProvider>
    </Router>
  );
}

export default App;