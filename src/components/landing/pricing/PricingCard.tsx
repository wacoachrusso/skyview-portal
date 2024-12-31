import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import { PricingFeature } from "./PricingFeature";

interface PricingCardProps {
  title: string;
  price: string;
  interval: string;
  features: string[];
  badgeText?: string;
  buttonText: string;
  isPopular?: boolean;
  savings?: string;
  planId: string;
  onSelect: () => void;
  isLoading?: boolean;
}

export function PricingCard({
  title,
  price,
  interval,
  features,
  badgeText,
  buttonText,
  isPopular,
  savings,
  onSelect,
  isLoading
}: PricingCardProps) {
  return (
    <Card 
      className={`
        relative overflow-visible
        bg-[#2A3441]/50 backdrop-blur-sm
        border border-emerald-500/20
        shadow-xl transform transition-all duration-300 
        hover:scale-105 hover:shadow-2xl hover:border-emerald-400/30
        group mt-12
        ${isPopular ? 'bg-emerald-900/20 border-emerald-400/30' : ''}
      `}
    >
      {badgeText && (
        <div className={`
          absolute -top-3 left-1/2 transform -translate-x-1/2 z-20
          ${isPopular ? 'bg-emerald-400' : 'bg-emerald-500'}
          text-emerald-950 px-4 py-1 rounded-full text-sm font-medium 
          flex items-center gap-1 shadow-lg whitespace-nowrap
        `}>
          {isPopular && <Star className="w-4 h-4" />}
          {badgeText}
        </div>
      )}
      
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-emerald-400">{title}</h3>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-white">{price}</span>
            <span className="text-lg font-normal text-gray-400">/{interval}</span>
          </div>
          {savings && (
            <div className="text-sm text-emerald-400 font-medium 
              bg-emerald-500/10 px-2 py-1 rounded-full inline-block"
            >
              {savings}
            </div>
          )}
        </div>
        
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <PricingFeature key={index} text={feature} />
          ))}
        </ul>

        <Button 
          className={`
            w-full shadow-lg transform transition-all duration-300 
            hover:-translate-y-1 relative
            ${isPopular 
              ? 'bg-emerald-400 hover:bg-emerald-500 text-emerald-950' 
              : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-white border border-emerald-500/50'
            }
          `}
          onClick={onSelect}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : buttonText}
        </Button>
      </div>
    </Card>
  );
}