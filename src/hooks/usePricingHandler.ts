import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const usePricingHandler = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePlanSelection = async (plan: any) => {
    try {
      console.log("Starting plan selection process for:", plan.name);

      // Get current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in again to continue.",
        });
        navigate("/login");
        return;
      }

      if (!session) {
        console.log("User not logged in, redirecting to signup with plan:", {
          name: plan.name,
          priceId: plan.priceId,
          mode: plan.mode,
        });

        navigate("/signup", {
          state: {
            selectedPlan: plan.name.toLowerCase(),
            priceId: plan.priceId,
            mode: plan.mode,
          },
        });
        return;
      }

      if (!plan.priceId) {
        window.location.href = "/signup";
        return;
      }

      const userEmail = session.user.email;
      if (!userEmail) {
        throw new Error("User email not found");
      }

      // Get session token for additional security
      const sessionToken = localStorage.getItem("session_token") || "";
      console.log("Session token available:", !!sessionToken);

      // Generate the current URL with payment_status parameter
      const currentUrl = window.location.href;
      const successUrl = new URL(currentUrl);
      const cancelUrl = new URL(currentUrl);

      // Add payment_status parameter to success and cancel URLs
      successUrl.searchParams.set("payment_status", "success");
      cancelUrl.searchParams.set("payment_status", "cancel");

      console.log("Making request to create-checkout-session with:", {
        priceId: plan.priceId,
        mode: plan.mode,
        email: userEmail,
        hasSessionToken: !!sessionToken,
        successUrl: successUrl.toString(),
        cancelUrl: cancelUrl.toString(),
      });

      const response = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: JSON.stringify({
            priceId: plan.priceId,
            mode: plan.mode,
            email: userEmail,
            sessionToken,
            successUrl: successUrl.toString(),
            cancelUrl: cancelUrl.toString(),
          }),
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      console.log("Checkout session response:", response);

      if (response.error) {
        console.error("Error from checkout session:", response.error);
        throw new Error(
          response.error.message || "Failed to create checkout session"
        );
      }

      const { data } = response;

      if (data?.url) {
        console.log("Redirecting to checkout URL:", data.url);
        window.location.href = data.url;
      } else {
        console.error("No checkout URL received:", data);
        throw new Error("No checkout URL received from payment processor");
      }
    } catch (error: any) {
      console.error("Plan selection error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message ||
          "Failed to process plan selection. Please try again.",
      });
    }
  };

  return { handlePlanSelection };
};
