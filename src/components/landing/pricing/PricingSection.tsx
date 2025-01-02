import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
          state: { selectedPlan: plan.name.toLowerCase() }
        });
        return;
      }

      if (!plan.priceId) {
        window.location.href = '/signup';
        return;
      }

      console.log('Making request to create-checkout-session with session:', session.access_token);
      
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
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Choose the perfect plan for your needs. All plans include our core features with no hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${plan.gradient} border-2 border-white/10 backdrop-blur-sm p-6 rounded-xl transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-gold/5`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-gold text-brand-navy px-4 py-1 rounded-full text-sm font-semibold">
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
                onClick={() => handlePlanSelection(plan)}
                className={`w-full ${
                  plan.isPopular 
                    ? "bg-brand-gold hover:bg-brand-gold/90 text-brand-navy"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                } font-semibold`}
              >
                {plan.buttonText}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
