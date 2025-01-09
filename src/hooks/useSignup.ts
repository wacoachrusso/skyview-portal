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

      // Check if there's a matching assistant for this user's role
      const { data: assistant, error: assistantError } = await supabase
        .from('openai_assistants')
        .select('assistant_id')
        .eq('airline', formData.airline.toLowerCase())
        .eq('work_group', formData.jobTitle.toLowerCase())
        .single();

      if (assistantError && !assistant) {
        console.log('No matching assistant found for:', {
          airline: formData.airline,
          jobTitle: formData.jobTitle
        });
      } else {
        console.log('Found matching assistant:', assistant);
      }

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
          assistantId: assistant?.assistant_id || null
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
        assistantId: assistant?.assistant_id || null
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