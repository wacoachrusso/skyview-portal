import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { createNewSession } from "@/services/session";

export const GoogleAuthHandler = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setLoading(true);
        console.log("GoogleAuthHandler: Processing callback...");

        // Prevent auth-related redirects during processing
        localStorage.setItem("login_in_progress", "true");

        // Get the session to verify the user is authenticated
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error("No session found:", sessionError || "Session is null");
          setError("Failed to authenticate with Google. Please try again.");
          localStorage.removeItem("login_in_progress");
          navigate("/login?error=Authentication failed. Please try again.", {
            replace: true,
          });
          return;
        }

        console.log(
          "GoogleAuthHandler: User authenticated with ID:",
          session.user.id
        );

        // Set session tokens for persistence
        localStorage.setItem("auth_access_token", session.access_token);
        localStorage.setItem("auth_refresh_token", session.refresh_token);

        // Check if user profile exists
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError);
          setError("Failed to load your profile. Please try again.");
          localStorage.removeItem("login_in_progress");
          navigate("/login?error=Profile error. Please try again.", {
            replace: true,
          });
          return;
        }

        // If no profile exists, create one
        if (!profile) {
          console.log(
            "GoogleAuthHandler: No profile found, creating new profile"
          );

          const fullName =
            session.user.user_metadata.full_name ||
            session.user.user_metadata.name ||
            session.user.email;

          // Default to first available assistant
          const { data: defaultAssistant } = await supabase
            .from("openai_assistants")
            .select("assistant_id")
            .eq("is_active", true)
            .limit(1)
            .maybeSingle();

          const assistantId = defaultAssistant?.assistant_id;

          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: session.user.id,
              email: session.user.email,
              full_name: fullName,
              subscription_plan: "free",
              account_status: "active",
              query_count: 0,
              login_attempts: 0,
              email_notifications: true,
              push_notifications: true,
              assistant_id: assistantId,
            });

          if (insertError) {
            console.error("Error creating profile:", insertError);
            setError("Failed to create your profile. Please try again.");
            localStorage.removeItem("login_in_progress");
            navigate(
              "/login?error=Profile creation failed. Please try again.",
              { replace: true }
            );
            return;
          }

          // Create session
          await createNewSession(session.user.id);

          // Fetch the newly created profile to store in localStorage
          const { data: newProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
            
          if (newProfile) {
            console.log("GoogleAuthHandler: Storing new profile in localStorage:", 
              { id: newProfile.id, email: newProfile.email, name: newProfile.full_name });
            // Store profile in localStorage
            localStorage.setItem("user_profile", JSON.stringify(newProfile));
            localStorage.setItem("auth_user_name", newProfile.full_name);
          } else {
            console.warn("GoogleAuthHandler: Could not fetch profile data after creation");
          }

          toast({
            title: "Account Created",
            description: "Your account has been created successfully.",
          });

          // Set flag to indicate that profile needs completion
          localStorage.setItem("needs_profile_completion", "true");
          console.log("GoogleAuthHandler: Setting needs_profile_completion flag and redirecting");
          
          // Redirect to the missing info handler
          navigate("/auth/complete-profile", { replace: true });
          return;
        }

        console.log(
          "GoogleAuthHandler: Existing profile found, checking for required fields"
        );

        // Check if user has required job title and airline information
        if (!profile.user_type || !profile.airline) {
          console.log("GoogleAuthHandler: Missing required profile information", { 
            user_type: profile.user_type || 'MISSING', 
            airline: profile.airline || 'MISSING'
          });
          
          console.log("GoogleAuthHandler: Storing partial profile data before redirecting");
          // Store available profile data before redirecting
          localStorage.setItem("user_profile", JSON.stringify(profile));
          localStorage.setItem("auth_user_name", profile.full_name);
          
          // Set flag to indicate that profile needs completion
          localStorage.setItem("needs_profile_completion", "true");
          console.log("GoogleAuthHandler: Setting needs_profile_completion flag and redirecting to /auth/complete-profile");
          // Redirect to the missing info handler
          navigate("/auth/complete-profile", { replace: true });
          return;
        }

        // Create session and redirect
        await createNewSession(session.user.id);
        localStorage.removeItem("login_in_progress");
        console.log("GoogleAuthHandler: Removed login_in_progress flag");
        
        // Get the most up-to-date profile data to ensure we have all fields
        console.log("GoogleAuthHandler: Fetching fresh profile data before redirecting");
        const { data: freshProfile, error: freshProfileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
          
        if (freshProfileError) {
          console.error("GoogleAuthHandler: Error fetching updated profile:", freshProfileError);
          // Continue with existing profile data if refresh fails
        }
        
        // Use the most recent profile data if available
        const finalProfile = freshProfile || profile;
        console.log("GoogleAuthHandler: Using final profile data:", { 
          id: finalProfile.id,
          email: finalProfile.email,
          name: finalProfile.full_name,
          job: finalProfile.user_type,
          airline: finalProfile.airline,
          is_admin: finalProfile.is_admin || false
        });

        // Set admin status in localStorage for quick access
        if (finalProfile.is_admin) {
          localStorage.setItem("user_is_admin", "true");
          console.log("GoogleAuthHandler: User is admin, setting admin flag");
        } else {
          localStorage.removeItem("user_is_admin");
        }

        // Store complete profile and name in localStorage
        localStorage.setItem("user_profile", JSON.stringify(finalProfile));
        localStorage.setItem("auth_user_name", finalProfile.full_name);
        console.log("GoogleAuthHandler: Stored complete profile in localStorage");

        toast({
          title: "Sign In Successful",
          description: "Welcome back!",
        });

        // Store flag to prevent pricing redirects
        sessionStorage.setItem("recently_signed_up", "true");

        navigate("/chat", { replace: true });
      } catch (error) {
        console.error(
          "GoogleAuthHandler: Unexpected error in auth callback",
          error
        );
        localStorage.removeItem("login_in_progress");
        setError("An unexpected error occurred. Please try again.");
        navigate("/login?error=Unexpected error. Please try again.", {
          replace: true,
        });
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-luxury-dark">
        <div className="max-w-md w-full px-6 py-8 bg-card-gradient border border-white/10 rounded-lg shadow-lg backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-red-400 text-center">
            Authentication Failed
          </h2>
          <p className="mt-2 text-gray-300 text-center">{error}</p>
          <div className="mt-6 flex justify-center">
            <Button onClick={() => navigate("/login")}>Return to Login</Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-luxury-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-300">Authenticating with Google...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-luxury-dark">
      <p className="text-gray-300">Authentication successful! Redirecting...</p>
    </div>
  );
};