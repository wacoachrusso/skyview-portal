import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingCardProps {
  title: string;
  price: string;
  interval: string;
  description: string;
  features: string[];
  buttonText: string;
  onSelect: () => void;
  isLoading?: boolean;
  variant: "default" | "featured" | "premium";
}

export function PricingCard({
  title,
  price,
  interval,
  description,
  features,
  buttonText,
  onSelect,
  isLoading,
  variant
}: PricingCardProps) {
  const getCardClasses = () => {
    const baseClasses = "relative rounded-xl p-8 transition-all duration-300 min-h-[520px] flex flex-col";
    
    switch (variant) {
      case "featured":
        return `${baseClasses} bg-gradient-to-b from-brand-navy to-brand-slate border-2 border-brand-gold/20 shadow-lg shadow-brand-gold/5`;
      case "premium":
        return `${baseClasses} bg-gradient-to-b from-brand-slate to-secondary border border-white/10`;
      default:
        return `${baseClasses} bg-gradient-to-b from-secondary to-brand-slate border border-white/10`;
    }
  };

  return (
    <div className={getCardClasses()}>
      {variant === "featured" && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-gold text-brand-navy text-sm font-semibold rounded-full shadow-lg">
          Most Popular
        </div>
      )}
      
      <div className="space-y-6 flex-1">
        <div className="pt-4">
          <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-bold text-white">$</span>
            <span className="text-5xl font-bold text-white">{price}</span>
            <span className="text-lg text-gray-300">/{interval}</span>
          </div>
          <p className="text-base text-gray-300 leading-relaxed">{description}</p>
        </div>

        <div className="space-y-4 mt-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0">
                <Check className="h-5 w-5 text-brand-gold" />
              </div>
              <span className="text-base text-gray-300">{feature}</span>
            </div>
          ))}
        </div>

        <div className="pt-6 mt-auto">
          <Button
            onClick={onSelect}
            disabled={isLoading}
            className={`w-full py-6 text-base font-semibold ${
              variant === "featured"
                ? "bg-brand-gold hover:bg-brand-gold/90 text-brand-navy"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}