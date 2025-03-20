
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNewSession } from "@/services/sessionService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const GoogleAuthHandler = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setLoading(true);
        console.log("GoogleAuthHandler: Processing callback...");

        // Get session to verify user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error("No session found:", sessionError || "Session is null");
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Failed to complete Google sign in. Please try again.",
          });
          navigate("/login", { replace: true });
          return;
        }

        console.log("GoogleAuthHandler: User authenticated, fetching profile...");
        
        // Check if user profile exists (for Google sign-ins, profiles aren't created automatically)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = "No rows found"
          console.error("Error fetching profile:", profileError);
          toast({
            variant: "destructive",
            title: "Profile Error",
            description: "Failed to load your profile. Please try again.",
          });
          navigate("/login", { replace: true });
          return;
        }

        // If no profile exists, create one for Google user
        if (!profile) {
          console.log("GoogleAuthHandler: No profile found, creating new profile for Google user");
          
          // Create new profile for Google user
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata.full_name || session.user.email,
              subscription_plan: 'free', // Default plan
              account_status: 'active',
              query_count: 0
            });

          if (insertError) {
            console.error("Error creating profile:", insertError);
            toast({
              variant: "destructive",
              title: "Profile Creation Error",
              description: "Failed to create your profile. Please try again.",
            });
            await supabase.auth.signOut();
            navigate("/login", { replace: true });
            return;
          }
        } else {
          console.log("GoogleAuthHandler: Profile found:", profile);
        }

        // Create a new session record
        await createNewSession(session.user.id);
        console.log("GoogleAuthHandler: Session created, redirecting to dashboard");

        // Redirect to dashboard
        navigate("/dashboard", { replace: true });
        
        toast({
          title: "Sign In Successful",
          description: "Welcome back!",
        });
      } catch (error) {
        console.error("GoogleAuthHandler: Unexpected error in auth callback", error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "An unexpected error occurred. Please try again.",
        });
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin"></div>
      <h2 className="mt-4 text-xl font-semibold">Completing Sign In...</h2>
      <p className="mt-2 text-gray-600">Please wait while we set up your account.</p>
    </div>
  );
};
