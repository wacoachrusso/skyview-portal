import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendWelcomeEmail } from "@/utils/email";

interface SignupFormData {
  email: string;
  password: string;
  fullName: string;
  jobTitle: string;
  airline: string;
}

export const useSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [pendingSignupData, setPendingSignupData] = useState<any>(null);

  const handleSignupSubmit = async (formData: SignupFormData, selectedPlan: string) => {
    if (loading) return;
    
    setLoading(true);

    try {
      console.log("Starting signup process with data:", {
        email: formData.email,
        fullName: formData.fullName,
        jobTitle: formData.jobTitle,
        airline: formData.airline,
        plan: selectedPlan
      });

      // Store the signup data and show disclaimer
      setPendingSignupData({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            user_type: formData.jobTitle.toLowerCase(),
            airline: formData.airline.toLowerCase(),
            subscription_plan: selectedPlan,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      setShowDisclaimer(true);

    } catch (error) {
      console.error("Unexpected error during signup:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisclaimerAccepted = async () => {
    if (!pendingSignupData) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp(pendingSignupData);

      if (error) {
        console.error("Signup error:", error);
        
        if (error.message.includes("User already registered")) {
          toast({
            variant: "destructive",
            title: "Account exists",
            description: "An account with this email already exists. Please sign in instead.",
          });
          navigate('/login');
          return;
        }

        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
        return;
      }

      if (!data.user) {
        console.error("No user data returned from signup");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create account. Please try again.",
        });
        return;
      }

      console.log("Signup successful:", data);

      const { error: emailError } = await sendWelcomeEmail({
        email: pendingSignupData.email,
        name: pendingSignupData.options.data.full_name,
      });

      if (emailError) {
        console.error("Error sending welcome email:", emailError);
        toast({
          variant: "destructive",
          title: "Warning",
          description: "Account created but we couldn't send the welcome email. Please contact support.",
        });
      } else {
        toast({
          title: "Account created",
          description: "Welcome to SkyGuide!",
        });
      }

      navigate('/dashboard');

    } catch (error) {
      console.error("Error during signup after disclaimer acceptance:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
      setShowDisclaimer(false);
      setPendingSignupData(null);
    }
  };

  const handleDisclaimerRejected = () => {
    setShowDisclaimer(false);
    setPendingSignupData(null);
    toast({
      variant: "destructive",
      title: "Signup cancelled",
      description: "You must accept the disclaimer to create an account.",
    });
  };

  return {
    loading,
    showDisclaimer,
    handleSignupSubmit,
    handleDisclaimerAccepted,
    handleDisclaimerRejected
  };
};