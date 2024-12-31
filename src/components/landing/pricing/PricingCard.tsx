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
        return "w-full bg-white/10 hover:bg-white/20 text-purple-400 border-purple-400/50 hover:border-purple-400";
      case "gradient":
        return "w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold";
      default:
        return "w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold";
    }
  };

  return (
    <Card 
      className={`
        relative overflow-visible mt-8
        backdrop-blur-sm bg-white/5 dark:bg-gray-900/40
        border border-purple-100/20 dark:border-purple-500/20
        shadow-xl ${className} ${disabled ? 'opacity-75' : ''}
        transform transition-all duration-300 
        hover:scale-105 hover:shadow-2xl 
        hover:border-purple-500/30 dark:hover:border-purple-400/30
        group
      `}
    >
      {badgeText && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10
          bg-gradient-to-r from-purple-600 to-violet-600
          text-white px-4 py-1 rounded-full text-sm font-medium 
          flex items-center gap-1 shadow-lg whitespace-nowrap"
        >
          {title === "Monthly Plan" && <Star className="w-4 h-4" />}
          {badgeText}
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/5 to-violet-50/5 
        dark:from-purple-900/5 dark:to-violet-900/5 opacity-0 group-hover:opacity-100 
        transition-opacity duration-300" 
      />
      
      <CardHeader className="space-y-2 pt-10 relative z-[1]">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 
          bg-clip-text text-transparent"
        >
          {title}
        </CardTitle>
        <div className="flex items-baseline">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">{price}</span>
          <span className="text-lg font-normal text-gray-500 dark:text-gray-400">/{interval}</span>
        </div>
        {savings && (
          <div className="text-sm text-purple-500 font-medium 
            bg-purple-50 dark:bg-purple-900/20 
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
              textColor="text-gray-600 dark:text-gray-300"
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