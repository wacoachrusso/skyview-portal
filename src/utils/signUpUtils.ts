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
    // Generate CSRF token for auth flow
    const csrfToken = crypto.randomUUID();
    localStorage.setItem('auth_state', csrfToken);
    
    // Store selected plan in localStorage for auth callback
    if (selectedPlan && selectedPlan !== 'free') {
      localStorage.setItem('selected_plan', selectedPlan);
    }

    // First attempt the signup
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          user_type: formData.jobTitle,
          airline: formData.airline,
          subscription_plan: 'pending', // Mark as pending until payment is completed
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?selectedPlan=${selectedPlan}`
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
      const { error: emailError } = await supabase.functions.invoke('send-confirmation-email', {
        body: { 
          email: formData.email,
          name: formData.fullName,
          confirmationUrl: `${window.location.origin}/auth/callback?email=${encodeURIComponent(formData.email)}&selectedPlan=${selectedPlan}`
        }
      });

      if (emailError) {
        console.error("Error from send-confirmation-email function:", emailError);
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