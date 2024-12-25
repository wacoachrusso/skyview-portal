import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PricingFeature } from "./PricingFeature";

interface PricingCardProps {
  title: string;
  price: string;
  interval: string;
  features: string[];
  badgeText: string;
  badgeColor: string;
  buttonText: string;
  buttonVariant?: "default" | "outline" | "gradient";
  textColor?: string;
  savings?: string;
  className?: string;
  onSelect: () => void;
  isLoading: boolean;
}

export const PricingCard = ({
  title,
  price,
  interval,
  features,
  badgeText,
  badgeColor,
  buttonText,
  buttonVariant = "default",
  textColor = "text-gray-600",
  savings,
  className = "",
  onSelect,
  isLoading
}: PricingCardProps) => {
  const getButtonClassName = () => {
    switch (buttonVariant) {
      case "outline":
        return "w-full bg-white hover:bg-gray-50 text-brand-navy border-brand-navy hover:border-brand-navy/80";
      case "gradient":
        return "w-full bg-gradient-to-r from-brand-gold to-brand-gold/90 hover:from-brand-gold/90 hover:to-brand-gold text-brand-navy font-semibold";
      default:
        return "w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold";
    }
  };

  return (
    <Card className={`relative transform hover:scale-105 transition-transform duration-300 hover:shadow-xl ${className}`}>
      <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 ${badgeColor} text-white px-4 py-1 rounded-full text-sm`}>
        {badgeText}
      </div>
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl text-brand-navy">{title}</CardTitle>
        <div className="text-4xl font-bold text-brand-navy">
          {price}
          <span className="text-lg font-normal text-gray-500">/{interval}</span>
        </div>
        {savings && <div className="text-sm text-green-600 font-medium">{savings}</div>}
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <PricingFeature key={index} text={feature} textColor={textColor} />
          ))}
        </ul>
        <Button 
          variant={buttonVariant === "outline" ? "outline" : "default"}
          className={getButtonClassName()}
          onClick={onSelect}
          disabled={isLoading}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};