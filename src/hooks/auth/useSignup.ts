import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { createStripeCheckoutSession } from "@/utils/stripeUtils";
import { storePendingSignup } from "@/utils/signupStorage";
import { useSignupValidation } from "./useSignupValidation";
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
  const { validateAssistantConfig, createUserAccount } = useSignupValidation();
  
  const isTestEnvironment = window.location.pathname.startsWith('/test-app');

  const handleSignupSubmit = async (formData: SignupFormData, selectedPlan: string = "free") => {
    if (loading) return;
    setLoading(true);

    try {
      console.log('Starting signup process:', { 
        email: formData.email,
        plan: selectedPlan 
      });

      const assistantId = await validateAssistantConfig(formData);
      console.log('Found matching assistant:', assistantId);

      // For paid plans in production, handle Stripe checkout
      if (selectedPlan !== 'free' && !isTestEnvironment) {
        console.log('Starting paid plan signup:', selectedPlan);
        
        try {
          storePendingSignup({
            ...formData,
            plan: selectedPlan,
            assistantId
          });

          const checkoutUrl = await createStripeCheckoutSession({
            priceId: selectedPlan === 'monthly' ? 'price_1QcfUFA8w17QmjsPe9KXKFpT' : 'price_1QcfWYA8w17QmjsPZ22koqjj',
            email: formData.email,
          });

          if (checkoutUrl) {
            console.log('Redirecting to checkout:', checkoutUrl);
            window.location.href = checkoutUrl;
            return;
          }
          
          throw new Error('Failed to create checkout session');
        } catch (error) {
          console.error('Checkout error:', error);
          if (error instanceof Error && error.message.includes('active subscription')) {
            toast({
              variant: "destructive",
              title: "Subscription exists",
              description: "You already have an active subscription. Please sign in to your account.",
            });
            navigate(isTestEnvironment ? '/test-app/login' : '/login');
            return;
          }
          throw error;
        }
      }

      // Handle free plan signup or test environment
      console.log('Proceeding with free plan signup');
      const signupResult = await createUserAccount(formData, assistantId);
      
      if (signupResult) {
        console.log('Signup successful');
        toast({
          title: "Account created",
          description: isTestEnvironment 
            ? "Account created successfully. You can now log in."
            : "Please check your email to verify your account.",
        });
        navigate(isTestEnvironment ? '/test-app/login' : '/login');
      }

    } catch (error) {
      console.error("Error during signup:", error);
      
      let errorMessage = "An unexpected error occurred";
      
      if (error instanceof Error) {
        if (error.message.includes("User already registered")) {
          errorMessage = "An account with this email already exists. Please sign in instead.";
          navigate(isTestEnvironment ? '/test-app/login' : '/login');
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