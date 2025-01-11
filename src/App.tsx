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
      refetchOnWindowFocus: true, // Changed to true to keep data fresh
      refetchOnMount: true, // Added to ensure data loads on component mount
      refetchOnReconnect: true, // Added to refetch when reconnecting
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
      queryClient.invalidateQueries(); // Refetch all queries when coming back online
    };

    const handleOffline = () => {
      console.log('Application is offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up event listeners
    return () => {
      console.log('App component unmounted');
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
          <Suspense 
            fallback={
              <div className="flex h-screen w-full items-center justify-center bg-background">
                <LoadingSpinner />
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