import { Check } from "lucide-react";

interface PricingFeatureProps {
  text: string;
}

export const PricingFeature = ({ text }: PricingFeatureProps) => (
  <li className="flex items-center gap-2">
    <Check className="h-4 w-4 text-emerald-400" />
    <span className="text-sm text-gray-300">{text}</span>
  </li>
);