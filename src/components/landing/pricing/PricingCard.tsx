
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PricingHeader } from "./pricing-card/PricingHeader";
import { PricingFeatures } from "./pricing-card/PricingFeatures";
import { usePricingCard } from "./pricing-card/usePricingCard";
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
}

export const PricingCard = ({ 
  name, 
  price, 
  description, 
  features, 
  priceId,
  mode = 'subscription',
  popular = false,
  onSelect 
}: PricingCardProps) => {
  const { handlePlanSelection: handleCardSelection } = usePricingCard();
  const { handlePlanSelection } = usePricingHandler();

  const handlePlanClick = async () => {
    try {
      console.log(`Plan clicked: ${name} with priceId: ${priceId}`);
      
      // First try the direct handler if provided
      if (onSelect) {
        await onSelect();
        return;
      }
      
      // Special handling for free trial
      if (name.toLowerCase() === 'free' || name.toLowerCase() === 'free trial') {
        console.log("Free trial selected, using pricing handler directly");
        
        // Always use the pricing handler directly for free trial to ensure it works
        await handlePlanSelection({
          name: name,
          priceId: priceId,
          mode: mode
        });
        return;
      }
      
      // For other plans, use the pricing card hook for compatibility
      await handleCardSelection(name, priceId, mode);
      
    } catch (error) {
      console.error("Error handling plan selection:", error);
    }
  };

  return (
    <Card className={`w-full max-w-sm mx-auto ${popular ? 'border-brand-gold shadow-xl hover-lift-gold' : 'border-gray-200 hover-lift'}`}>
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
              ? 'bg-brand-gold hover:bg-brand-gold/90 text-black'
              : 'bg-brand-navy hover:bg-brand-navy/90 text-white'
          }`}
        >
          Get Started
        </Button>
      </CardFooter>
    </Card>
  );
};
