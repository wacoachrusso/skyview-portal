import { Check } from "lucide-react";

interface PricingFeatureProps {
  text: string;
  textColor?: string;
}

export const PricingFeature = ({ text, textColor = "text-gray-600" }: PricingFeatureProps) => (
  <li className="flex items-center gap-2">
    <Check className="h-4 w-4 text-emerald-500" />
    <span className={`text-sm ${textColor}`}>{text}</span>
  </li>
);