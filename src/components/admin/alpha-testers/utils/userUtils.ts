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
    // Use regular signup instead of admin.createUser
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

    // Sign out after creating the user since we don't want to be logged in as them
    await supabase.auth.signOut();

    // Get the current admin session back
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Error getting admin session:", sessionError);
      throw sessionError;
    }

    if (!session) {
      throw new Error("Lost admin session");
    }

    return authData.user;
  } catch (error) {
    console.error("Error in createAuthUser:", error);
    throw error;
  }
};