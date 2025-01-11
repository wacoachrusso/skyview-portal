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
          assistant_id: assistantId
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

    // Send free trial welcome email
    try {
      const { error: emailError } = await supabase.functions.invoke('send-free-trial-welcome', {
        body: {
          email: email.trim().toLowerCase(),
          name: fullName.trim(),
        }
      });

      if (emailError) {
        console.error("Error sending free trial welcome email:", emailError);
      }
    } catch (emailError) {
      console.error("Error sending free trial welcome email:", emailError);
    }

    return data;
  } catch (error) {
    console.error("Error in handleFreeSignup:", error);
    throw error;
  }
};