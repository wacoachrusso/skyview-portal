import { Button } from "@/components/ui/button";
import { Check, Pencil, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PricingTier {
  name: string;
  icon: React.ReactNode;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
  priceId: string | null;
  mode: 'subscription' | 'payment' | null;
}

function CreativePricing({
  tag = "Simple Pricing",
  title = "Choose Your Plan",
  description = "Get instant answers to your contract questions",
  tiers,
}: {
  tag?: string;
  title?: string;
  description?: string;
  tiers: PricingTier[];
}) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePlanSelection = async (plan: PricingTier) => {
    try {
      console.log('Plan selected:', plan);
      
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

      if (!plan.priceId) {
        navigate('/signup');
        return;
      }

      console.log('Creating checkout session for logged-in user');
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: plan.priceId,
          mode: plan.mode,
          email: session.user.email
        }
      });

      if (error) throw error;

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
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="text-center space-y-6 mb-16">
        <div className="text-xl text-brand-gold">
          {tag}
        </div>
        <div className="relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            {title}
            <div className="absolute -right-12 top-0 text-brand-gold rotate-12">
              ✨
            </div>
            <div className="absolute -left-8 bottom-0 text-brand-purple -rotate-12">
              ⭐️
            </div>
          </h2>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-44 h-3 bg-brand-gold/20 rotate-[-1deg] rounded-full blur-sm" />
        </div>
        <p className="text-xl text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier, index) => (
          <div
            key={tier.name}
            className={cn(
              "relative group",
              "transition-all duration-300",
              index === 0 && "rotate-[-1deg]",
              index === 1 && "rotate-[1deg]",
              index === 2 && "rotate-[-2deg]"
            )}
          >
            <div
              className={cn(
                "absolute inset-0 bg-card",
                "border-2 border-brand-gold",
                "rounded-lg",
                "shadow-[4px_4px_0px_0px] shadow-brand-gold/30",
                "transition-all duration-300",
                "group-hover:shadow-[8px_8px_0px_0px] group-hover:shadow-brand-gold/40",
                "group-hover:translate-x-[-4px]",
                "group-hover:translate-y-[-4px]",
                "before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-brand-gold/50 before:-m-[2px]",
                "after:absolute after:inset-0 after:rounded-lg after:border-2 after:border-brand-gold/20 after:-m-[4px]"
              )}
            />

            <div className="relative p-6">
              {tier.popular && (
                <div className="absolute -top-2 -right-2 bg-brand-gold text-black px-3 py-1 rounded-full rotate-12 text-sm border-2 border-brand-gold/50">
                  Popular!
                </div>
              )}

              <div className="mb-6">
                <div className={cn(
                  "w-12 h-12 rounded-full mb-4",
                  "flex items-center justify-center",
                  "border-2 border-brand-gold/50",
                  "text-brand-gold"
                )}>
                  {tier.icon}
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {tier.name}
                </h3>
                <p className="text-muted-foreground">
                  {tier.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  {tier.price}
                </span>
                {tier.price !== "Free" && (
                  <span className="text-muted-foreground">
                    {tier.name === "Annual" ? "/year" : "/month"}
                  </span>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {tier.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-brand-gold/50 flex items-center justify-center">
                      <Check className="w-3 h-3 text-brand-gold" />
                    </div>
                    <span className="text-white">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handlePlanSelection(tier)}
                className={cn(
                  "w-full h-12 text-lg relative",
                  "border-2 border-brand-gold/50",
                  "transition-all duration-300",
                  "shadow-[4px_4px_0px_0px] shadow-brand-gold/30",
                  "hover:shadow-[6px_6px_0px_0px] hover:shadow-brand-gold/40",
                  "hover:translate-x-[-2px] hover:translate-y-[-2px]",
                  tier.popular
                    ? "bg-brand-gold text-black hover:bg-brand-gold/90"
                    : "bg-card text-white hover:bg-card/90"
                )}
              >
                Get Started
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { CreativePricing };
export type { PricingTier };