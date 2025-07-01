
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SubscriptionStatusTracker } from "./SubscriptionStatusTracker";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";

interface SubscriptionInfoProps {
  profile: any;
  onPlanChange: (plan: string) => void;
  onCancelSubscription: () => void;
}

// Fallback public key (replace this with your test key)
const DEFAULT_STRIPE_PUBLIC_KEY = "pk_test_51NHiocFKfk8cZ76rT92hd4ZNV9PyqTX1D6sYFphEcgs9Wy9x3G1BMYUDDqz1JIM2fmmTXZ5hhbWFXfReNbkJXQ7o00XXx4GbDY";

// Use environment variable or fallback
const stripePromise = loadStripe( DEFAULT_STRIPE_PUBLIC_KEY);


export const SubscriptionInfo = ({ profile, onPlanChange, onCancelSubscription }: SubscriptionInfoProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const formatPlanName = (plan: string) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  const handleChangePlan = async (newPlan: string) => {
    console.log("🔄 Starting plan change process...");
    console.log("Current plan:", profile.subscription_plan);
    console.log("Requested new plan:", newPlan);
  
    if (newPlan === profile.subscription_plan) {
      console.log("⚠️ Already on the requested plan.");
      toast({
        title: "Already Subscribed",
        description: `You are already on the ${formatPlanName(profile.subscription_plan)} plan.`,
      });
      return;
    }
  
    setIsUpdating(true);
  
    try {
      // Step 1: Invoke `switch-plan` function
      console.log("📡 Invoking switch-plan function with:", {
        email: profile.email,
        oldPlan: profile.subscription_plan,
        newPlan,
        fullName: profile.full_name || "User",
      });
  
      const { data, error } = await supabase.functions.invoke("switch-plan", {
        body: {
          email: profile.email,
          oldPlan: profile.subscription_plan,
          newPlan,
          fullName: profile.full_name || "User",
        },
      });
  
      if (error || !data) {
        console.error("❌ Error from switch-plan:", error);
        throw new Error(error?.message || "Unexpected error during plan switch.");
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
  
        console.log("🚀 Confirming card payment with clientSecret:", data.clientSecret);
  
        const paymentResult = await stripe.confirmCardPayment(data.clientSecret);
  
        if (paymentResult.error) {
          console.error("❌ Stripe payment failed:", paymentResult.error.message);
          toast({
            variant: "destructive",
            title: "Payment Failed",
            description: paymentResult.error.message || "Card payment failed. Please try again.",
          });
          return;
        }
  
        console.log("✅ Payment successful");
  
        // Step 3: Notify via email function
        console.log("📩 Invoking send-plan-change-email...");
        await supabase.functions.invoke("send-plan-change-email", {
          body: {
            email: profile.email,
            oldPlan: profile.subscription_plan,
            newPlan,
            fullName: profile.full_name || "User",
          },
        });
  
        console.log("📩 send-plan-change-email success");
  
        toast({
          title: "Payment Successful",
          description: `Your plan has been upgraded to ${formatPlanName(newPlan)}.`,
        });
  
        onPlanChange(newPlan);
      }
  
      // Step 4: If plan switched without payment
      else if (data.status === "success") {
        console.log("✅ Plan switched successfully without payment:", data.subscription);
  
        toast({
          title: "Plan Updated",
          description: `You have successfully switched to the ${formatPlanName(newPlan)} plan.`,
        });
  
        onPlanChange(newPlan);
      } else {
        console.warn("⚠️ Unknown response status from switch-plan:", data.status);
      }
    } catch (error: any) {
      console.error("🚨 Exception in plan change:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to switch plan. Please try again.",
      });
    } finally {
      setIsUpdating(false);
      console.log("✅ Plan change process complete");
    }
  };
  
  

  const getButtonLabel = () => {
    if (profile.subscription_plan === 'monthly') {
      return "Upgrade to Annual";
    } else if (profile.subscription_plan === 'annual') {
      return "Switch to Monthly";
    } else {
      return "Upgrade Plan";
    }
  };

  const getTargetPlan = () => {
    if (profile.subscription_plan === 'monthly') {
      return "annual";
    } else if (profile.subscription_plan === 'annual') {
      return "monthly";
    } else {
      return "monthly"; // Default for free users
    }
  };

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
              <span className="col-span-2 text-gray-700 capitalize">{profile?.subscription_plan || 'Free'}</span>
            </div>
            <div className="grid-cols-3 items-center gap-4 hidden">
              <span className="font-medium text-brand-navy">Status:</span>
              <span className="col-span-2 text-gray-700 capitalize">{profile?.subscription_status || 'Inactive'}</span>
            </div>
            <div className="grid-cols-3 items-center gap-4 hidden">
              <span className="font-medium text-brand-navy">Queries Used:</span>
              <span className="col-span-2 text-gray-700">{profile?.query_count || 0}</span>
            </div>
            {profile?.last_query_timestamp && (
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="font-medium text-brand-navy">Last Query:</span>
                <span className="col-span-2 text-gray-700">
                  {format(new Date(profile.last_query_timestamp), 'PPpp')}
                </span>
              </div>
            )}
          </div>

          <Separator className="bg-gray-200" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-brand-navy">Plan Management</h3>
            {profile?.subscription_plan === 'free' || profile?.subscription_plan === 'trial_ended' ? (
              <Button
                onClick={() => onPlanChange('paid')}
                className="w-full bg-brand-gold hover:bg-brand-gold/90 text-black transition-colors"
                disabled={isUpdating}
              >
                Upgrade Plan
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={() => handleChangePlan(getTargetPlan())}
                  className="w-full bg-brand-gold hover:bg-brand-gold/90 text-black transition-colors"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : getButtonLabel()}
                </Button>
                <Button
                  onClick={onCancelSubscription}
                  variant="destructive"
                  className="w-full transition-colors"
                  disabled={isUpdating}
                >
                  Cancel Subscription
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {profile?.subscription_plan !== 'free' && profile?.subscription_plan !== 'trial_ended' && (
        <SubscriptionStatusTracker profile={profile} />
      )}
    </div>
  );
};
