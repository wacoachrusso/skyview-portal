import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";

interface PricingFeatureProps {
  text: string;
  textColor?: string;
}

const PricingFeature = ({ text, textColor = "text-gray-600" }: PricingFeatureProps) => (
  <li className="flex items-center gap-2">
    <Check className="h-4 w-4 text-brand-gold" />
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
        return "w-full bg-white hover:bg-gray-50 text-brand-navy border-brand-navy hover:border-brand-navy/80";
      case "gradient":
        return "w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold";
      default:
        return "w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold";
    }
  };

  return (
    <Card className={`relative transform hover:scale-105 transition-transform duration-300 ${className} ${disabled ? 'opacity-75' : ''}`}>
      {badgeText && (
        <div className={`absolute -top-2.5 left-1/2 transform -translate-x-1/2 ${badgeColor} text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1`}>
          {title === "Monthly Plan" && <Star className="w-3 h-3" />}
          {badgeText}
        </div>
      )}
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl text-brand-navy">{title}</CardTitle>
        <div className="text-4xl font-bold text-brand-navy">
          {price}
          <span className="text-lg font-normal text-gray-500">/{interval}</span>
        </div>
        {savings && <div className="text-sm text-green-500 font-medium">{savings}</div>}
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <PricingFeature key={index} text={feature} textColor={textColor} />
          ))}
        </ul>
        <Button 
          className={getButtonClassName()}
          onClick={onSelect}
          disabled={isLoading || disabled}
        >
          {isLoading ? "Processing..." : buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}