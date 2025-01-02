import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { createStripeCheckoutSession } from "@/utils/stripeUtils";
import { handleFreeSignup } from "@/utils/freeSignupUtils";
import { storePendingSignup } from "@/utils/signupStorage";

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
        });

        // Create and redirect to checkout
        const checkoutUrl = await createStripeCheckoutSession({
          priceId,
          email: formData.email,
        });

        window.location.href = checkoutUrl;
        return;
      }

      // Handle free plan signup
      await handleFreeSignup(formData);

      toast({
        title: "Account created",
        description: "Welcome to SkyGuide!",
      });

      navigate('/dashboard');

    } catch (error) {
      console.error("Error during signup:", error);
      
      if (error instanceof Error && error.message.includes("User already registered")) {
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
        description: error instanceof Error ? error.message : "An unexpected error occurred",
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