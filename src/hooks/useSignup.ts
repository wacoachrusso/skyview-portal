
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { createStripeCheckoutSession } from "@/utils/stripeUtils";
import { handleFreeSignup } from "@/utils/freeSignupUtils";
import { storePendingSignup } from "@/utils/signupStorage";
import { supabase } from "@/integrations/supabase/client";

interface SignupFormData {
  email: string;
  password: string;
  fullName: string;
  jobTitle: string;
  airline: string;
}

export const useSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSignupSubmit = async (
    formData: SignupFormData,
    selectedPlan: string,
    priceId?: string,
    isGoogleSignIn: boolean = false
  ) => {
    if (loading) return;
    setLoading(true);

    try {
      console.log("Starting signup process:", {
        email: formData.email,
        fullName: formData.fullName,
        jobTitle: formData.jobTitle,
        airline: formData.airline,
        plan: selectedPlan,
        isGoogleSignIn,
      });

      // Lookup assistant based on airline and job title
      const { data: assistant, error: assistantError } = await supabase
        .from("openai_assistants")
        .select("assistant_id")
        .eq("airline", formData.airline.toLowerCase())
        .eq("work_group", formData.jobTitle.toLowerCase())
        .eq("is_active", true)
        .maybeSingle();

      if (assistantError) {
        console.error("Assistant lookup error:", assistantError);
        throw new Error("Error looking up assistant configuration. Please try again.");
      }

      if (!assistant) {
        throw new Error(
          "We currently do not support your airline and role combination. Please contact support."
        );
      }

      console.log("Found matching assistant:", assistant);

      const signupData = {
        ...formData,
        assistantId: assistant.assistant_id,
      };

      // Handle paid plan signup via Stripe
      if (selectedPlan !== "free" && priceId) {
        storePendingSignup({ ...signupData, plan: selectedPlan });
        
        // Set flag for payment flow
        localStorage.setItem('payment_in_progress', 'true');
        localStorage.setItem('selected_plan', selectedPlan);

        const checkoutUrl = await createStripeCheckoutSession({
          priceId,
          email: formData.email,
        });

        if (checkoutUrl) {
          console.log("Redirecting to checkout URL:", checkoutUrl);
          window.location.href = checkoutUrl;
          return;
        } else {
          throw new Error("Failed to create checkout session");
        }
      }

      // Handle free plan signup
      console.log("Proceeding with free plan signup");
      const signupResult = await handleFreeSignup({
        ...signupData,
        isGoogleSignIn,
      });

      if (!signupResult) {
        throw new Error("Signup failed. Please try again.");
      }
      
      // Send welcome email
      try {
        console.log("Sending welcome email to:", formData.email);
        const { error: emailError } = await supabase.functions.invoke('send-free-trial-welcome', {
          body: { 
            email: formData.email,
            name: formData.fullName
          }
        });

        if (emailError) {
          console.error("Error sending welcome email:", emailError);
        } else {
          console.log("Welcome email sent successfully");
        }
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Continue with signup even if email fails
      }

      // Show appropriate toast message
      toast({
        title: "Account created",
        description: "Welcome to SkyGuide!",
        duration: 5000
      });

      // Store auth tokens in localStorage for persistence across page refreshes
      if (!isGoogleSignIn) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          localStorage.setItem('auth_access_token', session.access_token);
          localStorage.setItem('auth_refresh_token', session.refresh_token);
          localStorage.setItem('auth_user_id', session.user.id);
          localStorage.setItem('auth_user_email', formData.email);
          
          // Set session tokens in cookies for persistence
          document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
          document.cookie = `sb-refresh-token=${session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
          document.cookie = `session_user_id=${session.user.id}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
        }
      }

      // Direct users to chat page immediately after signup
      // Use window.location.href instead of navigate to force a full page reload
      // This ensures all auth state is properly initialized
      window.location.href = "/chat";
    } catch (error) {
      console.error("Error during signup:", error);

      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        if (error.message.includes("User already registered")) {
          errorMessage = "An account with this email already exists. Please sign in instead.";
          navigate("/login");
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        variant: "destructive",
        title: "Signup failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleSignupSubmit,
  };
};
