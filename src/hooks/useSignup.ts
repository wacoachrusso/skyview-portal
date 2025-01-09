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

// Assistant mapping based on airline and job title combination
const ASSISTANT_MAPPING: Record<string, string> = {
  "American Airlines_Flight Attendant": "asst_xpkEzhLUt4Qn6uzRzSxAekGh",
  "United Airlines_Flight Attendant": "asst_YdZtVHPSq6TIYKRkKcOqtwzn",
};

export const useSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSignupSubmit = async (
    formData: SignupFormData, 
    selectedPlan: string, 
    priceId?: string
  ) => {
    if (loading) return;
    setLoading(true);

    try {
      console.log('Starting signup process with data:', { 
        email: formData.email,
        fullName: formData.fullName,
        jobTitle: formData.jobTitle,
        airline: formData.airline,
        plan: selectedPlan 
      });

      // Get the correct assistant ID based on airline and job title combination
      const assistantKey = `${formData.airline}_${formData.jobTitle}`;
      const assistantId = ASSISTANT_MAPPING[assistantKey];

      console.log('Looking up assistant for:', {
        airline: formData.airline,
        jobTitle: formData.jobTitle,
        assistantKey,
        foundAssistantId: assistantId
      });

      if (!assistantId) {
        console.error('No matching assistant found for:', {
          airline: formData.airline,
          jobTitle: formData.jobTitle
        });
        throw new Error('No matching assistant found for your role. Please contact support.');
      }

      console.log('Found matching assistant:', assistantId);

      // For paid plans, handle Stripe checkout
      if (selectedPlan !== 'free' && priceId) {
        console.log('Starting paid plan signup process:', { plan: selectedPlan, priceId });
        
        // Store signup data for after payment
        storePendingSignup({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          jobTitle: formData.jobTitle,
          airline: formData.airline,
          plan: selectedPlan,
          assistantId: assistantId
        });

        // Create and redirect to checkout
        const checkoutUrl = await createStripeCheckoutSession({
          priceId,
          email: formData.email,
        });

        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        }
        return;
      }

      // Handle free plan signup
      const signupResult = await handleFreeSignup({
        ...formData,
        assistantId: assistantId
      });
      
      if (signupResult) {
        toast({
          title: "Account created",
          description: "Please check your email to verify your account.",
        });
        navigate('/login');
      }

    } catch (error) {
      console.error("Error during signup:", error);
      
      let errorMessage = "An unexpected error occurred";
      
      if (error instanceof Error) {
        if (error.message.includes("User already registered")) {
          errorMessage = "An account with this email already exists. Please sign in instead.";
          navigate('/login');
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