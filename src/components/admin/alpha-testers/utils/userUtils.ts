import { supabase } from "@/integrations/supabase/client";

export const checkExistingTester = async (email: string) => {
  console.log("Checking for existing tester with email:", email);
  const { data: existingTester, error } = await supabase
    .from("alpha_testers")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("Error checking existing tester:", error);
    throw error;
  }

  if (existingTester) {
    throw new Error("A tester with this email already exists");
  }
};

export const checkExistingProfile = async (email: string) => {
  console.log("Checking for existing profile with email:", email);
  const { data: existingProfile, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("Error checking existing profile:", error);
    throw error;
  }

  return existingProfile;
};

export const createAuthUser = async (email: string, password: string, fullName: string) => {
  console.log("Creating new auth user...");
  try {
    // Store the current admin session token
    const { data: { session: adminSession } } = await supabase.auth.getSession();
    if (!adminSession) {
      throw new Error("No admin session found");
    }
    const adminAccessToken = adminSession.access_token;

    // Create new user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          subscription_plan: 'alpha'
        }
      }
    });

    if (signUpError) {
      console.error("Error creating auth user:", signUpError);
      throw signUpError;
    }

    if (!authData?.user) {
      throw new Error("Failed to create auth user");
    }

    // Immediately sign out the new user
    await supabase.auth.signOut();

    // Restore admin session
    const { error: setSessionError } = await supabase.auth.setSession({
      access_token: adminAccessToken,
      refresh_token: adminSession.refresh_token,
    });

    if (setSessionError) {
      console.error("Error restoring admin session:", setSessionError);
      throw new Error("Failed to restore admin session");
    }

    // Verify admin session was restored
    const { data: { session: restoredSession } } = await supabase.auth.getSession();
    if (!restoredSession) {
      throw new Error("Failed to verify restored admin session");
    }

    console.log("Successfully created user and restored admin session");
    return authData.user;
  } catch (error) {
    console.error("Error in createAuthUser:", error);
    throw error;
  }
};