import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { AppRoutes } from "@/components/routing/AppRoutes";
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
  useEffect(() => {
    console.log('App component mounted');
    console.log('Current route:', window.location.pathname);
    console.log('Environment:', import.meta.env.MODE);
    
    // Add listener for online/offline status
    const handleOnline = () => {
      console.log('Application is online');
      queryClient.invalidateQueries();
    };

    const handleOffline = () => {
      console.log('Application is offline');
    };

    // Add listener for visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, refreshing data');
        queryClient.invalidateQueries();
      }
    };

    // Add listener for unhandled errors
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);
      // Prevent infinite error loops
      if (!event.error?.message?.includes('Loading chunk')) {
        window.location.reload();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('error', handleError);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up event listeners
    return () => {
      console.log('App component unmounted');
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('error', handleError);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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
            <div className="min-h-screen bg-background">
              <AppRoutes />
            </div>
          </Suspense>
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;