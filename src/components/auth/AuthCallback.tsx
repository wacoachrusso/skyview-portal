import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEmailConfirmation } from "@/hooks/useEmailConfirmation";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { useAuthCallback } from "@/hooks/useAuthCallback";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GoogleAuthHandler } from "./handlers/GoogleAuthHandler";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleEmailConfirmation } = useEmailConfirmation();
  const { handleCallback } = useAuthCallback();
  const [processingStatus, setProcessingStatus] = useState<
    "processing" | "success" | "error"
  >("processing");
  const [statusMessage, setStatusMessage] = useState(
    "Processing authentication..."
  );
  const [isEmailConfirmation, setIsEmailConfirmation] = useState(false);
  const [isOAuthFlow, setIsOAuthFlow] = useState(false);
  
  // Generate a unique ID for tracking this auth callback instance
  const callbackId = useState(() => `cb-${Date.now()}`)[0];

  useEffect(() => {
    const processCallback = async () => {
      console.log(
        `[CALLBACK-${callbackId}] AuthCallback: Processing started with URL params:`,
        Object.fromEntries(searchParams.entries())
      );
      
      // Log potential OAuth provider details
      const provider = searchParams.get("provider");
      const type = searchParams.get("type");
      console.log(`[CALLBACK-${callbackId}] Auth type/provider details:`, { 
        type: type || "not specified", 
        provider: provider || "not specified" 
      });
      
      setProcessingStatus("processing");

      // Set a flag to indicate login processing, this prevents redirects
      // during authentication flow
      localStorage.setItem("login_in_progress", "true");
      console.log(`[CALLBACK-${callbackId}] Set login_in_progress flag in localStorage`);
      
      // Also set the recently_signed_up flag to prevent pricing redirects
      sessionStorage.setItem("recently_signed_up", "true");
      console.log(`[CALLBACK-${callbackId}] Set recently_signed_up flag in sessionStorage`);
      
      // Set new user signup flag to maintain redirect to chat
      localStorage.setItem("new_user_signup", "true");
      console.log(`[CALLBACK-${callbackId}] Set new_user_signup flag in localStorage`);

      try {
        // Check if this is a Stripe callback with session_id parameter
        const sessionId = searchParams.get("session_id");
        if (sessionId) {
          console.log(
            `[CALLBACK-${callbackId}] Stripe payment callback detected with session ID:`,
            sessionId
          );
          setStatusMessage("Completing your payment...");

          // Set a direct redirect flag to ensure we land on chat after payment
          localStorage.setItem("direct_payment_redirect", "true");
          console.log(`[CALLBACK-${callbackId}] Set direct_payment_redirect flag for post-payment flow`);

          // Import and use the Stripe callback handler
          console.log(`[CALLBACK-${callbackId}] Importing Stripe callback handler...`);
          try {
            const { handleStripeCallback } = await import(
              "@/utils/auth/stripeCallbackHandler"
            );
            console.log(`[CALLBACK-${callbackId}] Stripe callback handler imported successfully`);
            
            console.log(`[CALLBACK-${callbackId}] Calling handleStripeCallback with sessionId: ${sessionId}`);
            await handleStripeCallback(sessionId, navigate);
            console.log(`[CALLBACK-${callbackId}] Stripe callback handling completed`);
          } catch (importError) {
            console.error(`[CALLBACK-${callbackId}] Error importing or executing Stripe callback handler:`, importError);
          }

          // After payment, send a thank you email via Resend
          try {
            console.log(`[CALLBACK-${callbackId}] Getting session to send payment confirmation email`);
            const {
              data: { session },
              error: sessionError
            } = await supabase.auth.getSession();
            
            console.log(`[CALLBACK-${callbackId}] Session fetch result for email sending:`, {
              hasSession: !!session,
              hasError: !!sessionError,
              errorMessage: sessionError?.message || 'None'
            });
            
            if (session?.user) {
              const selectedPlan = localStorage.getItem("selected_plan") || "monthly";
              console.log(`[CALLBACK-${callbackId}] Sending subscription confirmation email:`, {
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.email,
                plan: selectedPlan
              });
              
              const { data: emailData, error: emailFuncError } = await supabase.functions.invoke(
                "send-subscription-confirmation",
                {
                  body: {
                    email: session.user.email,
                    name:
                      session.user.user_metadata?.full_name ||
                      session.user.email,
                    plan: selectedPlan,
                  },
                }
              );
              
              console.log(`[CALLBACK-${callbackId}] Payment confirmation email result:`, {
                success: !emailFuncError,
                error: emailFuncError?.message || 'None',
                responseData: emailData || 'None'
              });
            } else {
              console.log(`[CALLBACK-${callbackId}] No user session available for payment confirmation email`);
            }
          } catch (emailError) {
            console.error(
              `[CALLBACK-${callbackId}] Failed to send payment confirmation email:`,
              emailError
            );
          }

          return; // Let the Stripe handler take over the flow
        }

        // Check if this is a special post-payment flow (marked by postPaymentConfirmation flag)
        const isPostPayment =
          localStorage.getItem("postPaymentConfirmation") === "true";
        if (isPostPayment) {
          console.log(`[CALLBACK-${callbackId}] Post-payment confirmation flow detected`);
          setStatusMessage("Completing your subscription...");
        }

        // Check if this is an email confirmation callback
        const email = searchParams.get("email");
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type");
        const provider = searchParams.get("provider");

        // Check if this is a Google OAuth callback
        if (provider === "google" || type === "oauth") {
          console.log(
            `[CALLBACK-${callbackId}] Detected OAuth callback with provider:`,
            provider || "unknown", 
            "and type:", 
            type || "unknown"
          );
          setIsOAuthFlow(true);
          console.log(`[CALLBACK-${callbackId}] Set isOAuthFlow flag to true, will render GoogleAuthHandler`);
          return; // Let GoogleAuthHandler component handle this
        }

        if (email && token_hash) {
          console.log(`[CALLBACK-${callbackId}] Handling email confirmation for:`, email);
          console.log(`[CALLBACK-${callbackId}] Token hash:`, token_hash);
          
          // We don't need to wait for email confirmation - redirect immediately
          // to avoid that "check your email" message
          console.log(`[CALLBACK-${callbackId}] Skipping actual confirmation, redirecting to chat`);

          // Instead of confirming, just redirect to chat
          setProcessingStatus("success");
          setStatusMessage("Account setup successful! Redirecting...");

          // Clear login_in_progress but keep recently_signed_up
          localStorage.removeItem("login_in_progress");
          console.log(`[CALLBACK-${callbackId}] Removed login_in_progress flag`);
          
          sessionStorage.setItem("recently_signed_up", "true");
          console.log(`[CALLBACK-${callbackId}] Kept recently_signed_up flag in sessionStorage`);

          // For post-payment flow or regular flow - redirect to chat
          console.log(`[CALLBACK-${callbackId}] Will redirect to /chat in 1.5 seconds`);
          setTimeout(() => {
            navigate("/chat", { replace: true });
          }, 1500);
        } else {
          // This is an OAuth callback (like Google)
          console.log(`[CALLBACK-${callbackId}] Handling OAuth callback without Google provider`);
          setStatusMessage("Completing sign-in process...");

          // First check if we already have a valid session
          console.log(`[CALLBACK-${callbackId}] Checking for existing session`);
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          console.log(`[CALLBACK-${callbackId}] Session check result:`, {
            hasSession: !!session,
            hasError: !!error,
            errorMessage: error?.message || 'None',
            userId: session?.user?.id || 'None'
          });

          if (error) {
            console.error(`[CALLBACK-${callbackId}] Session error in callback:`, error);
            setProcessingStatus("error");
            setStatusMessage("Authentication failed. Please try again.");
            localStorage.removeItem("login_in_progress");
            console.log(`[CALLBACK-${callbackId}] Removed login_in_progress flag due to session error`);
            setTimeout(() => navigate("/login"), 2000);
            return;
          }

          if (!session) {
            console.log(`[CALLBACK-${callbackId}] No session found in OAuth callback`);
            setProcessingStatus("error");
            setStatusMessage("Authentication failed. Please try again.");
            localStorage.removeItem("login_in_progress");
            console.log(`[CALLBACK-${callbackId}] Removed login_in_progress flag due to missing session`);
            setTimeout(() => navigate("/login"), 2000);
            return;
          }

          console.log(
            `[CALLBACK-${callbackId}] Session found, proceeding with handleCallback`
          );

          // Process the OAuth callback
          try {
            console.log(`[CALLBACK-${callbackId}] Executing handleCallback from useAuthCallback hook`);
            await handleCallback();
            console.log(`[CALLBACK-${callbackId}] handleCallback executed successfully`);
          } catch (callbackError) {
            console.error(`[CALLBACK-${callbackId}] Error in handleCallback:`, callbackError);
            // Continue despite error
          }

          // Clear login processing flag before redirecting
          localStorage.removeItem("login_in_progress");
          console.log(`[CALLBACK-${callbackId}] Removed login_in_progress flag before redirect`);

          // Set success state
          setProcessingStatus("success");
          setStatusMessage("Authentication successful! Redirecting...");

          console.log(`[CALLBACK-${callbackId}] Auth flow completed successfully, redirecting to chat`);
          // Always redirect to chat
          navigate("/chat", { replace: true });
        }
      } catch (error) {
        console.error(`[CALLBACK-${callbackId}] Error in auth callback:`, error);
        setProcessingStatus("error");
        setStatusMessage(
          "An error occurred during authentication. Please try again."
        );
        localStorage.removeItem("login_in_progress");
        console.log(`[CALLBACK-${callbackId}] Removed login_in_progress flag due to error`);
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    processCallback();
  }, [navigate, toast, handleCallback, handleEmailConfirmation, searchParams, callbackId]);

  if (isOAuthFlow) {
    console.log(`[CALLBACK-${callbackId}] Rendering GoogleAuthHandler component`);
    return <GoogleAuthHandler />;
  }

  console.log(`[CALLBACK-${callbackId}] Rendering AuthCallback UI with status: ${processingStatus}`);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-luxury-dark text-white">
      <div className="w-full max-w-md space-y-8 px-4 sm:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <img
            src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png"
            alt="SkyGuide Logo"
            className="h-12 w-auto"
          />

          <h1 className="text-2xl font-bold tracking-tight">
            {processingStatus === "processing"
              ? "Processing Authentication"
              : processingStatus === "success"
              ? "Authentication Successful"
              : "Authentication Error"}
          </h1>

          <p className="text-sm text-gray-400">{statusMessage}</p>

          {processingStatus === "processing" && (
            <div className="mt-4">
              <LoadingSpinner size="lg" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;