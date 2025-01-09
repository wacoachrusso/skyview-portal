import { supabase } from "@/integrations/supabase/client";
import { sendWelcomeEmail } from "./email";

interface FreeSignupParams {
  email: string;
  password: string;
  fullName: string;
  jobTitle: string;
  airline: string;
  assistantId?: string;
}

export const handleFreeSignup = async ({
  email,
  password,
  fullName,
  jobTitle,
  airline,
  assistantId,
}: FreeSignupParams) => {
  console.log('Processing free plan signup for:', email);
  console.log('Using assistant ID:', assistantId);

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          user_type: jobTitle.toLowerCase(),
          airline: airline.toLowerCase(),
          subscription_plan: 'free',
          assistant_id: assistantId // Include the assistant ID in user metadata
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

    // Send welcome email after successful signup
    try {
      await sendWelcomeEmail({
        email: email.trim().toLowerCase(),
        name: fullName.trim(),
      });
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Don't throw here - we still want to return the signup data even if email fails
    }

    return data;
  } catch (error) {
    console.error("Error in handleFreeSignup:", error);
    throw error;
  }
};