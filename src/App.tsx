import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { LazyMotion, domAnimation } from "framer-motion";
import { BrowserRouter } from "react-router-dom";
import { ViewportManager } from "@/components/utils/ViewportManager";
import * as Sentry from "@sentry/react";
import { AuthProvider } from "./components/utils/AuthProvider";
import { AppLoadingSpinner } from "./components/ui/app-loading-spinner";

// Create QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
function FallbackComponent() {
  return <div>An error has occurred</div>;
}
function App() {
  return (
    <Sentry.ErrorBoundary fallback={FallbackComponent} showDialog>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <LazyMotion features={domAnimation}>
            <BrowserRouter>
              {/* Handle viewport meta tag */}
              <ViewportManager />

              <div className="min-h-[100dvh] bg-luxury-dark">
                <Suspense fallback={<AppLoadingSpinner />}>
                  <AuthProvider>
                    <AppRoutes />
                  </AuthProvider>
                </Suspense>
              </div>
              <Toaster />
            </BrowserRouter>
          </LazyMotion>
        </ThemeProvider>
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  );
}

export default App;
