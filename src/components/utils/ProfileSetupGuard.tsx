import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../ui/use-toast";

const ProfileSetupGuard = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    
    useEffect(() => {
      // Function to handle profile setup protection
      const handleProfileSetupProtection = () => {
        // Only apply protection if profile setup is required
        const isProfileSetupRequired = sessionStorage.getItem('block_navigation_until_profile_complete') === 'true';
        
        if (isProfileSetupRequired) {
          console.log("Profile setup protection active");
          
          // Check URL parameters for pricing section
          const urlParams = new URLSearchParams(window.location.search);
          const scrollToSection = urlParams.get('scrollTo');
          
          if (scrollToSection === 'pricing-section') {
            console.log("Blocking redirect to pricing section during profile setup");
            
            // Remove the query parameter
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            
            // Get the auth callback URL
            const callbackUrl = `${window.location.origin}/auth/callback?provider=google`;
            
            // Show toast and redirect back to auth flow
            toast({
              variant: "destructive",
              title: "Profile Setup Required",
              description: "Please complete your profile setup before continuing."
            });
            
            // Redirect back to the auth flow
            window.location.href = callbackUrl;
            return true;
          }
          
          // Allowlist of paths that are part of the auth flow
          const allowedPaths = [
            '/auth/callback', 
            '/login'
          ];
          
          // If we're not on an allowed path, redirect back to auth
          const currentPath = location.pathname;
          if (!allowedPaths.some(path => currentPath.includes(path))) {
            console.log("Blocking navigation during profile setup:", currentPath);
            
            // Show toast 
            toast({
              variant: "destructive",
              title: "Profile Setup Required",
              description: "Please complete your profile setup."
            });
            
            // Redirect back to the auth callback
            const loginInProgress = localStorage.getItem('login_in_progress') === 'true';
            if (loginInProgress) {
              const callbackUrl = `${window.location.origin}/auth/callback?provider=google`;
              window.location.href = callbackUrl;
            } else {
              navigate('/login', { replace: true });
            }
            
            return true;
          }
        }
        
        return false; // No blocking needed
      };
      
      // Initial check
      handleProfileSetupProtection();
      
      // Setup event listeners
      const handleUrlChange = () => {
        handleProfileSetupProtection();
      };
      
      window.addEventListener('popstate', handleUrlChange);
      
      return () => {
        window.removeEventListener('popstate', handleUrlChange);
      };
    }, [location, navigate, toast]);
    
    return <>{children}</>;
  };

  export default ProfileSetupGuard;