import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";

interface PricingFeatureProps {
  text: string;
  textColor?: string;
}

const PricingFeature = ({ text, textColor = "text-gray-600" }: PricingFeatureProps) => (
  <li className="flex items-center gap-2">
    <Check className="h-4 w-4 text-emerald-500" />
    <span className={`text-sm ${textColor}`}>{text}</span>
  </li>
);

interface PricingCardProps {
  title: string;
  price: string;
  interval: string;
  features: string[];
  badgeText?: string;
  badgeColor?: string;
  buttonText: string;
  buttonVariant?: "default" | "outline" | "gradient";
  className?: string;
  textColor?: string;
  savings?: string;
  planId: string;
  onSelect: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function PricingCard({
  title,
  price,
  interval,
  features,
  badgeText,
  badgeColor = "bg-brand-navy",
  buttonText,
  buttonVariant = "default",
  className = "",
  textColor = "text-gray-600",
  savings,
  onSelect,
  isLoading,
  disabled
}: PricingCardProps) {
  const getButtonClassName = () => {
    if (disabled) {
      return "w-full bg-gray-300 text-gray-600 cursor-not-allowed";
    }
    
    switch (buttonVariant) {
      case "outline":
        return "w-full bg-white hover:bg-gray-50 text-emerald-600 border-emerald-500 hover:border-emerald-600";
      case "gradient":
        return "w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold";
      default:
        return "w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold";
    }
  };

  return (
    <Card className={`relative backdrop-blur-sm bg-white/10 border border-gray-200/20 shadow-xl ${className} ${disabled ? 'opacity-75' : ''} 
      transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-emerald-500/30`}>
      {badgeText && (
        <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${badgeColor} text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg`}>
          {title === "Monthly Plan" && <Star className="w-3 h-3" />}
          {badgeText}
        </div>
      )}
      <CardHeader className="space-y-2 pt-8">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
          {title}
        </CardTitle>
        <div className="flex items-baseline">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">{price}</span>
          <span className="text-lg font-normal text-gray-500 dark:text-gray-400">/{interval}</span>
        </div>
        {savings && (
          <div className="text-sm text-emerald-500 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full inline-block">
            {savings}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <PricingFeature 
              key={index} 
              text={feature} 
              textColor={textColor} 
            />
          ))}
        </ul>
        <Button 
          className={`${getButtonClassName()} shadow-lg transform transition-all duration-300 hover:-translate-y-1`}
          onClick={onSelect}
          disabled={isLoading || disabled}
        >
          {isLoading ? "Processing..." : buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}