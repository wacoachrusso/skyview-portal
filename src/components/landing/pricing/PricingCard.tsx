import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";

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
    const baseClasses = "relative rounded-xl p-8 transition-all duration-300 hover:scale-[1.02] min-h-[520px] flex flex-col";
    
    switch (variant) {
      case "featured":
        return `${baseClasses} bg-gradient-to-br from-purple-600/10 via-purple-900/10 to-purple-900/20 border-2 border-purple-500/20 shadow-xl shadow-purple-500/5`;
      case "premium":
        return `${baseClasses} bg-gradient-to-br from-slate-800/50 via-slate-900/50 to-slate-950/50 border border-slate-700/30 shadow-lg`;
      default:
        return `${baseClasses} bg-gradient-to-br from-slate-800/30 via-slate-900/30 to-slate-950/30 border border-slate-700/20`;
    }
  };

  const getButtonClasses = () => {
    switch (variant) {
      case "featured":
        return "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20";
      case "premium":
        return "bg-slate-700 hover:bg-slate-800 text-white shadow-lg";
      default:
        return "bg-slate-800 hover:bg-slate-900 text-white";
    }
  };

  return (
    <div className={getCardClasses()}>
      {variant === "featured" && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-purple-600 text-white text-sm font-semibold rounded-full shadow-lg flex items-center gap-1">
          <Star className="w-4 h-4 fill-current" /> Most Popular
        </div>
      )}

      <div className="space-y-6 flex-1">
        <div>
          <h3 className={`text-2xl font-bold mb-3 ${variant === "featured" ? "text-purple-400" : "text-slate-200"}`}>
            {title}
          </h3>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-bold text-white">$</span>
            <span className="text-5xl font-bold text-white">{price}</span>
            <span className="text-lg text-slate-400">/{interval}</span>
          </div>
          <p className="text-base text-slate-400 leading-relaxed">{description}</p>
        </div>

        <div className="space-y-4 mt-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0">
                <Check className={`h-5 w-5 ${variant === "featured" ? "text-purple-400" : "text-slate-400"}`} />
              </div>
              <span className="text-base text-slate-300">{feature}</span>
            </div>
          ))}
        </div>

        <div className="pt-6 mt-auto">
          <Button
            onClick={onSelect}
            disabled={isLoading}
            className={`w-full py-6 text-base font-semibold ${getButtonClasses()}`}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}