import { supabase } from "@/integrations/supabase/client";
import { sendWelcomeEmail } from "./email";

interface FreeSignupParams {
  email: string;
  password: string;
  fullName: string;
  jobTitle: string;
  airline: string;
}

export const handleFreeSignup = async ({
  email,
  password,
  fullName,
  jobTitle,
  airline,
}: FreeSignupParams) => {
  console.log('Processing free plan signup for:', email);

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
        user_type: jobTitle.toLowerCase(),
        airline: airline.toLowerCase(),
        subscription_plan: 'free',
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });

  if (error) {
    console.error("Signup error:", error);
    throw error;
  }

  if (!data.user) {
    console.error("No user data returned from signup");
    throw new Error('Failed to create account');
  }

  console.log("Free trial signup successful:", data);

  await sendWelcomeEmail({
    email: email.trim().toLowerCase(),
    name: fullName.trim(),
  });

  return data;
};