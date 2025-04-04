
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { LazyMotion, domAnimation } from "framer-motion";
import { InitialSessionCheck } from "@/components/session/InitialSessionCheck";
import { ViewportManager } from "@/components/utils/ViewportManager";
import { AppLoadingSpinner } from "@/components/ui/app-loading-spinner";

// Create QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <LazyMotion features={domAnimation}>
          <BrowserRouter>
            {/* Handle viewport meta tag */}
            <ViewportManager />
            
            <div className="min-h-[100dvh] bg-luxury-dark">
              <Suspense fallback={<AppLoadingSpinner />}>
                <InitialSessionCheck />
                <AppRoutes />
              </Suspense>
            </div>
            <Toaster />
          </BrowserRouter>
        </LazyMotion>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
