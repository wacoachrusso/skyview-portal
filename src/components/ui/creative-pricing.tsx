import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingTier {
  name: string;
  icon: React.ReactNode;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
  priceId: string | null;
  mode: "subscription" | "payment" | null;
}

function CreativePricing({
  tag,
  title,
  description,
  tiers,
  paymentMethods,
}: {
  tag?: string;
  title?: string;
  description?: string;
  paymentMethods?: string;
  tiers: PricingTier[];
}) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="text-center space-y-6 mb-16">
        <div className="text-xl text-brand-gold">
          {tag}
        </div>
        <div className="relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            {title}
          </h2>
        </div>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          {description}
        </p>
        {paymentMethods && (
          <p className="text-sm text-gray-400">
            {paymentMethods}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={cn(
              "relative group bg-white/5 backdrop-blur-sm",
              "border border-white/10 rounded-lg",
              "transition-all duration-300 hover:border-brand-gold/50",
              "hover:shadow-[0_0_30px_rgba(0,0,0,0.2)]"
            )}
          >
            <div className="relative p-6">
              {tier.popular && (
                <div className="absolute -top-3 -right-3 bg-brand-gold text-black px-3 py-1 rounded-full text-sm font-medium">
                  Popular
                </div>
              )}

              <div className="mb-6">
                <div className={cn(
                  "w-12 h-12 rounded-full mb-4",
                  "flex items-center justify-center",
                  "border border-white/20",
                  `text-${tier.color}-500`
                )}>
                  {tier.icon}
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {tier.name}
                </h3>
                <p className="text-gray-400">
                  {tier.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  {tier.price}
                </span>
                {tier.mode === 'subscription' && (
                  <span className="text-gray-400 ml-2">
                    {tier.name === 'Annual' ? '/year' : '/month'}
                  </span>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {tier.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3"
                  >
                    <div className="text-brand-gold">
                      <Check className="w-5 h-5" />
                    </div>
                    <span className="text-gray-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                className={cn(
                  "w-full",
                  tier.popular
                    ? "bg-brand-gold hover:bg-brand-gold/90 text-black"
                    : "bg-white/10 hover:bg-white/20 text-white"
                )}
              >
                Get Started
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { CreativePricing };
export type { PricingTier };