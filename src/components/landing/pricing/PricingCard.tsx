import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PricingHeader } from "./pricing-card/PricingHeader";
import { PricingFeatures } from "./pricing-card/PricingFeatures";
import { usePricingHandler } from "@/hooks/usePricingHandler";
import { useEffect, useState } from "react";
import { useProfileRefresh } from "@/utils/user/refreshProfile";
import { supabase } from "@/integrations/supabase/client";
import { Subscription } from "@/types/subscription";

interface UserProfile {
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
  mode?: 'subscription' | 'payment';
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
  mode = 'subscription',
  popular = false,
  onSelect,
  savingsBadge,
  returnUrl = '/chat'
}: PricingCardProps) => {
  const { handlePlanSelection } = usePricingHandler();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<Subscription[]>([]);
  const [isActiveSubscription, setIsActiveSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useProfileRefresh();

  // Get user profile from session storage (similar to SubscriptionInfo)
  const getProfileData = async () => {
    const cachedUser = sessionStorage.getItem("cached_auth_user");

    if (!cachedUser) {
      console.error("No user found in session storage.");
      setIsLoading(false);
      return;
    }

    const user = JSON.parse(cachedUser);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", user.email)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      setIsLoading(false);
    } else {
      setUserProfile(profile);
    }
  };

  // Get subscription data from subscriptions table (similar to SubscriptionInfo)
  const getSubscriptionData = async () => {
    if (userProfile?.id) {
      console.log("Fetching subscription by user_id:", userProfile.id);

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userProfile.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching subscription by user_id:", error);
      } else {
        console.log("Subscription data by user_id:", data);
        setSubscriptionData(data || []);
      }
    }
    setIsLoading(false);
  };

  // Check if current plan is active subscription
  const checkActiveSubscription = () => {
    if (!userProfile || subscriptionData.length === 0) {
      // For free plans, check if user is on free and this is free trial card
      if (userProfile?.subscription_plan === "free" && 
          (name.toLowerCase() === "free" || name.toLowerCase() === "free trial")) {
        setIsActiveSubscription(true);
      } else {
        setIsActiveSubscription(false);
      }
      return;
    }

    const activeSubscription = subscriptionData[0]; // Most recent subscription
    
    // Check if this plan matches the user's active subscription
    const isActive = (
      // For paid plans: check if plan names match and subscription is active
      ((activeSubscription.plan.toLowerCase() === name.toLowerCase() ||
       (activeSubscription.plan === "monthly" && name.toLowerCase() === "monthly") ||
       (activeSubscription.plan === "annual" && name.toLowerCase() === "annual")) &&
       activeSubscription.payment_status === "active") ||
      // For free plan: check if user is on free plan and this is the free trial card
      (userProfile.subscription_plan === "free" && 
       (name.toLowerCase() === "free" || name.toLowerCase() === "free trial"))
    );
    
    setIsActiveSubscription(isActive);
  };

  // Initial data fetch
  useEffect(() => {
    getProfileData();
  }, []);

  // Fetch subscription data when profile is available
  useEffect(() => {
    if (userProfile?.id) {
      getSubscriptionData();
    }
  }, [userProfile]);

  // Update active subscription status when data changes
  useEffect(() => {
    checkActiveSubscription();
  }, [userProfile, subscriptionData, name]);

  // Add a window focus listener to refresh data when the tab regains focus
  useEffect(() => {
    const handleFocus = async () => {
      try {
        console.log("Window focused, refreshing subscription data...");
        await getProfileData();
        // getSubscriptionData will be called automatically via useEffect when userProfile updates
      } catch (error) {
        console.error("Error refreshing data on window focus:", error);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handlePlanClick = async () => {
    try {
      console.log(`Plan clicked: ${name} with priceId: ${priceId}`);
      
      // First try the direct handler if provided
      if (onSelect) {
        await onSelect();
        return;
      }
      
      // Use the unified pricing handler
      await handlePlanSelection({
        name: name,
        priceId: priceId,
        mode: mode,
        returnUrl: returnUrl
      });
      
    } catch (error) {
      console.error("Error handling plan selection:", error);
    }
  };

  // Determine persuasive button text based on plan name and subscription status
  const getButtonText = () => {
    if (isLoading) {
      return 'Loading...';
    } else if (isActiveSubscription) {
      return 'Current Plan';
    } else if (name.toLowerCase() === 'free' || name.toLowerCase() === 'free trial') {
      return 'Start Your Free Trial';
    } else if (name.toLowerCase() === 'monthly') {
      return 'Get Monthly Access';
    } else if (name.toLowerCase() === 'annual') {
      return 'Unlock Best Value';
    } else {
      return 'Choose This Plan';
    }
  };

  return (
    <Card 
      className={`w-full max-w-sm mx-auto relative ${popular ? 'border-brand-gold shadow-xl hover-lift-gold' : 'border-gray-200 hover-lift'}`}
      aria-labelledby={`pricing-plan-${name.toLowerCase().replace(/\s+/g, '-')}`}
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
      <PricingHeader
        name={name}
        price={price}
        description={description}
        mode={mode}
        popular={popular}
      />
      <CardContent>
        <PricingFeatures features={features} />
      </CardContent>
      <CardFooter>
        <Button
          onClick={handlePlanClick}
          disabled={isActiveSubscription || isLoading}
          className={`w-full ${
            isActiveSubscription
              ? 'bg-gray-300 hover:bg-gray-300 text-gray-700 cursor-not-allowed'
              : popular
                ? 'cta-button primary-cta gold-cta bg-brand-gold hover:bg-brand-gold/90 text-black'
                : 'cta-button primary-cta bg-brand-navy hover:bg-brand-navy/90 text-white'
          } high-contrast-focus`}
          aria-label={`${getButtonText()} for ${name} plan at ${price}`}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
};