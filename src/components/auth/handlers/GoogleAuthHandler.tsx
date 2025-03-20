import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createNewSession } from "@/services/session";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from "@/components/ui/button";

export const GoogleAuthHandler = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setLoading(true);
        console.log("GoogleAuthHandler: Processing callback...");
        
        // Get the session to verify the user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("No session found: Error:", sessionError);
          setError("Failed to complete Google sign in. Please try again.");
          navigate("/login?error=Authentication failed. Please try again.", { replace: true });
          return;
        }
        
        if (!session) {
          console.error("No session found: Session is null");
          setError("Failed to authenticate with Google. Please try again.");
          navigate("/login?error=No session found. Please try again.", { replace: true });
          return;
        }

        console.log("GoogleAuthHandler: User authenticated with ID:", session.user.id);
        
        // Check if this is a new user
        const isNewUser = session.user.app_metadata.provider === 'google' && 
                          session.user.created_at === session.user.last_sign_in_at;
        
        console.log("Is new user:", isNewUser);
        
        // Check if user profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = "No rows found"
          console.error("Error fetching profile:", profileError);
          setError("Failed to load your profile. Please try again.");
          navigate("/login?error=Profile error. Please try again.", { replace: true });
          return;
        }

        // If no profile exists, create one for Google user
        if (!profile) {
          console.log("GoogleAuthHandler: No profile found, creating new profile for Google user");
          
          // Extract name parts from Google metadata
          const fullName = session.user.user_metadata.full_name || 
                          session.user.user_metadata.name || 
                          session.user.email;
          
          // Create new profile for Google user with sensible defaults
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              full_name: fullName,
              subscription_plan: 'free', // Default plan
              account_status: 'active',
              query_count: 0,
              login_attempts: 0,
              email_notifications: true,
              push_notifications: true
            });

          if (insertError) {
            console.error("Error creating profile:", insertError);
            setError("Failed to create your profile. Please try again.");
            navigate("/login?error=Profile creation failed. Please try again.", { replace: true });
            return;
          }
          
          // Create a new session record
          await createNewSession(session.user.id);
          
          // Redirect to complete profile to collect additional details
          console.log("GoogleAuthHandler: Profile created, redirecting to complete profile");
          toast({
            title: "Account Created",
            description: "Please complete your profile to continue.",
          });
          navigate("/complete-profile", { replace: true });
          return;
        }
        
        console.log("GoogleAuthHandler: Profile found:", profile);

        // Create a new session record
        await createNewSession(session.user.id);
        console.log("GoogleAuthHandler: Session created");
        
        // Show success toast
        toast({
          title: "Sign In Successful",
          description: "Welcome back!",
        });

        // Redirect to chat page (or dashboard)
        console.log("GoogleAuthHandler: Redirecting to chat");
        navigate("/chat", { replace: true });
        
      } catch (error) {
        console.error("GoogleAuthHandler: Unexpected error in auth callback", error);
        
        // Try to clean up any session state
        localStorage.removeItem('session_token');
        
        setError("An unexpected error occurred. Please try again.");
        navigate("/login?error=Unexpected error. Please try again.", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-red-50">
        <div className="w-16 h-16 text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-red-700">Authentication Failed</h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <Button className="mt-4" onClick={() => navigate("/login")}>
          Return to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin"></div>
      <h2 className="mt-4 text-xl font-semibold">Completing Sign In...</h2>
      <p className="mt-2 text-gray-600">Please wait while we set up your account.</p>
    </div>
  );
};
