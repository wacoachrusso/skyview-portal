
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
      console.log(`Cleaning up channel: ${activeChannelRef.current}`);
      try {
        supabase.removeChannel(activeChannelRef.current);
      } catch (error) {
        console.error("Error removing channel:", error);
      }
      activeChannelRef.current = null;
    }
  };

  // Set the current channel
  const setActiveChannel = (channel: any) => {
    cleanupChannel();
    activeChannelRef.current = channel;
    console.log(`Active channel set: ${activeChannelRef.current}`);
  };

  // Component lifecycle management
  useEffect(() => {
    isMountedRef.current = true;
    console.log("Channel subscription hook mounted");
    
    return () => {
      console.log("Channel subscription hook unmounting");
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
