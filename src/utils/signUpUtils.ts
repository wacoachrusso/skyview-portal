import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  jobTitle: string;
  airline: string;
}

export const handleSignUp = async (formData: SignUpData, selectedPlan: string = "free") => {
  console.log("Starting signup process with data:", { 
    email: formData.email, 
    fullName: formData.fullName,
    jobTitle: formData.jobTitle,
    airline: formData.airline,
    plan: selectedPlan 
  });

  try {
    // First attempt the signup
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          user_type: formData.jobTitle,
          airline: formData.airline,
          subscription_plan: selectedPlan,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      },
    });

    if (signUpError) {
      console.error("Signup error:", signUpError);
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: signUpError.message,
      });
      return false;
    }

    console.log("Signup successful, user data:", signUpData);

    // Then attempt to send confirmation email via Edge Function
    try {
      console.log("Attempting to send confirmation email via Edge Function");
      const { error: emailError } = await supabase.functions.invoke('send-signup-confirmation', {
        body: { 
          email: formData.email,
          name: formData.fullName,
          confirmationUrl: `${window.location.origin}/auth/callback?email=${encodeURIComponent(formData.email)}`
        }
      });

      if (emailError) {
        console.error("Error from send-signup-confirmation function:", emailError);
        throw emailError;
      }

      console.log("Confirmation email sent successfully");
      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });
      return true;
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Even if email fails, account was created
      toast({
        variant: "destructive",
        title: "Partial success",
        description: "Account created but we couldn't send the confirmation email. Please contact support.",
      });
      return false;
    }
  } catch (error) {
    console.error("Unexpected error during signup:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "An unexpected error occurred. Please try again.",
    });
    return false;
  }
};