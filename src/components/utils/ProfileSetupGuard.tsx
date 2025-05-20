import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "../ui/use-toast";

const ProfileSetupGuard = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    
    useEffect(() => {
      const checkProfileCompletion = async () => {
        try {
          // First, check if the user is authenticated at all
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          // If no valid session, don't enforce profile completion checks
          if (sessionError || !session) {
            return;
          }
          
          // The user has a valid session, check if they have a complete profile
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("user_type, airline")
            .eq("id", session.user.id)
            .single();
            
          // If error other than not found, don't block
          if (profileError && profileError.code !== 'PGRST116') {
            return;
          }
            
          // Check if the profile requires completion
          const needsProfileCompletion = !profile || !profile.user_type || !profile.airline;
            
          // Only enforce checks for authenticated users with incomplete profiles
          if (needsProfileCompletion) {
            console.log("User has incomplete profile, checking path...");
            
            // Allowlist of public paths that should never be blocked
            const publicPaths = [
              '/', 
              '/login', 
              '/signup', 
              '/pricing', 
              '/about',
              '/contact',
              '/terms',
              '/privacy'
            ];
            
            // Allowlist of paths that are part of the auth flow
            const authPaths = [
              '/auth/callback'
            ];
            
            // Check if current path is in allowlist
            const currentPath = location.pathname;
            const isPublicPath = publicPaths.some(path => 
              currentPath === path || currentPath.startsWith(`${path}/`)
            );
            const isAuthPath = authPaths.some(path => 
              currentPath.startsWith(path)
            );
            
            // If not public or auth path, and user has incomplete profile, redirect to profile setup
            if (!isPublicPath && !isAuthPath) {
              console.log("Redirecting to auth callback for profile completion");
              
              toast({
                variant: "destructive",
                title: "Profile Setup Required",
                description: "You need to complete your profile before accessing this page."
              });
              
              // Redirect to auth callback which will handle profile setup
              const callbackUrl = `${window.location.origin}/auth/callback?provider=google`;
              navigate(callbackUrl, { replace: true });
              return;
            }
          }
        } catch (error) {
          console.error("Error in profile check:", error);
          // In case of error, don't block navigation
        }
      };
      
      // Run check when location changes
      checkProfileCompletion();
    }, [location.pathname, navigate, toast]);
    
    return <>{children}</>;
  };

  export default ProfileSetupGuard;