import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { JobAndAirlineSelector } from "@/components/auth/JobAndAirlineSelector";
import { createNewSession } from "@/services/session";
import { useProfile } from "../utils/ProfileProvider";

const infoFormSchema = z.object({
  jobTitle: z.string().min(1, "Please select a job title."),
  airline: z.string().min(1, "Please select an airline."),
});

type InfoFormValues = z.infer<typeof infoFormSchema>;

export const GoogleAuthMissingInfoHandler = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsUserInfo, setNeedsUserInfo] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, refreshProfile } = useProfile();
  // Get existing profile data to pre-populate form if available
  const form = useForm<InfoFormValues>({
    resolver: zodResolver(infoFormSchema),
    defaultValues: {
      jobTitle: profile?.user_type || "",
      airline: profile?.airline || "",
    },
  });
  useEffect(() => {
    const checkUserInfo = async () => {
      try {
        setLoading(true);
        console.log(
          "GoogleAuthMissingInfoHandler: Checking user information..."
        );

        // Get session info to get user ID
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error(
            "GoogleAuthMissingInfoHandler: No session found:",
            sessionError || "Session is null"
          );
          setError("Authentication error. Please try again.");
          localStorage.removeItem("login_in_progress");
          navigate("/login?error=Authentication failed. Please try again.", {
            replace: true,
          });
          return;
        }

        console.log(
          "GoogleAuthMissingInfoHandler: Session found with user ID:",
          session.user.id
        );

        // Check if we already know this is a new account from previous component
        const needsProfileCompletion = localStorage.getItem(
          "needs_profile_completion"
        );

        if (needsProfileCompletion === "true") {
          console.log(
            "GoogleAuthMissingInfoHandler: needs_profile_completion flag detected, showing form"
          );
          setUserId(session.user.id);
          setNeedsUserInfo(true);
          setLoading(false);
          return;
        } else {
          console.log(
            "GoogleAuthMissingInfoHandler: Existing user detected with ID:",
            session.user.id
          );
          setUserId(session.user.id);
        }

        console.log(
          "GoogleAuthMissingInfoHandler: Fetching user profile data..."
        );

        // First DB query: Check if profile exists and has required fields
        // Only selecting the minimal fields needed for the check
        const { data: profileCheck, error: profileCheckError } = await supabase
          .from("profiles")
          .select("id, user_type, airline")
          .eq("id", session.user.id)
          .single();

        console.log(
          "GoogleAuthMissingInfoHandler: Profile check result:",
          profileCheckError
            ? `Error: ${profileCheckError.message} (${profileCheckError.code})`
            : `Found: ${!!profileCheck}, Has job: ${!!profileCheck?.user_type}, Has airline: ${!!profileCheck?.airline}`
        );

        if (profileCheckError && profileCheckError.code !== "PGRST116") {
          console.error(
            "GoogleAuthMissingInfoHandler: Error fetching profile:",
            profileCheckError
          );
          setError("Failed to load your profile. Please try again.");
          navigate("/login?error=Profile error. Please try again.", {
            replace: true,
          });
          return;
        }

        // If no profile or missing required info, show the form
        if (!profileCheck || !profileCheck.user_type || !profileCheck.airline) {
          console.log(
            "GoogleAuthMissingInfoHandler: Missing required user information, showing form"
          );
          setNeedsUserInfo(true);
          setLoading(false);
          return;
        }

        // User has all required info, now fetch complete profile for localStorage
        console.log(
          "GoogleAuthMissingInfoHandler: User has required information, fetching complete profile"
        );

        // Second DB query: Get complete profile data for localStorage
        const { data: fullProfile, error: fullProfileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (fullProfileError) {
          console.error(
            "GoogleAuthMissingInfoHandler: Error fetching complete profile:",
            fullProfileError
          );
          // Non-critical error, continue with redirect but log the issue
        }

        if (fullProfile) {
          console.log(
            "GoogleAuthMissingInfoHandler: Complete profile retrieved successfully:",
            {
              id: fullProfile.id,
              name: fullProfile.full_name,
              job: fullProfile.user_type,
              airline: fullProfile.airline,
              is_admin: fullProfile.is_admin || false,
            }
          );

          // Store profile and name in localStorage
          await refreshProfile();
          localStorage.setItem("auth_user_name", fullProfile.full_name);

          // Set admin status if applicable
          if (fullProfile.is_admin) {
            localStorage.setItem("user_is_admin", "true");
            console.log(
              "GoogleAuthMissingInfoHandler: User is admin, setting admin flag"
            );
          } else {
            localStorage.removeItem("user_is_admin");
          }
        } else {
          console.warn(
            "GoogleAuthMissingInfoHandler: Could not fetch complete profile data, proceeding with limited info"
          );
        }

        // Clean up and redirect
        console.log(
          "GoogleAuthMissingInfoHandler: Authentication complete, redirecting to chat"
        );
        setLoading(false);
        localStorage.removeItem("login_in_progress");
        localStorage.removeItem("needs_profile_completion");

        // Redirect to chat
        window.location.href = "/chat";
      } catch (error) {
        console.error("GoogleAuthMissingInfoHandler: Unexpected error", error);
        setError("An unexpected error occurred. Please try again.");
        localStorage.removeItem("login_in_progress");
        navigate("/login?error=Unexpected error. Please try again.", {
          replace: true,
        });
        setLoading(false);
      }
    };

    checkUserInfo();
  }, [navigate]);

  const onSubmit = async (data: InfoFormValues) => {
    try {
      setLoading(true);

      console.log(
        "GoogleAuthMissingInfoHandler: Form submitted with data:",
        data
      );

      // DEBUG: Log raw form data
      console.log("🔍 DEBUG - Raw form data:", {
        jobTitle: data.jobTitle,
        airline: data.airline,
        jobTitleType: typeof data.jobTitle,
        airlineType: typeof data.airline,
      });

      if (!userId) {
        console.error(
          "GoogleAuthMissingInfoHandler: No userId found for form submission"
        );
        setError("User ID not found. Please try logging in again.");
        return;
      }

      console.log(
        "GoogleAuthMissingInfoHandler: Updating profile for user:",
        userId
      );

      // Look up the correct assistant based on airline and role
      const airlineSearchTerm = data.airline.toLowerCase();
      const roleSearchTerm = data.jobTitle.toLowerCase();

      console.log("🔍 DEBUG - Assistant lookup parameters:", {
        airlineSearchTerm,
        roleSearchTerm,
        originalAirline: data.airline,
        originalJobTitle: data.jobTitle,
      });

      // DEBUG: First, let's see all available assistants
      const { data: allAssistants, error: allAssistantsError } = await supabase
        .from("openai_assistants")
        .select("*")
        .eq("is_active", true);

      if (allAssistantsError) {
        console.error(
          "🔍 DEBUG - Error fetching all assistants:",
          allAssistantsError
        );
      } else {
        console.log("🔍 DEBUG - All available assistants:", allAssistants);
        console.log("🔍 DEBUG - Assistants for our search criteria:");
        allAssistants.forEach((assistant) => {
          console.log(
            `  - ${assistant.airline} | ${assistant.work_group} | ${assistant.assistant_id} | Active: ${assistant.is_active}`
          );
        });
      }

      // DEBUG: Now let's see what matches our exact criteria
      console.log("🔍 DEBUG - Looking for exact matches with:");
      console.log(`  - airline: "${airlineSearchTerm}"`);
      console.log(`  - work_group: "${roleSearchTerm}"`);
      console.log(`  - is_active: true`);

      const { data: assistant, error: assistantError } = await supabase
        .from("openai_assistants")
        .select("*")
        .eq("airline", airlineSearchTerm)
        .eq("work_group", roleSearchTerm)
        .eq("is_active", true)
        .single();

      console.log("🔍 DEBUG - Assistant query result:", {
        found: !!assistant,
        error: assistantError,
        assistantData: assistant,
      });

      if (assistantError) {
        console.error(
          "GoogleAuthMissingInfoHandler: Error finding assistant:",
          assistantError
        );

        // DEBUG: Let's check what similar matches exist
        console.log("🔍 DEBUG - Checking for similar matches...");
        const { data: similarAssistants, error: similarError } = await supabase
          .from("openai_assistants")
          .select("*")
          .or(`airline.eq.${airlineSearchTerm},work_group.eq.${roleSearchTerm}`)
          .eq("is_active", true);

        if (!similarError && similarAssistants) {
          console.log(
            "🔍 DEBUG - Similar assistants found:",
            similarAssistants
          );
        }

        setError(
          "Could not find the appropriate assistant for your role. Please try again or contact support."
        );
        setLoading(false);
        return;
      }

      if (!assistant) {
        console.error(
          "GoogleAuthMissingInfoHandler: No assistant found for combination:",
          { airline: data.airline, role: data.jobTitle }
        );

        // DEBUG: Let's see what's closest
        const { data: debugAssistants, error: debugError } = await supabase
          .from("openai_assistants")
          .select("*")
          .eq("is_active", true)
          .limit(10);

        if (!debugError) {
          console.log(
            "🔍 DEBUG - Sample of available assistants:",
            debugAssistants
          );
        }

        setError(
          "No assistant available for your airline and role combination. Please contact support."
        );
        setLoading(false);
        return;
      }

      console.log("🔍 DEBUG - Assistant found successfully:", {
        assistant_id: assistant.assistant_id,
        airline: assistant.airline,
        work_group: assistant.work_group,
        is_active: assistant.is_active,
      });

      // DEBUG: Log what we're about to save to the profile
      const profileUpdateData = {
        user_type: data.jobTitle,
        airline: data.airline,
        assistant_id: assistant.assistant_id,
      };

      console.log("🔍 DEBUG - Profile update data:", profileUpdateData);

      // Update the profile with the new information including assistant_id
      const { error: updateError } = await supabase
        .from("profiles")
        .update(profileUpdateData)
        .eq("id", userId);

      if (updateError) {
        console.error(
          "GoogleAuthMissingInfoHandler: Error updating profile:",
          updateError
        );
        setError(
          "Failed to update your profile information. Please try again."
        );
        setLoading(false);
        return;
      }

      console.log("🔍 DEBUG - Profile updated successfully with:", {
        userId,
        user_type: data.jobTitle,
        airline: data.airline,
        assistant_id: assistant.assistant_id,
      });
  

      // Create session if needed
      // await createNewSession(userId);

      console.log(
        "GoogleAuthMissingInfoHandler: Fetching updated complete profile"
      );

      // Get the updated complete profile
      const { data: updatedProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error(
          "GoogleAuthMissingInfoHandler: Error fetching updated profile:",
          profileError
        );
        console.log(
          "GoogleAuthMissingInfoHandler: Proceeding with redirect despite profile fetch error"
        );
      } else if (updatedProfile) {
        console.log("🔍 DEBUG - Updated profile retrieved from database:", {
          id: updatedProfile.id,
          name: updatedProfile.full_name,
          job: updatedProfile.user_type,
          airline: updatedProfile.airline,
          assistant_id: updatedProfile.assistant_id,
          is_admin: updatedProfile.is_admin || false,
        });

        // Store complete profile and name in localStorage
        await refreshProfile();
        localStorage.setItem("auth_user_name", updatedProfile.full_name);

        // Set admin status if applicable
        if (updatedProfile.is_admin) {
          localStorage.setItem("user_is_admin", "true");
          console.log(
            "GoogleAuthMissingInfoHandler: User is admin, setting admin flag"
          );
        } else {
          localStorage.removeItem("user_is_admin");
        }
      }

      toast({
        title: "Information Updated",
        description: "Your profile information has been saved.",
      });

      console.log(
        "GoogleAuthMissingInfoHandler: Profile update complete, clearing flags and redirecting to chat"
      );
      localStorage.removeItem("login_in_progress");
      localStorage.removeItem("needs_profile_completion");

      // Redirect to chat
      window.location.href = "/chat";
    } catch (error) {
      console.error(
        "GoogleAuthMissingInfoHandler: Error submitting form:",
        error
      );
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-luxury-dark">
        <div className="max-w-md w-full px-6 py-8 bg-card-gradient border border-white/10 rounded-lg shadow-lg backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-red-400 text-center">
            Error
          </h2>
          <p className="mt-2 text-gray-300 text-center">{error}</p>
          <div className="mt-6 flex justify-center">
            <Button onClick={() => navigate("/login")}>Return to Login</Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !needsUserInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-luxury-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-300">
          Checking your account information...
        </p>
      </div>
    );
  }

  if (needsUserInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-luxury-dark">
        <div className="max-w-md w-full px-6 py-8 bg-card-gradient border border-white/10 rounded-lg shadow-lg backdrop-blur-sm">
          <h2 className="text-2xl font-semibold text-white text-center mb-6">
            Complete Your Profile
          </h2>
          <p className="mb-6 text-gray-300 text-center">
            Please provide some additional information to complete your account
            setup.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <JobAndAirlineSelector form={form} />

              <Button
                type="submit"
                className="w-full bg-brand-gold hover:bg-brand-gold/90 text-black font-medium py-2 px-4 rounded-md"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Complete Profile"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    );
  }

  return null;
};
