
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { performInitialSessionCheck } from "@/utils/session/initialSessionCheck";
import { disableRedirects } from "@/utils/navigation";

export function InitialSessionCheck() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Disable redirects temporarily to prevent flash
    disableRedirects(3000);
    
    // Delay the session check to ensure components are rendered first
    const timer = setTimeout(() => {
      performInitialSessionCheck(navigate);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return null;
}
