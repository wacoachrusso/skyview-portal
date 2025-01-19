import { Check } from "lucide-react";

interface PricingFeaturesProps {
  features: string[];
}

export const PricingFeatures = ({ features }: PricingFeaturesProps) => {
  return (
    <ul className="space-y-3">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <Check className="h-5 w-5 text-brand-gold mr-2" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
};