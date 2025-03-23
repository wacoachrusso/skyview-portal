
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface WaitlistCheckProps {
  children: React.ReactNode;
}

export const WaitlistCheck = ({ children }: WaitlistCheckProps) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [waitlistEnabled, setWaitlistEnabled] = useState(false); // Default to false to prevent loading delays

  useEffect(() => {
    const checkWaitlistStatus = async () => {
      try {
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        const isAdminLogin = window.location.pathname === '/login' && 
                            window.location.search.includes('admin=true');
        
        if (isAdminRoute || isAdminLogin) {
          console.log("Admin route detected, bypassing waitlist check");
          setWaitlistEnabled(false);
          setIsChecking(false);
          return;
        }
        
        // Reduce number of attempts and timeout duration
        let attempts = 0;
        const maxAttempts = 2;
        let waitlistData = null;
        
        while (attempts < maxAttempts && waitlistData === null) {
          try {
            console.log(`WaitlistCheck - attempt ${attempts + 1}`);
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
            // Reduced timeout from 1000ms to 500ms
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        console.log("WaitlistCheck - final waitlist status:", waitlistData?.value);
        
        if (!waitlistData) {
          console.warn("Could not fetch waitlist settings - defaulting to NOT show waitlist");
          setWaitlistEnabled(false);
        } else {
          const isEnabled = !!waitlistData.value;
          console.log("Setting waitlist enabled to:", isEnabled);
          setWaitlistEnabled(isEnabled);
        }
        
        if (waitlistEnabled && window.location.pathname !== '/') {
          console.log("Waitlist is enabled, redirecting to home");
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error("Error checking waitlist status:", error);
        setWaitlistEnabled(false); // Default to false on error
      } finally {
        setIsChecking(false);
      }
    };
    
    // Set a timeout in case the check takes too long
    const timeoutId = setTimeout(() => {
      if (isChecking) {
        console.log("Waitlist check timed out, proceeding with app");
        setIsChecking(false);
        setWaitlistEnabled(false);
      }
    }, 3000); // Timeout after 3 seconds
    
    checkWaitlistStatus();
    
    return () => clearTimeout(timeoutId);
  }, [navigate, waitlistEnabled]);
  
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return waitlistEnabled ? null : <>{children}</>;
};
