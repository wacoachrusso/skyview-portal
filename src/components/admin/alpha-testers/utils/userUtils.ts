import { supabase } from "@/integrations/supabase/client";

export const checkExistingProfile = async (email: string) => {
  console.log("Checking for existing profile with email:", email);
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error("Error checking existing profile:", error);
    throw new Error("Failed to verify user status");
  }

  return profile;
};

export const checkExistingTester = async (email: string) => {
  console.log("Checking for existing tester with email:", email);
  const { data: tester, error } = await supabase
    .from('alpha_testers')
    .select('id, status')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error("Error checking existing tester:", error);
    throw error;
  }

  if (tester) {
    throw new Error("This user is already registered as an alpha tester");
  }
};

export const createAuthUser = async (email: string, password: string, fullName: string) => {
  console.log("Creating new auth user...");
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        subscription_plan: 'alpha'
      },
      emailRedirectTo: `${window.location.origin}/login`
    }
  });

  if (authError) {
    console.error("Error creating auth user:", authError);
    throw authError;
  }

  if (!authData.user) {
    throw new Error("Failed to create user account");
  }

  return authData.user;
};