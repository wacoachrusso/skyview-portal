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
    const baseClasses = "relative rounded-2xl p-8 transition-all duration-500 hover:scale-105 min-h-[520px] flex flex-col backdrop-blur-sm";
    
    switch (variant) {
      case "featured":
        return `${baseClasses} bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 shadow-2xl shadow-purple-500/10`;
      case "premium":
        return `${baseClasses} bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-orange-500/20 shadow-xl`;
      default:
        return `${baseClasses} bg-gradient-to-br from-slate-800/40 via-slate-900/40 to-slate-950/40 border border-slate-700/30`;
    }
  };

  const getButtonClasses = () => {
    switch (variant) {
      case "featured":
        return "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/20";
      case "premium":
        return "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white shadow-lg";
      default:
        return "bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white";
    }
  };

  const getBadgeClasses = () => {
    switch (variant) {
      case "featured":
        return "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500";
      case "premium":
        return "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500";
      default:
        return "bg-gradient-to-r from-slate-700 to-slate-900";
    }
  };

  return (
    <div className={getCardClasses()}>
      {variant === "featured" && (
        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 ${getBadgeClasses()} text-white text-sm font-semibold rounded-full shadow-lg flex items-center gap-1.5`}>
          <Star className="w-4 h-4 fill-current" /> Most Popular
        </div>
      )}

      <div className="flex flex-col flex-1 justify-between">
        <div className="space-y-6">
          <div>
            <h3 className={`text-2xl font-bold mb-3 ${
              variant === "featured" 
                ? "bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400" 
                : variant === "premium"
                  ? "bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400"
                  : "text-slate-200"
            } ${variant !== "default" ? "bg-clip-text text-transparent" : ""}`}>
              {title}
            </h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-white">$</span>
              <span className="text-5xl font-bold text-white">{price}</span>
              <span className="text-lg text-slate-400">/{interval}</span>
            </div>
            <p className="text-base text-slate-400 leading-relaxed">{description}</p>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 group min-h-[2rem]">
                <div className="flex-shrink-0">
                  <Check className={`h-5 w-5 ${
                    variant === "featured" 
                      ? "text-purple-400" 
                      : variant === "premium"
                        ? "text-orange-400"
                        : "text-slate-400"
                  }`} />
                </div>
                <span className="text-base text-slate-300 group-hover:text-white transition-colors">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8">
          <Button
            onClick={onSelect}
            disabled={isLoading}
            className={`w-full py-6 text-base font-semibold transition-all duration-300 transform hover:-translate-y-1 ${getButtonClasses()}`}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}