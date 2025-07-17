/**
 * SubscriptionInfo.tsx
 *
 * 📄 Description:
 * This component displays the user's current subscription details and allows them
 * to manage their plan including upgrades, downgrades, and cancellations.
 *
 * ✅ Responsibilities:
 * - Display current subscription data from profile
 * - Allow switching between plans via Supabase function
 * - Handle Stripe payments if required
 * - Trigger email notifications for plan changes
 * - Show loading and error feedback using toasts
 */

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SubscriptionStatusTracker } from "./SubscriptionStatusTracker";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  formatPlanName,
  getButtonLabel,
  getTargetPlan,
  isButtonDisabled,
} from "@/utils/subscription/planUtils";
import { Profile } from "@/types/profile";
import chalk from "chalk";

interface SubscriptionInfoProps {
  profileData: Profile;
  onPlanChange: (plan: string) => void;
  onCancelSubscription: () => void;
  refreshProfile?: () => void;
}

// Load Stripe instance
const stripePromise = loadStripe(import.meta.env.VITE__STRIPE_PUBLIC_KEY);

export const SubscriptionInfo = ({
  profileData,
  onPlanChange,
  onCancelSubscription,
  refreshProfile,
}: SubscriptionInfoProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  // Extract subscription data from profile with proper type checking
  const subscriptionData = profileData.subscription_id && 
    typeof profileData.subscription_id === 'object' && 
    !('error' in profileData.subscription_id)
      ? profileData.subscription_id 
      : null;

  // Step 1: Handle changing plan
  const handleChangePlan = async (newPlan: string) => {
    const currentPlan = profileData.subscription_plan || 'free';
    
    console.log(chalk.bgBlue.white.bold("[SubscriptionInfo] Step 1: Starting plan change process"));
    console.log("➡️ Current plan:", currentPlan);
    console.log("➡️ Requested plan:", newPlan);

    if (newPlan === currentPlan) {
      console.warn(chalk.bgYellow.black.bold("[SubscriptionInfo] Already on requested plan"));
      toast({
        title: "Already Subscribed",
        description: `You are already on the ${formatPlanName(currentPlan)} plan.`,
      });
      return;
    }

    setIsUpdating(true);

    try {
      // Step 2: Call Supabase function to switch plan
      console.log(chalk.bgCyan.white.bold("[SubscriptionInfo] Step 2: Calling Supabase function `switch-plan`"));
      const { data, error } = await supabase.functions.invoke("switch-plan", {
        body: {
          email: profileData.email,
          oldPlan: currentPlan,
          newPlan,
          fullName: profileData.full_name || "User",
        },
      });

      if (error || !data) {
        console.error(chalk.bgRed.white.bold("[SubscriptionInfo] Step 2.1: Error from switch-plan"), error);
        throw new Error(error?.message || "Unexpected error during plan switch.");
      }

      console.log(chalk.bgGreen.black.bold("[SubscriptionInfo] Step 2.2: Response from switch-plan"), data);

      // Step 3: If payment is required
      if (data.status === "requires_payment") {
        console.log(chalk.bgYellow.black.bold("[SubscriptionInfo] Step 3: Payment required. Loading Stripe..."));
        const stripe = await stripePromise;

        if (!stripe) {
          console.error("[SubscriptionInfo] Stripe failed to initialize");
          throw new Error("Stripe not initialized");
        }

        console.log("💳 Confirming payment with clientSecret:", data.clientSecret);
        const paymentResult = await stripe.confirmCardPayment(data.clientSecret);

        if (paymentResult.error) {
          console.error(chalk.bgRed.white.bold("[SubscriptionInfo] Payment failed"), paymentResult.error.message);
          toast({
            variant: "destructive",
            title: "Payment Failed",
            description: paymentResult.error.message || "Card payment failed. Please try again.",
          });
          return;
        }

        console.log(chalk.bgGreen.black.bold("[SubscriptionInfo] Payment successful"));

        // Step 4: Send plan change email
        console.log("[SubscriptionInfo] Step 4: Sending confirmation email...");
        await supabase.functions.invoke("send-plan-change-email", {
          body: {
            email: profileData.email,
            oldPlan: currentPlan,
            newPlan,
            fullName: profileData.full_name || "User",
          },
        });
        console.log("[SubscriptionInfo] Plan change email sent ✅");

        toast({
          title: "Payment Successful",
          description: `Your plan has been upgraded to ${formatPlanName(newPlan)}.`,
        });

        // Step 5: Refresh profile & data
        if (refreshProfile) {
          console.log("[SubscriptionInfo] Refreshing profile after successful payment...");
          await refreshProfile();
        }

        if (currentPlan === "free" || currentPlan === "trial_ended") {
          onPlanChange(newPlan);
        }
      }

      // Step 6: Plan switched without payment
      else if (data.status === "success") {
        console.log(chalk.bgGreen.black.bold("[SubscriptionInfo] Step 6: Plan switched successfully without payment"));

        toast({
          title: "Plan Updated",
          description: `You have successfully switched to the ${formatPlanName(newPlan)} plan.`,
        });

        if (refreshProfile) {
          console.log("[SubscriptionInfo] Refreshing profile after successful plan switch...");
          await refreshProfile();
        }

        if (currentPlan === "free" || currentPlan === "trial_ended") {
          onPlanChange(newPlan);
        } else {
          // Step 4: Send plan change email
          console.log("[SubscriptionInfo] Step 4: Sending confirmation email...");
          await supabase.functions.invoke("send-plan-change-email", {
            body: {
              email: profileData.email,
              oldPlan: currentPlan,
              newPlan,
              fullName: profileData.full_name || "User",
            },
          });
          console.log("[SubscriptionInfo] Plan change email sent ✅");
        }
      } else {
        console.warn("[SubscriptionInfo] Unknown status returned:", data.status);
      }
    } catch (error: any) {
      console.error(chalk.bgRed.white.bold("[SubscriptionInfo] Step X: Plan switch error"), error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to switch plan. Please try again.",
      });
    } finally {
      console.log("[SubscriptionInfo] ✅ Plan change process completed");
      setIsUpdating(false);
    }
  };

  // Get current plan and status from profile
  const currentPlan = profileData?.subscription_plan || 'free';
  const currentStatus = profileData?.subscription_status || subscriptionData?.payment_status || 'N/A';

  return (
    <div className="space-y-6">
      <Card className="bg-white/95 shadow-xl">
        <CardHeader>
          <CardTitle className="text-brand-navy">Subscription Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-medium text-brand-navy">Current Plan:</span>
              <span className="col-span-2 text-gray-700 capitalize">
                {formatPlanName(currentPlan)}
              </span>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-medium text-brand-navy">Payment Status:</span>
              <span className="col-span-2 text-gray-700 capitalize">
                {currentStatus}
              </span>
            </div>
          </div>

          <Separator className="bg-gray-200" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-navy">Plan Management</h3>

            {currentPlan === "free" || currentPlan === "trial_ended" ? (
              <Button
                onClick={() => onPlanChange("paid")}
                className="w-full bg-brand-gold hover:bg-brand-gold/90 text-black transition-colors"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Upgrading...
                  </div>
                ) : (
                  "Upgrade Plan"
                )}
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={() => handleChangePlan(getTargetPlan(currentPlan))}
                  className="w-full bg-brand-gold hover:bg-brand-gold/90 text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUpdating || profileData?.subscription_status === "cancelled"}
                >
                  {isUpdating ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Updating...
                    </div>
                  ) : (
                    getButtonLabel(currentPlan)
                  )}
                </Button>

                <Button
                  onClick={onCancelSubscription}
                  variant="destructive"
                  className="w-full transition-colors"
                  disabled={isUpdating || profileData?.subscription_status === "cancelled"}
                >
                  {profileData?.subscription_status === "cancelled" ? "Cancelled" : "Cancel Subscription"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {currentPlan !== "free" && currentPlan !== "trial_ended" && (
        <SubscriptionStatusTracker 
          profile={profileData} 
          subscriptionData={subscriptionData} 
        />
      )}
    </div>
  );
};