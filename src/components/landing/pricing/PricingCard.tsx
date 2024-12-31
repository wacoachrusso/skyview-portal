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
  variant: "teal" | "yellow" | "dark";
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
  const getBackgroundColor = () => {
    switch (variant) {
      case "teal":
        return "bg-[#40CDB2]";
      case "yellow":
        return "bg-[#FFD60A]";
      case "dark":
        return "bg-[#2A3441]";
    }
  };

  const getTextColor = () => {
    return variant === "dark" ? "text-white" : "text-gray-800";
  };

  return (
    <div className={`rounded-lg p-8 h-full flex flex-col ${getBackgroundColor()} ${getTextColor()}`}>
      <div className="mb-8">
        <div className="text-sm uppercase mb-2">
          {title}
        </div>
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-4xl font-bold">$</span>
          <span className="text-5xl font-bold">{price}</span>
          <span className="text-lg">/{interval}</span>
        </div>
        <p className="text-sm opacity-90 mb-6">
          {description}
        </p>
      </div>

      <div className="flex-grow">
        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Check className="w-5 h-5 mt-0.5 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={onSelect}
          disabled={isLoading}
          className={`w-full py-6 text-base font-medium ${
            variant === "dark" 
              ? "bg-white/10 hover:bg-white/20 text-white" 
              : "bg-[#2A3441] hover:bg-[#1A1F2C] text-white"
          }`}
        >
          {buttonText}
        </Button>
        <button className="text-sm underline opacity-80 hover:opacity-100 w-full text-center">
          Learn more
        </button>
      </div>
    </div>
  );
}