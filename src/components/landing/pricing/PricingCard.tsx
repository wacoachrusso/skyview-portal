import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { PricingFeature } from "./PricingFeature";

interface PricingCardProps {
  title: string;
  price: string;
  interval: string;
  features: string[];
  badgeText?: string;
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
  buttonText,
  buttonVariant = "default",
  className = "",
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
        return "w-full bg-white/10 hover:bg-white/20 text-brand-gold border-brand-gold/50 hover:border-brand-gold";
      case "gradient":
        return "w-full bg-gradient-to-r from-brand-gold to-brand-gold/80 hover:from-brand-gold/90 hover:to-brand-gold/70 text-brand-navy font-semibold";
      default:
        return "w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold";
    }
  };

  return (
    <Card 
      className={`
        relative overflow-visible
        backdrop-blur-sm bg-white/5 dark:bg-gray-900/40
        border border-brand-gold/20 dark:border-brand-gold/20
        shadow-xl ${className} ${disabled ? 'opacity-75' : ''}
        transform transition-all duration-300 
        hover:scale-105 hover:shadow-2xl 
        hover:border-brand-gold/30 dark:hover:border-brand-gold/30
        group mt-12
      `}
    >
      {badgeText && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20
          bg-gradient-to-r from-brand-gold to-brand-gold/80
          text-brand-navy px-4 py-1 rounded-full text-sm font-medium 
          flex items-center gap-1 shadow-lg whitespace-nowrap"
        >
          {title === "Monthly Plan" && <Star className="w-4 h-4" />}
          {badgeText}
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/5 to-brand-slate/5 
        opacity-0 group-hover:opacity-100 
        transition-opacity duration-300" 
      />
      
      <CardHeader className="space-y-2 pt-10 relative z-[1]">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-brand-gold to-brand-gold/80 
          bg-clip-text text-transparent"
        >
          {title}
        </CardTitle>
        <div className="flex items-baseline">
          <span className="text-4xl font-bold text-white">{price}</span>
          <span className="text-lg font-normal text-gray-400">/{interval}</span>
        </div>
        {savings && (
          <div className="text-sm text-brand-gold font-medium 
            bg-brand-gold/10 dark:bg-brand-gold/10 
            px-2 py-1 rounded-full inline-block"
          >
            {savings}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="relative z-[1]">
        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <PricingFeature 
              key={index} 
              text={feature}
              textColor="text-gray-300"
            />
          ))}
        </ul>
        <Button 
          className={`${getButtonClassName()} 
            shadow-lg transform transition-all duration-300 
            hover:-translate-y-1 relative z-[1]`}
          onClick={onSelect}
          disabled={isLoading || disabled}
        >
          {isLoading ? "Processing..." : buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}