import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SubscriptionStatusTracker } from "./SubscriptionStatusTracker";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Subscription } from "@/types/subscription";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  formatPlanName,
  getButtonLabel,
  getTargetPlan,
  isButtonDisabled,
} from "@/utils/subscription/planUtils";
import { Profile } from "@/types/profile";

interface SubscriptionInfoProps {
  profileData: Profile;
  subscriptionData: Subscription[];
  setSubscriptionData: React.Dispatch<React.SetStateAction<Subscription[]>>;
  setProfileData:React.Dispatch<React.SetStateAction<Profile>>;
  onPlanChange: (plan: string) => void;
  onCancelSubscription: () => void;
  refreshProfile?: () => void;
}

// Use environment variable or fallback
const stripePromise = loadStripe(import.meta.env.VITE__STRIPE_PUBLIC_KEY);

export const SubscriptionInfo = ({
  profileData,
  subscriptionData,
  setSubscriptionData,
  setProfileData,
  onPlanChange,
  onCancelSubscription,
  refreshProfile,
}: SubscriptionInfoProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChangePlan = async (newPlan: string) => {
    console.log("🔄 Starting plan change process.....");
    console.log("Current plan:",  subscriptionData[0].plan);
    console.log("Requested new plan:", newPlan);

    if (newPlan ===  subscriptionData[0].plan) {
      console.log("⚠️ Already on the requested plan.");
      toast({
        title: "Already Subscribed",
        description: `You are already on the ${formatPlanName(
           subscriptionData[0].plan
        )} plan.`,
      });
      return;
    }

    setIsUpdating(true);

    try {
      // Step 1: Invoke `switch-plan` function
      const { data, error } = await supabase.functions.invoke("switch-plan", {
        body: {
          email: profileData.email,
          oldPlan:  subscriptionData[0].plan,
          newPlan,
          fullName: profileData.full_name || "User",
        },
      });

      if (error || !data) {
        console.error("❌ Error from switch-plan:", error);
        throw new Error(
          error?.message || "Unexpected error during plan switch."
        );
      }

      console.log("✅ switch-plan response received:", data);

      // Step 2: Handle payment if required
      if (data.status === "requires_payment") {
        console.log("💳 Payment required. Initializing Stripe...");
        const stripe = await stripePromise;

        if (!stripe) {
          console.error("❌ Stripe initialization failed");
          throw new Error("Stripe not initialized");
        }

        console.log(
          "🚀 Confirming card payment with clientSecret:",
          data.clientSecret
        );

        const paymentResult = await stripe.confirmCardPayment(
          data.clientSecret
        );

        if (paymentResult.error) {
          console.error(
            "❌ Stripe payment failed:",
            paymentResult.error.message
          );
          toast({
            variant: "destructive",
            title: "Payment Failed",
            description:
              paymentResult.error.message ||
              "Card payment failed. Please try again.",
          });
          return;
        }

        console.log("✅ Payment successful");

        // Step 3: Notify via email function
        console.log("📩 Invoking send-plan-change-email...");
        await supabase.functions.invoke("send-plan-change-email", {
          body: {
            email: profileData.email,
            oldPlan:  subscriptionData[0].old_plan,
            newPlan,
            fullName: profileData.full_name || "User",
          },
        });

        console.log("📩 send-plan-change-email success");

        toast({
          title: "Payment Successful",
          description: `Your plan has been upgraded to ${formatPlanName(
            newPlan
          )}.`,
        });

        // Refresh profile data after successful payment
        if (refreshProfile) {
          console.log("🔄 Refreshing profile data after successful payment...");
          await refreshProfile();
          await getSubscriptionData();
        }

        // Only call onPlanChange for navigation if upgrading from free to paid
        if (
           subscriptionData[0].plan === "free" ||
           subscriptionData[0].plan === "trial_ended"
        ) {
          onPlanChange(newPlan);
        }
      }

      // Step 4: If plan switched without payment
      else if (data.status === "success") {
        console.log(
          "✅ Plan switched successfully without payment:",
          data.subscription
        );

        toast({
          title: "Plan Updated",
          description: `You have successfully switched to the ${formatPlanName(
            newPlan
          )} plan.`,
        });

        // Refresh profile data after successful plan switch
        if (refreshProfile) {
          console.log(
            "🔄 Refreshing profile data after successful plan switch..."
          );
          await refreshProfile();
          await getSubscriptionData();
        }

        // Only call onPlanChange for navigation if upgrading from free to paid
        if (
          profileData.subscription_plan === "free" ||
          profileData.subscription_plan === "trial_ended"
        ) {
          onPlanChange(newPlan);
        }
      } else {
        console.warn(
          "⚠️ Unknown response status from switch-plan:",
          data.status
        );
      }
    } catch (error: any) {
      console.error("🚨 Exception in plan change:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.message || "Failed to switch plan. Please try again.",
      });
    } finally {
      setIsUpdating(false);
      console.log("✅ Plan change process complete");
    }
  };

  const getSubscriptionData = async () => {
    // Fetch subscription data by user_id
    if (profileData?.id) {
      console.log("Fetching subscription by user_id:", profileData.id);

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", profileData.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching subscription by user_id:", error);
      } else {
        console.log("Subscription data by user_id:", data);
        setSubscriptionData(data || []);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/95 shadow-xl">
        <CardHeader>
          <CardTitle className="text-brand-navy">
            Subscription Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="font-medium text-brand-navy">Current Plan:</span>
              <span className="col-span-2 text-gray-700 capitalize">
                {subscriptionData[0]?.plan || "Free"}
              </span>
            </div>

            {/* Display subscription data if available */}
            {subscriptionData.length > 0 && (
              <>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="font-medium text-brand-navy">
                    Payment Status:
                  </span>
                  <span className="col-span-2 text-gray-700 capitalize">
                    {subscriptionData[0]?.payment_status || "N/A"}
                  </span>
                </div>

                {subscriptionData[0]?.price && (
                  <div className="grid grid-cols-3 items-center gap-4">
                    <span className="font-medium text-brand-navy">Price:</span>
                    <span className="col-span-2 text-gray-700">
                      ${subscriptionData[0].price}
                    </span>
                  </div>
                )}
              </>
            )}

            <div className="grid-cols-3 items-center gap-4 hidden">
              <span className="font-medium text-brand-navy">Status:</span>
              <span className="col-span-2 text-gray-700 capitalize">
                {profileData?.subscription_status || "Inactive"}
              </span>
            </div>
            <div className="grid-cols-3 items-center gap-4 hidden">
              <span className="font-medium text-brand-navy">Queries Used:</span>
              <span className="col-span-2 text-gray-700">
                {profileData?.query_count || 0}
              </span>
            </div>
            {profileData?.last_query_timestamp && (
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-medium text-brand-navy">Last Query:</span>
                <span className="col-span-2 text-gray-700">
                  {format(new Date(profileData.last_query_timestamp), "PPpp")}
                </span>
              </div>
            )}
          </div>

          <Separator className="bg-gray-200" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-navy">
              Plan Management
            </h3>
            {profileData?.subscription_plan === "free" ||
            profileData?.subscription_plan === "trial_ended" ? (
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
                  onClick={() =>
                    handleChangePlan(getTargetPlan(subscriptionData[0]?.plan))
                  }
                  className="w-full bg-brand-gold hover:bg-brand-gold/90 text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUpdating || profileData?.subscription_status === "cancelled"}
                >
                  {isUpdating ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Updating...
                    </div>
                  ) :
                    getButtonLabel(subscriptionData[0]?.plan)
                  }
                </Button>

                <Button
                  onClick={onCancelSubscription}
                  variant="destructive"
                  className="w-full transition-colors"
                  disabled={isUpdating || profileData?.subscription_status === "cancelled"}
                >
                  {profileData?.subscription_status === "cancelled" ?"Cancelled":"Cancel Subscription"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {profileData?.subscription_plan !== "free" &&
        profileData?.subscription_plan !== "trial_ended" && (
          <SubscriptionStatusTracker
            profile={profileData}
            subscriptionData={subscriptionData}
          />
        )}
    </div>
  );
};
