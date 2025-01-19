import { supabase } from "@/integrations/supabase/client";

interface SignupData {
  email: string;
  password: string;
  full_name: string;
  job_title: string;
  airline: string;
  plan: string;
}

export const createUserAccount = async (signupData: SignupData) => {
  console.log("Creating user account with data:", {
    email: signupData.email,
    fullName: signupData.full_name,
    jobTitle: signupData.job_title,
    airline: signupData.airline,
    plan: signupData.plan
  });

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: signupData.email,
    password: signupData.password,
    options: {
      data: {
        full_name: signupData.full_name,
        user_type: signupData.job_title,
        airline: signupData.airline,
        subscription_plan: signupData.plan
      }
    }
  });

  console.log("Signup result:", { 
    success: !!signUpData?.user,
    userId: signUpData?.user?.id,
    error: signUpError 
  });

  if (signUpError) {
    console.error("Error creating user account:", signUpError);
    throw signUpError;
  }

  if (!signUpData?.user) {
    console.error("No user data returned from signup");
    throw new Error("Failed to create user account");
  }

  return signUpData.user;
};