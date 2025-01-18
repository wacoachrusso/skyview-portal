import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AppContent } from "@/components/app/AppContent";
import { AppEventHandlers } from "@/components/app/AppEventHandlers";
import "./App.css";

// Create a client with optimized options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
          <Suspense 
            fallback={
              <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all">
                <LoadingSpinner size="lg" className="h-12 w-12" />
              </div>
            }
          >
            <AppContent />
          </Suspense>
          <AppEventHandlers queryClient={queryClient} />
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;