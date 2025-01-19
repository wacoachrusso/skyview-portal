import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PricingHeader } from "./pricing-card/PricingHeader";
import { PricingFeatures } from "./pricing-card/PricingFeatures";
import { usePricingCard } from "./pricing-card/usePricingCard";

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
  const { handlePlanSelection } = usePricingCard();

  return (
    <Card className={`w-full max-w-sm mx-auto ${popular ? 'border-brand-gold shadow-xl' : 'border-gray-200'}`}>
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
          onClick={() => handlePlanSelection(name, priceId, mode, onSelect)}
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