import { useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";

interface AppEventHandlersProps {
  queryClient: QueryClient;
}

export function AppEventHandlers({ queryClient }: AppEventHandlersProps) {
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
  }, [queryClient]);

  return null;
}