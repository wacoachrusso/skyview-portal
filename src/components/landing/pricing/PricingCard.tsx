import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  gradient: string;
  isPopular?: boolean;
  priceId: string | null;
  mode: string | null;
}

interface PricingCardProps {
  plan: PricingPlan;
  onSelect: (plan: PricingPlan) => void;
}

export function PricingCard({ plan, onSelect }: PricingCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePlanSelection = async () => {
    try {
      console.log('Handling plan selection:', plan);
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('User not logged in, redirecting to signup with plan:', {
          name: plan.name,
          priceId: plan.priceId,
          mode: plan.mode
        });
        
        navigate('/signup', { 
          state: { 
            selectedPlan: plan.name.toLowerCase(),
            priceId: plan.priceId,
            mode: plan.mode
          }
        });
        return;
      }

      if (!plan.priceId) {
        console.log('No priceId found, redirecting to signup');
        window.location.href = '/signup';
        return;
      }

      console.log('Creating checkout session for plan:', plan);
      onSelect(plan);
      
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process plan selection. Please try again.",
      });
    }
  };

  return (
    <Card
      className={`relative ${plan.gradient} border-2 border-white/10 backdrop-blur-sm p-6 rounded-xl transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-gold/5 mt-6`}
    >
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-auto whitespace-nowrap">
          <span className="bg-brand-gold text-brand-navy px-6 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-white">{plan.price}</span>
          {plan.period && (
            <span className="text-gray-400">{plan.period}</span>
          )}
        </div>
        <p className="text-gray-400 mt-2">{plan.description}</p>
      </div>

      <ul className="space-y-4 mb-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      <Button 
        onClick={handlePlanSelection}
        className={`w-full ${
          plan.isPopular 
            ? "bg-brand-gold hover:bg-brand-gold/90 text-brand-navy"
            : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
        } font-semibold`}
      >
        {plan.buttonText}
      </Button>
    </Card>
  );
}