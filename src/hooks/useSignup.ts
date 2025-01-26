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
  const isTestEnvironment = window.location.pathname.startsWith('/test-app');

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
        .eq('is_active', true)
        .maybeSingle();

      console.log('Assistant lookup result:', { assistant, error: assistantError });

      if (assistantError) {
        console.error('Assistant lookup error:', assistantError);
        throw new Error('Error looking up assistant configuration. Please try again.');
      }

      if (!assistant) {
        console.log('No matching assistant found for:', {
          airline: formData.airline,
          jobTitle: formData.jobTitle
        });
        throw new Error('We currently do not support your airline and role combination. Please contact support for assistance.');
      }

      console.log('Found matching assistant:', assistant);

      // For paid plans in production, handle Stripe checkout
      if (selectedPlan !== 'free' && priceId && !isTestEnvironment) {
        console.log('Starting paid plan signup process:', { plan: selectedPlan, priceId });
        
        try {
          // Store signup data for after payment
          storePendingSignup({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            jobTitle: formData.jobTitle,
            airline: formData.airline,
            plan: selectedPlan,
            assistantId: assistant.assistant_id
          });

          // Create and redirect to checkout
          const checkoutUrl = await createStripeCheckoutSession({
            priceId,
            email: formData.email,
          });

          if (checkoutUrl) {
            console.log('Redirecting to checkout URL:', checkoutUrl);
            window.location.href = checkoutUrl;
            return;
          } else {
            console.error('No checkout URL received');
            throw new Error('Failed to create checkout session');
          }
        } catch (error) {
          console.error('Error creating checkout session:', error);
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
      const signupResult = await handleFreeSignup({
        ...formData,
        assistantId: assistant.assistant_id
      });
      
      if (signupResult) {
        console.log('Free signup successful');
        toast({
          title: "Account created",
          description: isTestEnvironment 
            ? "Account created successfully. You can now log in."
            : "Please check your email to verify your account.",
        });
        navigate(isTestEnvironment ? '/test-app/login' : '/login');
      } else {
        console.error('Free signup failed without throwing an error');
        throw new Error('Signup failed. Please try again.');
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