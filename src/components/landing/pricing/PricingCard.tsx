/**
 * PricingCard.tsx
 *
 * 📄 Description:
 * This component renders a single pricing plan card with UI and logic for
 * subscription status, feature listing, and button handling.
 *
 * ✅ Responsibilities:
 * - Display pricing, features, and action button for a plan
 * - Detect active subscription and update button state
 * - Handle subscription plan click via onSelect or usePricingHandler
 * - Show savings badge and "Current Plan" badge if applicable
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PricingHeader } from "./pricing-card/PricingHeader";
import { PricingFeatures } from "./pricing-card/PricingFeatures";
import { usePricingHandler } from "@/hooks/usePricingHandler";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Subscription } from "@/types/subscription";
import { useAuthStore } from "@/stores/authStores";
import chalk from "chalk";

interface profile {
  id: string;
  email: string;
  subscription_plan: string;
  subscription_status: string;
}

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  priceId: string;
  mode?: "subscription" | "payment";
  popular?: boolean;
  onSelect?: () => Promise<void>;
  savingsBadge?: string;
  returnUrl?: string;
}

export const PricingCard = ({
  name,
  price,
  description,
  features,
  priceId,
  mode = "subscription",
  popular = false,
  onSelect,
  savingsBadge,
  returnUrl = "/chat",
}: PricingCardProps) => {
  const { handlePlanSelection } = usePricingHandler();
  const [subscriptionData, setSubscriptionData] = useState<Subscription[]>([]);
  const [isActiveSubscription, setIsActiveSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { profile, isLoading: authLoading } = useAuthStore();

  // Step 1: Get user's subscriptions
  const getSubscriptionData = async () => {
    if (profile?.id) {
      console.log(chalk.bgBlue.white.bold(`[PricingCard] Step 1: Fetching subscriptions for user ${profile.id}`));

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(chalk.bgRed.white.bold("[PricingCard] Step 1.1: Error fetching subscriptions:"), error);
      } else {
        console.log(chalk.bgGreen.black.bold("[PricingCard] Step 1.2: Subscription data retrieved:"), data);
        setSubscriptionData(data || []);
      }
    }
    setIsLoading(false);
  };

  // Step 2: Check if current plan is active
  const checkActiveSubscription = () => {
    if (!profile || subscriptionData.length === 0) {
      if (
        profile?.subscription_plan === "free" &&
        (name.toLowerCase() === "free" || name.toLowerCase() === "free trial")
      ) {
        setIsActiveSubscription(true);
      } else {
        setIsActiveSubscription(false);
      }
      return;
    }

    const activeSubscription = subscriptionData[0];
    const isActive =
      ((activeSubscription.plan.toLowerCase() === name.toLowerCase() ||
        (activeSubscription.plan === "monthly" && name.toLowerCase() === "monthly") ||
        (activeSubscription.plan === "annual" && name.toLowerCase() === "annual")) &&
        activeSubscription.payment_status === "active") ||
      (profile.subscription_plan === "free" &&
        (name.toLowerCase() === "free" || name.toLowerCase() === "free trial"));

    setIsActiveSubscription(isActive);

    console.log(
      chalk.bgMagenta.white.bold(`[PricingCard] Step 2: Checked active subscription → ${isActive ? "Active" : "Not Active"}`)
    );
  };

  // Step 3: Fetch data when profile is ready
  useEffect(() => {
    if (profile?.id) {
      getSubscriptionData();
    }
  }, [profile]);

  // Step 4: Recheck plan status when relevant data changes
  useEffect(() => {
    checkActiveSubscription();
  }, [profile, subscriptionData, name]);

  // Step 5: Handle plan click
  const handlePlanClick = async () => {
    try {
      console.log(chalk.bgYellow.black.bold(`[PricingCard] Step 5: Plan clicked → ${name} (${priceId})`));

      if (onSelect) {
        console.log(chalk.bgCyan.black.bold("[PricingCard] Step 5.1: Using external onSelect handler"));
        await onSelect();
        return;
      }

      console.log(chalk.bgCyan.black.bold("[PricingCard] Step 5.2: Using internal pricing handler"));
      await handlePlanSelection({
        name,
        priceId,
        mode,
        returnUrl,
      });
    } catch (error) {
      console.error(chalk.bgRed.white.bold("[PricingCard] Step 5.3: Error handling plan selection"), error);
    }
  };

  // Step 6: Determine button text
  const getButtonText = () => {
    if (isLoading) return "Loading...";
    if (isActiveSubscription) return "Current Plan";
    if (name.toLowerCase() === "free" || name.toLowerCase() === "free trial") return "Start Your Free Trial";
    if (name.toLowerCase() === "monthly") return "Get Monthly Access";
    if (name.toLowerCase() === "annual") return "Unlock Best Value";
    return "Choose This Plan";
  };

  return (
    <Card
      className={`w-full max-w-sm mx-auto relative ${
        popular ? "border-brand-gold shadow-xl hover-lift-gold" : "border-gray-200 hover-lift"
      }`}
      aria-labelledby={`pricing-plan-${name.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {savingsBadge && (
        <Badge
          variant="success"
          className="absolute -top-3 right-4 px-3 py-1 font-semibold shadow-md animate-pulse-subtle"
          aria-label={`Special offer: ${savingsBadge}`}
        >
          {savingsBadge}
        </Badge>
      )}
      {isActiveSubscription && (
        <Badge
          variant="secondary"
          className="absolute -top-3 left-4 px-3 py-1 font-semibold shadow-md bg-brand-navy text-white"
          aria-label="This is your current active plan"
        >
          Current Plan
        </Badge>
      )}
      <PricingHeader name={name} price={price} description={description} mode={mode} popular={popular} />
      <CardContent>
        <PricingFeatures features={features} />
      </CardContent>
      <CardFooter>
        <Button
          onClick={handlePlanClick}
          disabled={isActiveSubscription || isLoading}
          className={`w-full ${
            isActiveSubscription
              ? "bg-gray-300 hover:bg-gray-300 text-gray-700 cursor-not-allowed"
              : popular
              ? "cta-button primary-cta gold-cta bg-brand-gold hover:bg-brand-gold/90 text-black"
              : "cta-button primary-cta bg-brand-navy hover:bg-brand-navy/90 text-white"
          } high-contrast-focus`}
          aria-label={`${getButtonText()} for ${name} plan at ${price}`}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
};
