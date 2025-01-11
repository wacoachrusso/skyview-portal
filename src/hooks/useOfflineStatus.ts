import { useState, useEffect } from 'react';

interface OfflineState {
  isOffline: boolean;
  offlineError: string | null;
}

export function useOfflineStatus(): OfflineState {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineError, setOfflineError] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      console.log('App is online');
      setIsOffline(false);
      setOfflineError(null);
    };
    
    const handleOffline = () => {
      console.log('App is offline');
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial offline check
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOffline, offlineError };
}