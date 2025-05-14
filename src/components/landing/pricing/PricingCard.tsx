import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PricingHeader } from "./pricing-card/PricingHeader";
import { PricingFeatures } from "./pricing-card/PricingFeatures";
import { usePricingHandler } from "@/hooks/usePricingHandler";
import { useEffect, useState } from "react";
import { useProfileRefresh } from "@/utils/user/refreshProfile";

interface UserProfile {
  id: string;
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
  const [isActiveSubscription, setIsActiveSubscription] = useState(false);
  useProfileRefresh();

  useEffect(() => {
    // Get user profile from local storage when component mounts
    try {
      const profileData = localStorage.getItem("user_profile");
      if (profileData) {
        const profile = JSON.parse(profileData);
        setUserProfile(profile);
        
        // Check if this plan is the user's active subscription
        const isActive = (
          // For paid plans: check if plan names match and subscription is active
          ((profile.subscription_plan.toLowerCase() === name.toLowerCase() ||
           (profile.subscription_plan === "monthly" && name.toLowerCase() === "monthly") ||
           (profile.subscription_plan === "annual" && name.toLowerCase() === "annual")) &&
           profile.subscription_status === "active") ||
          // For free plan: check if user is on free plan and this is the free trial card
          (profile.subscription_plan === "free" && 
           (name.toLowerCase() === "free" || name.toLowerCase() === "free trial"))
        );
        
        setIsActiveSubscription(isActive);
      }
    } catch (error) {
      console.error("Error retrieving user profile from local storage:", error);
    }
  }, [name]);

  // Add a window focus listener to refresh user profile data when the tab regains focus
  // This helps catch profile updates after returning from payment providers
  useEffect(() => {
    const handleFocus = () => {
      try {
        // Re-read the profile from localStorage in case it was updated
        const profileData = localStorage.getItem("user_profile");
        if (profileData) {
          const profile = JSON.parse(profileData);
          setUserProfile(profile);
          
          // Re-check active subscription status
          const isActive = (
            ((profile.subscription_plan.toLowerCase() === name.toLowerCase() ||
             (profile.subscription_plan === "monthly" && name.toLowerCase() === "monthly") ||
             (profile.subscription_plan === "annual" && name.toLowerCase() === "annual")) &&
             profile.subscription_status === "active") ||
            (profile.subscription_plan === "free" && 
             (name.toLowerCase() === "free" || name.toLowerCase() === "free trial"))
          );
          
          setIsActiveSubscription(isActive);
        }
      } catch (error) {
        console.error("Error refreshing user profile on window focus:", error);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [name]);

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
    if (isActiveSubscription) {
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
          disabled={isActiveSubscription}
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