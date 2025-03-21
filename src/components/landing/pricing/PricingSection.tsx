
import { PricingCard } from "./PricingCard";
import { PricingHeader } from "./PricingHeader";
import { plans } from "./pricingPlans";
import { usePricingHandler } from "@/hooks/usePricingHandler";

export function PricingSection() {
  const { handlePlanSelection } = usePricingHandler();

  return (
    <section id="pricing-section" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient opacity-50" />
      <div className="absolute inset-0 bg-glow-gradient opacity-30" />
      
      <div className="container mx-auto px-4 relative">
        <PricingHeader />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <PricingCard
              key={plan.name}
              name={plan.name}
              price={plan.price}
              description={plan.description}
              features={plan.features}
              priceId={plan.priceId}
              mode={plan.mode}
              popular={plan.isPopular}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
