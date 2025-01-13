import { supabase } from "@/integrations/supabase/client";

export const checkExistingTester = async (email: string) => {
  console.log("Checking for existing tester with email:", email);
  const { data: existingTester } = await supabase
    .from("alpha_testers")
    .select("id")
    .eq("email", email)
    .single();

  if (existingTester) {
    throw new Error("A tester with this email already exists");
  }
};

export const checkExistingProfile = async (email: string) => {
  console.log("Checking for existing profile with email:", email);
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  return existingProfile;
};

export const createAuthUser = async (email: string, password: string, fullName: string) => {
  console.log("Creating new auth user...");
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName
    }
  });

  if (authError) {
    console.error("Error creating auth user:", authError);
    throw authError;
  }

  if (!authUser?.user) {
    throw new Error("Failed to create auth user");
  }

  return authUser.user;
};