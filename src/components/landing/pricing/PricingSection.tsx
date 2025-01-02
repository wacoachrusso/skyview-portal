import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { PricingCard } from "./PricingCard";
import { PricingHeader } from "./PricingHeader";

const plans = [
  {
    name: "Free Trial",
    price: "Free",
    description: "Perfect for trying out SkyGuide",
    features: [
      "2 contract queries",
      "Basic contract interpretation",
      "24/7 AI assistance",
      "Mobile app access"
    ],
    buttonText: "Start Free Trial",
    gradient: "bg-gradient-to-br from-slate-800 to-slate-900",
    priceId: null,
    mode: null
  },
  {
    name: "Monthly",
    price: "$4.99",
    period: "/month",
    description: "Most popular for active flight crew",
    features: [
      "Unlimited contract queries",
      "Advanced interpretation",
      "Priority support",
      "Custom contract uploads",
      "Offline access",
      "Premium features"
    ],
    buttonText: "Get Started",
    gradient: "bg-gradient-to-br from-brand-navy via-brand-navy to-brand-slate",
    isPopular: true,
    priceId: "price_1QcfUFA8w17QmjsPe9KXKFpT",
    mode: "subscription"
  },
  {
    name: "Annual",
    price: "$49.88",
    period: "/year",
    description: "Best value - Save $10 annually",
    features: [
      "Unlimited contract queries",
      "Advanced interpretation",
      "Priority support",
      "Custom contract uploads",
      "Offline access",
      "Premium features"
    ],
    buttonText: "Best Value",
    gradient: "bg-gradient-to-br from-brand-gold/20 to-brand-gold/10",
    priceId: "price_1QcfWYA8w17QmjsPZ22koqjj",
    mode: "subscription"
  }
];

export function PricingSection() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePlanSelection = async (plan: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('User not logged in, redirecting to signup with plan:', plan.name);
        navigate('/signup', { 
          state: { 
            selectedPlan: plan.name.toLowerCase(),
            priceId: plan.priceId // Pass the priceId through navigation state
          }
        });
        return;
      }

      if (!plan.priceId) {
        window.location.href = '/signup';
        return;
      }

      console.log('Making request to create-checkout-session with:', {
        session: session.access_token,
        priceId: plan.priceId,
        mode: plan.mode
      });
      
      const response = await supabase.functions.invoke('create-checkout-session', {
        body: JSON.stringify({
          priceId: plan.priceId,
          mode: plan.mode,
        }),
      });

      console.log('Checkout session response:', response);

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { data: { url } } = response;
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process payment. Please try again.",
      });
    }
  };

  return (
    <section id="pricing-section" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient opacity-50" />
      <div className="absolute inset-0 bg-glow-gradient opacity-30" />
      
      <div className="container mx-auto px-4 relative">
        <PricingHeader />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              onSelect={handlePlanSelection}
            />
          ))}
        </div>
      </div>
    </section>
  );
}