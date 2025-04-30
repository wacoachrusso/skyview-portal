import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PricingHeader } from "./pricing-card/PricingHeader";
import { PricingFeatures } from "./pricing-card/PricingFeatures";
import { usePricingHandler } from "@/hooks/usePricingHandler";

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

  // Determine persuasive button text based on plan name
  const getButtonText = () => {
    if (name.toLowerCase() === 'free' || name.toLowerCase() === 'free trial') {
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
          className={`w-full ${
            popular
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