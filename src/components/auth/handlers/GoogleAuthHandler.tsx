import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { createNewSession } from "@/services/session";

export const GoogleAuthHandler = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log(`[AUTH-FLOW-] GoogleAuthHandler: Auth flow initiated`);
      
      // Check if we're coming from profile completion
      const fromProfileCompletion = searchParams.get("from_profile_completion") === "true";
      const resumingAuthFlow = localStorage.getItem("resuming_auth_flow") === "true";
      const savedReturnPath = localStorage.getItem("auth_return_path");
      
      console.log(`[AUTH-FLOW-] Auth context check:`, {
        fromProfileCompletion,
        resumingAuthFlow,
        savedReturnPath: savedReturnPath || "none"
      });
      
      try {
        setLoading(true);
        console.log(`[AUTH-FLOW-] Processing callback...`);

        // Prevent auth-related redirects during processing
        localStorage.setItem("login_in_progress", "true");
        console.log(`[AUTH-FLOW-] Set login_in_progress flag in localStorage`);

        // Get the session to verify the user is authenticated
        console.log(`[AUTH-FLOW-] Fetching auth session...`);
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        
        console.log(`[AUTH-FLOW-] Session fetch result:`, {
          hasSession: !!session,
          hasError: !!sessionError,
          errorMessage: sessionError?.message || 'None',
          userId: session?.user?.id || 'None',
          authProvider: session?.user?.app_metadata?.provider || 'Unknown',
        });

        if (sessionError || !session) {
          console.error(`[AUTH-FLOW-] No session found:`, sessionError || "Session is null");
          setError("Failed to authenticate with Google. Please try again.");
          localStorage.removeItem("login_in_progress");
          localStorage.removeItem("resuming_auth_flow");
          localStorage.removeItem("auth_return_path");
          console.log(`[AUTH-FLOW-] Removed auth flow flags due to session error`);
          navigate("/login?error=Authentication failed. Please try again.", {
            replace: true,
          });
          return;
        }

        console.log(
          `[AUTH-FLOW-] User authenticated with ID: ${session.user.id}`,
          {
            email: session.user.email,
            provider: session.user.app_metadata?.provider || 'Unknown',
            metadataKeys: Object.keys(session.user.user_metadata || {}),
          }
        );

        // Set session tokens for persistence
        localStorage.setItem("auth_access_token", session.access_token);
        localStorage.setItem("auth_refresh_token", session.refresh_token);
        console.log(`[AUTH-FLOW-] Auth tokens stored in localStorage`);

        // Check if user profile exists
        console.log(`[AUTH-FLOW-] Checking if profile exists for user: ${session.user.id}`);
        let { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
          
        console.log(`[AUTH-FLOW-] Profile fetch result:`, {
          profileFound: !!profile,
          hasError: !!profileError,
          errorCode: profileError?.code || 'None',
          errorMessage: profileError?.message || 'None'
        });
        
        if (profileError && profileError.code !== "PGRST116") {
          console.error(`[AUTH-FLOW-] Error fetching profile:`, profileError);
          setError("Failed to load your profile. Please try again.");
          localStorage.removeItem("login_in_progress");
          localStorage.removeItem("resuming_auth_flow");
          localStorage.removeItem("auth_return_path");
          console.log(`[AUTH-FLOW-] Removed auth flow flags due to profile error`);
          navigate("/login?error=Profile error. Please try again.", {
            replace: true,
          });
          return;
        }

        // If we're resuming an auth flow and have a return path, prioritize that
        if (resumingAuthFlow && savedReturnPath) {
          console.log(`[AUTH-FLOW-] Resuming previous auth flow, will redirect to: ${savedReturnPath}`);
          
          // Make sure profile info is stored even when resuming flow
          if (profile) {
            console.log(`[AUTH-FLOW-] Storing profile for resumed flow`);
            localStorage.setItem("user_profile", JSON.stringify(profile));
            localStorage.setItem("auth_user_name", profile.full_name);
            
            // If profile was incomplete and we're resuming from profile completion,
            // ensure the needs_profile_completion flag is set
            if ((!profile.user_type || !profile.airline) && savedReturnPath.includes("complete-profile")) {
              console.log(`[AUTH-FLOW-] Setting needs_profile_completion for resumed flow`);
              localStorage.setItem("needs_profile_completion", "true");
            }
          }
          
          // Clean up flow flags but keep the needs_profile_completion if needed
          localStorage.removeItem("login_in_progress");
          localStorage.removeItem("resuming_auth_flow");
          localStorage.removeItem("auth_return_path");
          
          console.log(`[AUTH-FLOW-] Redirecting to saved path: ${savedReturnPath}`);
          navigate(savedReturnPath, { replace: true });
          return;
        }

        // If no profile exists, create one
        if (!profile) {
          console.log(
            `[AUTH-FLOW-] No profile found, creating new profile for user: ${session.user.id}`
          );

          const fullName =
            session.user.user_metadata.full_name ||
            session.user.user_metadata.name ||
            session.user.email;
            
          console.log(`[AUTH-FLOW-] Using full name: ${fullName}`);

          // Default to first available assistant
          console.log(`[AUTH-FLOW-] Fetching default assistant...`);
          const { data: defaultAssistant, error: assistantError } = await supabase
            .from("openai_assistants")
            .select("assistant_id")
            .eq("is_active", true)
            .limit(1)
            .maybeSingle();
            
          console.log(`[AUTH-FLOW-] Default assistant fetch result:`, {
            assistantFound: !!defaultAssistant,
            assistantId: defaultAssistant?.assistant_id || 'None',
            hasError: !!assistantError,
            errorMessage: assistantError?.message || 'None'
          });

          const assistantId = defaultAssistant?.assistant_id;

          console.log(`[AUTH-FLOW-] Creating new profile with data:`, {
            id: session.user.id,
            email: session.user.email,
            fullName,
            assistantId: assistantId || 'None'
          });
          
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
            console.error(`[AUTH-FLOW-] Error creating profile:`, insertError);
            setError("Failed to create your profile. Please try again.");
            localStorage.removeItem("login_in_progress");
            localStorage.removeItem("resuming_auth_flow");
            localStorage.removeItem("auth_return_path");
            console.log(`[AUTH-FLOW-] Removed auth flow flags due to profile creation error`);
            navigate(
              "/login?error=Profile creation failed. Please try again.",
              { replace: true }
            );
            return;
          }

          console.log(`[AUTH-FLOW-] Profile created successfully, creating new session`);
          // Create session
          try {
            await createNewSession(session.user.id);
            console.log(`[AUTH-FLOW-] New session created successfully`);
          } catch (sessionError) {
            console.error(`[AUTH-FLOW-] Error creating session:`, sessionError);
            // Continue despite session creation error
          }

          // Fetch the newly created profile to store in localStorage
          console.log(`[AUTH-FLOW-] Fetching newly created profile...`);
          const { data: newProfile, error: newProfileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
            
          console.log(`[AUTH-FLOW-] New profile fetch result:`, {
            profileFound: !!newProfile,
            hasError: !!newProfileError,
            errorMessage: newProfileError?.message || 'None'
          });

          if (newProfile) {
            console.log(
              `[AUTH-FLOW-] Storing new profile in localStorage:`,
              {
                id: newProfile.id,
                email: newProfile.email,
                name: newProfile.full_name,
              }
            );
            // Store profile in localStorage
            localStorage.setItem("user_profile", JSON.stringify(newProfile));
            localStorage.setItem("auth_user_name", newProfile.full_name);
          } else {
            console.warn(
              `[AUTH-FLOW-] Could not fetch profile data after creation, error:`,
              newProfileError
            );
          }

          console.log(`[AUTH-FLOW-] Showing success toast`);
          toast({
            title: "Account Created",
            description: "Your account has been created successfully.",
          });

          // Set flag to indicate that profile needs completion
          localStorage.setItem("needs_profile_completion", "true");
          console.log(
            `[AUTH-FLOW-] Set needs_profile_completion flag and redirecting to profile completion`
          );
          
          // Clean up flow state flags
          localStorage.removeItem("login_in_progress");
          localStorage.removeItem("resuming_auth_flow");
          localStorage.removeItem("auth_return_path");
          console.log(`[AUTH-FLOW-] Removed auth flow flags before redirect`);

          // Redirect to the missing info handler
          navigate("/auth/complete-profile", { replace: true });
          return;
        }

        console.log(
          `[AUTH-FLOW-] Existing profile found, checking for required fields:`,
          {
            user_type: profile.user_type || "MISSING",
            airline: profile.airline || "MISSING",
          }
        );

        // Check if user has required job title and airline information
        if (!profile.user_type || !profile.airline) {
          console.log(
            `[AUTH-FLOW-] Missing required profile information`,
            {
              user_type: profile.user_type || "MISSING",
              airline: profile.airline || "MISSING",
            }
          );

          console.log(
            `[AUTH-FLOW-] Storing partial profile data before redirecting`
          );
          // Store available profile data before redirecting
          localStorage.setItem("user_profile", JSON.stringify(profile));
          localStorage.setItem("auth_user_name", profile.full_name);

          // Set flag to indicate that profile needs completion
          localStorage.setItem("needs_profile_completion", "true");
          console.log(
            `[AUTH-FLOW-] Set needs_profile_completion flag and redirecting to profile completion`
          );
          
          // Clean up flow state flags
          localStorage.removeItem("login_in_progress");
          localStorage.removeItem("resuming_auth_flow");
          localStorage.removeItem("auth_return_path");
          console.log(`[AUTH-FLOW-] Removed auth flow flags before redirect`);
          
          // Redirect to the missing info handler
          navigate("/auth/complete-profile", { replace: true });
          return;
        }

        // Create session and redirect
        console.log(`[AUTH-FLOW-] Creating new session for existing user`);
        try {
          await createNewSession(session.user.id);
          console.log(`[AUTH-FLOW-] Session created successfully`);
        } catch (sessionError) {
          console.error(`[AUTH-FLOW-] Error creating session:`, sessionError);
          // Continue despite session creation error
        }
        
        // Clean up flow state flags
        localStorage.removeItem("login_in_progress");
        localStorage.removeItem("resuming_auth_flow");
        localStorage.removeItem("auth_return_path");
        console.log(`[AUTH-FLOW-] Removed auth flow flags before redirect`);

        // Get the most up-to-date profile data to ensure we have all fields
        console.log(
          `[AUTH-FLOW-] Fetching fresh profile data before redirecting`
        );
        const { data: freshProfile, error: freshProfileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (freshProfileError) {
          console.error(
            `[AUTH-FLOW-] Error fetching updated profile:`,
            freshProfileError
          );
          // Continue with existing profile data if refresh fails
        }

        // Use the most recent profile data if available
        const finalProfile = freshProfile || profile;
        console.log(`[AUTH-FLOW-] Using final profile data:`, {
          id: finalProfile.id,
          email: finalProfile.email,
          name: finalProfile.full_name,
          job: finalProfile.user_type,
          airline: finalProfile.airline,
          is_admin: finalProfile.is_admin || false,
        });

        // Set admin status in localStorage for quick access
        if (finalProfile.is_admin) {
          localStorage.setItem("user_is_admin", "true");
          console.log(`[AUTH-FLOW-] User is admin, setting admin flag`);
        } else {
          localStorage.removeItem("user_is_admin");
          console.log(`[AUTH-FLOW-] User is not admin, removing admin flag if exists`);
        }

        // Store complete profile and name in localStorage
        localStorage.setItem("user_profile", JSON.stringify(finalProfile));
        localStorage.setItem("auth_user_name", finalProfile.full_name);
        console.log(
          `[AUTH-FLOW-] Stored complete profile in localStorage`
        );

        toast({
          title: "Sign In Successful",
          description: "Welcome back!",
        });

        // Store flag to prevent pricing redirects
        sessionStorage.setItem("recently_signed_up", "true");
        console.log(`[AUTH-FLOW-] Set recently_signed_up flag in sessionStorage`);

        console.log(`[AUTH-FLOW-] Auth flow completed successfully, redirecting to chat`);
        navigate("/chat", { replace: true });
      } catch (error) {
        console.error(
          `[AUTH-FLOW-] Unexpected error in auth callback:`,
          error
        );
        localStorage.removeItem("login_in_progress");
        localStorage.removeItem("resuming_auth_flow");
        localStorage.removeItem("auth_return_path");
        console.log(`[AUTH-FLOW-] Removed auth flow flags due to unexpected error`);
        setError("An unexpected error occurred. Please try again.");
        navigate("/login?error=Unexpected error. Please try again.", {
          replace: true,
        });
      } finally {
        setLoading(false);
        console.log(`[AUTH-FLOW-] Auth flow processing completed, loading state set to false`);
      }
    };

    handleAuthCallback();
  }, [navigate, toast, searchParams]);

  if (error) {
    console.log(`[AUTH-ERROR] Rendering error state: ${error}`);
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
    console.log(`[AUTH-LOADING] Rendering loading state`);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-luxury-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-300">Authenticating with Google...</p>
      </div>
    );
  }

  console.log(`[AUTH-SUCCESS] Rendering success state`);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-luxury-dark">
      <p className="text-gray-300">Authentication successful! Redirecting...</p>
    </div>
  );
};