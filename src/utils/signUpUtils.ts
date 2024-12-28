import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { checkExistingUser, getUserIpAddress } from "@/utils/authOperations";

interface SignUpData {
  email: string;
  password: string;
  full_name?: string;
  user_type?: string;
  airline?: string;
}

export const handleSignUp = async (formData: SignUpData, selectedPlan: string = "monthly") => {
  console.log("Starting signup process with plan:", selectedPlan);

  try {
    const userExists = await checkExistingUser(formData.email, formData.password);
    if (userExists) {
      return false;
    }

    const ip = await getUserIpAddress();

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.full_name,
          user_type: formData.user_type,
          airline: formData.airline,
          subscription_plan: selectedPlan,
          last_ip_address: ip,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      },
    });

    if (error) throw error;

    console.log("Sign up successful, sending confirmation email");

    try {
      const { error: emailError } = await supabase.functions.invoke('send-signup-confirmation', {
        body: { 
          email: formData.email,
          confirmationUrl: `${window.location.origin}/auth/callback?email=${encodeURIComponent(formData.email)}`
        }
      });

      if (emailError) {
        console.error("Error sending confirmation email:", emailError);
        throw new Error("Failed to send confirmation email");
      }

      console.log("Confirmation email sent successfully");
      toast({
        title: "Success",
        description: "Please check your email to verify your account.",
      });
      return true;
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      toast({
        variant: "destructive",
        title: "Account created",
        description: "Your account was created but we couldn't send the confirmation email. Please contact support.",
      });
      return false;
    }
  } catch (error) {
    console.error("Sign up error:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to create account. Please try again.",
    });
    return false;
  }
};