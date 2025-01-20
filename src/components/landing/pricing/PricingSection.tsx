import { PricingCard } from "./PricingCard";
import { PricingHeader } from "./PricingHeader";
import { plans } from "./pricingPlans";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function PricingSection() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePlanSelection = async (plan: any) => {
    try {
      console.log('Plan selected:', plan);
      
      // Check if user is already logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('User not logged in, redirecting to signup with plan:', plan.name);
        navigate('/signup', { 
          state: { 
            selectedPlan: plan.name.toLowerCase(),
            priceId: plan.priceId,
            mode: plan.mode
          }
        });
        return;
      }

      // For logged-in users, create checkout session directly
      console.log('Creating checkout session for logged-in user');
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: plan.priceId,
          mode: plan.mode,
          email: session.user.email
        }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        throw error;
      }

      if (data?.url) {
        console.log('Redirecting to checkout:', data.url);
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error handling plan selection:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process plan selection. Please try again."
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
              name={plan.name}
              price={plan.price}
              description={plan.description}
              features={plan.features}
              priceId={plan.priceId}
              mode={plan.mode}
              popular={plan.isPopular}
              onSelect={() => handlePlanSelection(plan)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}