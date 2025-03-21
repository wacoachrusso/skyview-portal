
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { NavigateFunction } from "react-router-dom";
import { createNewSession } from "@/services/session/createSession";

interface PendingSignup {
  email: string;
  password: string;
  full_name: string;
  job_title: string;
  airline: string;
  plan: string;
  stripe_session_id: string;
}

export const handleStripeCallback = async (
  sessionId: string,
  navigate: NavigateFunction
) => {
  console.log("Processing Stripe payment callback with session ID:", sessionId);
  
  try {
    // First check if user already exists and is logged in
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log("Session check result:", { 
      hasSession: !!session,
      error: sessionError 
    });

    if (sessionError) {
      console.error("Session error during Stripe callback:", sessionError);
      throw new Error("Authentication error. Please try logging in again.");
    }

    if (session?.user) {
      console.log("User is already authenticated:", session.user.email);
      
      try {
        // Update subscription status in profile after successful payment
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            // Determine plan type from session data
            subscription_plan: sessionId.includes('monthly') ? 'monthly' : 'annual'
          })
          .eq('id', session.user.id);
        
        if (updateError) {
          console.error("Error updating subscription status:", updateError);
        } else {
          console.log("Successfully updated subscription status");
        }
        
        // Create a new session token for this user
        await createNewSession(session.user.id);
        console.log("Created new session token after payment");
        
        // Set flag to show welcome message
        localStorage.setItem('subscription_activated', 'true');
        
        toast({
          title: "Payment Successful",
          description: "Your subscription has been activated. Welcome to SkyGuide!",
        });
        
        // Direct to chat instead of dashboard
        navigate('/chat', { replace: true });
        return null;
      } catch (error) {
        console.error("Error in subscription activation:", error);
        navigate('/dashboard');
        return null;
      }
    }

    // For users who aren't already logged in, handle pending signup

    // Fetch pending signup data with retry logic
    let pendingSignup = null;
    let pendingSignupError = null;
    
    for (let i = 0; i < 3; i++) {
      console.log(`Attempt ${i + 1}: Fetching pending signup data for session:`, sessionId);
      const result = await supabase
        .from('pending_signups')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .maybeSingle();
      
      if (result.data) {
        pendingSignup = result.data;
        break;
      }
      
      pendingSignupError = result.error;
      if (i < 2) {
        console.log("Retrying pending signup fetch in 1 second...");
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log("Final pending signup query result:", { 
      hasPendingSignup: !!pendingSignup,
      pendingSignupEmail: pendingSignup?.email,
      error: pendingSignupError 
    });

    if (pendingSignupError) {
      console.error("Error fetching pending signup:", pendingSignupError);
      throw new Error("Failed to fetch signup data. Please contact support.");
    }

    if (!pendingSignup) {
      console.error("No pending signup found for session:", sessionId);
      toast({
        variant: "destructive",
        title: "Signup Error",
        description: "Your signup data was not found. Please try signing up again or contact support if the issue persists."
      });
      navigate('/?scrollTo=pricing-section', { replace: true });
      return null;
    }

    return pendingSignup as PendingSignup;
  } catch (error) {
    console.error("Unexpected error in handleStripeCallback:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "An unexpected error occurred. Please try again or contact support."
    });
    navigate('/login');
    return null;
  }
};
