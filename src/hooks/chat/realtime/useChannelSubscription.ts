
import { useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to manage Supabase channel subscription lifecycle
 */
export function useChannelSubscription() {
  const activeChannelRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // Cleanup function for channel subscription
  const cleanupChannel = () => {
    if (activeChannelRef.current) {
      console.log(`Removing channel: ${activeChannelRef.current}`);
      supabase.removeChannel(activeChannelRef.current);
      activeChannelRef.current = null;
    }
  };

  // Set the current channel
  const setActiveChannel = (channel: any) => {
    cleanupChannel();
    activeChannelRef.current = channel;
  };

  // Component lifecycle management
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      cleanupChannel();
    };
  }, []);

  return {
    activeChannel: activeChannelRef.current,
    isMounted: isMountedRef.current,
    setActiveChannel,
    cleanupChannel
  };
}
