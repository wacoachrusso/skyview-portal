
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useWaitlistSettings = () => {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitlistForceOpen, setWaitlistForceOpen] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(true);

  useEffect(() => {
    console.log("Loading waitlist settings...");
    
    const loadWaitlistSettings = async () => {
      try {
        setWaitlistLoading(true);
        
        // Add a timeout to prevent long loading times
        const waitlistPromise = new Promise<void>(async (resolve) => {
          try {
            // Reduce attempts for faster loading
            let attempts = 0;
            const maxAttempts = 2;
            let waitlistData = null;
            let forceOpenData = null;
            
            while (attempts < maxAttempts && (waitlistData === null || forceOpenData === null)) {
              try {
                console.log(`Waitlist settings fetch attempt ${attempts + 1}`);
                
                const { data: showWaitlistResult, error: showError } = await supabase
                  .from('app_settings')
                  .select('value')
                  .eq('key', 'show_waitlist')
                  .maybeSingle();

                const { data: forceOpenResult, error: forceError } = await supabase
                  .from('app_settings')
                  .select('value')
                  .eq('key', 'waitlist_force_open')
                  .maybeSingle();
                  
                // Only update if we got valid results
                if (showWaitlistResult && !showError) {
                  waitlistData = showWaitlistResult;
                } else if (showError) {
                  console.error("Error fetching waitlist setting:", showError);
                }
                
                if (forceOpenResult && !forceError) {
                  forceOpenData = forceOpenResult;
                } else if (forceError) {
                  console.error("Error fetching force open setting:", forceError);
                }
                
                if (waitlistData && forceOpenData) break;
              } catch (fetchError) {
                console.error(`Fetch attempt ${attempts + 1} failed:`, fetchError);
              }
              
              attempts++;
              if (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            }
            
            console.log("Final waitlist settings:", { 
              showWaitlist: waitlistData?.value, 
              forceOpen: forceOpenData?.value
            });

            // If we failed to fetch data after all attempts, default to NOT showing waitlist
            if (!waitlistData) {
              console.warn("Could not fetch waitlist settings - defaulting to NOT show waitlist");
              setShowWaitlist(false);
            } else {
              // Explicitly convert to boolean using double negation to handle any type issues
              const waitlistEnabled = !!waitlistData.value;
              console.log("Setting waitlist enabled to:", waitlistEnabled);
              setShowWaitlist(waitlistEnabled);
            }
            
            if (!forceOpenData) {
              setWaitlistForceOpen(false);
            } else {
              setWaitlistForceOpen(!!forceOpenData.value);
            }
            
            resolve();
          } catch (error) {
            console.error("Error in waitlist promise:", error);
            setShowWaitlist(false);
            setWaitlistForceOpen(false);
            resolve();
          }
        });
        
        // Set a timeout to ensure we don't wait too long
        const timeoutPromise = new Promise<void>((resolve) => {
          setTimeout(() => {
            console.log("Waitlist settings fetch timed out - defaulting to NOT show waitlist");
            setShowWaitlist(false);
            setWaitlistForceOpen(false);
            resolve();
          }, 2000); // Timeout after 2 seconds
        });
        
        // Use Promise.race to take whichever resolves first
        await Promise.race([waitlistPromise, timeoutPromise]);
      } catch (error) {
        console.error("Error loading waitlist settings:", error);
        // Default to NOT showing waitlist on error
        setShowWaitlist(false);
      } finally {
        setWaitlistLoading(false);
      }
    };

    loadWaitlistSettings();
  }, []);

  // Reduce loading time by showing content after a short delay
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (waitlistLoading) {
        console.log("Force ending loading state after timeout");
        setWaitlistLoading(false);
      }
    }, 2000); // Show content after 2 seconds maximum
    
    return () => clearTimeout(loadingTimeout);
  }, [waitlistLoading]);

  return {
    showWaitlist,
    waitlistForceOpen,
    waitlistLoading
  };
};
