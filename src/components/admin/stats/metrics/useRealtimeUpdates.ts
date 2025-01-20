import { useEffect, useRef } from 'react';

export const useRealtimeUpdates = (callback: () => void) => {
  const intervalRef = useRef<number>();

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = window.setInterval(() => {
      callback();
    }, 30000); // Update every 30 seconds

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [callback]);
};