import { CardHeader, CardTitle } from "@/components/ui/card";

interface PricingHeaderProps {
  name: string;
  price: string;
  description: string;
  mode?: 'subscription' | 'payment';
  popular?: boolean;
}

export const PricingHeader = ({ 
  name, 
  price, 
  description, 
  mode = 'subscription',
  popular = false 
}: PricingHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="text-2xl font-bold text-center">
        {name}
        {popular && (
          <span className="ml-2 inline-block px-2 py-1 text-xs font-semibold text-black bg-brand-gold rounded-full">
            Popular
          </span>
        )}
      </CardTitle>
      <div className="text-center">
        <span className="text-4xl font-bold">{price}</span>
        {mode === 'subscription' && <span className="text-gray-500 ml-1">/month</span>}
      </div>
      <p className="text-center text-gray-500 mt-2">{description}</p>
    </CardHeader>
  );
};