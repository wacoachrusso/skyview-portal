
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useWaitlistStatus = () => {
  const [isWaitlistChecking, setIsWaitlistChecking] = useState(true);
  const [shouldShowWaitlist, setShouldShowWaitlist] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    const isAdminLogin = window.location.pathname === '/login' && 
                        window.location.search.includes('admin=true');
    
    if (isAdminRoute || isAdminLogin) {
      console.log("Admin route detected, bypassing waitlist check in AppRoutes");
      setIsWaitlistChecking(false);
      setShouldShowWaitlist(false);
      return;
    }
    
    const checkWaitlistGlobal = async () => {
      try {
        // Reduce attempts and timeout for faster loading
        let attempts = 0;
        const maxAttempts = 2;
        let waitlistData = null;
        
        while (attempts < maxAttempts && waitlistData === null) {
          try {
            console.log(`AppRoutes - Global waitlist check attempt ${attempts + 1}`);
            const { data, error } = await supabase
              .from('app_settings')
              .select('value')
              .eq('key', 'show_waitlist')
              .maybeSingle(); // Use maybeSingle instead of single
              
            if (data && !error) {
              waitlistData = data;
              break;
            } else if (error) {
              console.error(`Attempt ${attempts + 1} error:`, error);
            }
          } catch (fetchError) {
            console.error(`Fetch attempt ${attempts + 1} failed:`, fetchError);
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            // Reduce timeout from 1000ms to 500ms
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        console.log("AppRoutes - Global waitlist check final status:", waitlistData?.value);
        
        if (!waitlistData) {
          console.warn("Could not fetch waitlist settings - defaulting to NOT show waitlist");
          setShouldShowWaitlist(false);
        } else {
          const waitlistEnabled = !!waitlistData.value;
          console.log("Setting global waitlist enabled to:", waitlistEnabled);
          setShouldShowWaitlist(waitlistEnabled);
        }
        
        if (shouldShowWaitlist && window.location.pathname !== '/' && 
            !isAdminRoute && !isAdminLogin) {
          console.log("Waitlist is enabled, redirecting to home from AppRoutes");
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error("Error in global waitlist check:", error);
        setShouldShowWaitlist(false);
      } finally {
        setIsWaitlistChecking(false);
      }
    };
    
    // Set a timeout in case the check takes too long
    const timeoutId = setTimeout(() => {
      if (isWaitlistChecking) {
        console.log("Global waitlist check timed out, proceeding with default (no waitlist)");
        setIsWaitlistChecking(false);
        setShouldShowWaitlist(false);
      }
    }, 2000); // Reduced timeout to 2 seconds
    
    checkWaitlistGlobal();
    
    return () => clearTimeout(timeoutId);
  }, [navigate, shouldShowWaitlist]);
  
  // Reduce loading time by showing content after a maximum of 2 seconds
  useEffect(() => {
    const forceLoadTimeout = setTimeout(() => {
      if (isWaitlistChecking) {
        console.log("Force loading app content after timeout");
        setIsWaitlistChecking(false);
      }
    }, 2000);
    
    return () => clearTimeout(forceLoadTimeout);
  }, [isWaitlistChecking]);

  return {
    isWaitlistChecking,
    shouldShowWaitlist
  };
};
