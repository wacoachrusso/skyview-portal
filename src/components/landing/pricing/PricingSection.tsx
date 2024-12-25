import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PricingCard } from "./PricingCard";

export function PricingSection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanSelection = async (plan: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/signup', { state: { selectedPlan: plan } });
        return;
      }

      // Get user's IP address using a public API
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();

      const updates = {
        subscription_plan: plan,
        last_ip_address: ip,
        query_count: 0, // Reset query count when changing plans
        last_query_timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Plan Selected",
        description: `You've selected the ${plan} plan.`,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error selecting plan:', error);
      toast({
        title: "Error",
        description: "Failed to select plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pricingPlans = [
    {
      title: "Free Trial",
      price: "$0",
      interval: "forever",
      features: [
        "2 Contract Queries",
        "Basic Features",
        "No Credit Card Required"
      ],
      badgeText: "Try it Free",
      badgeColor: "bg-brand-navy",
      buttonText: "Start Free Trial",
      buttonVariant: "outline" as const,
      className: "bg-white border-2 border-gray-100"
    },
    {
      title: "Monthly Plan",
      price: "$4.99",
      interval: "month",
      features: [
        "Unlimited Queries",
        "All Features",
        "Priority Support"
      ],
      badgeText: "Most Popular",
      badgeColor: "bg-brand-gold",
      buttonText: "Choose Monthly",
      className: "bg-gradient-to-br from-brand-navy to-brand-slate border-0",
      textColor: "text-gray-200"
    },
    {
      title: "Annual Plan",
      price: "$49.99",
      interval: "year",
      features: [
        "Unlimited Queries",
        "All Features",
        "Priority Support",
        "Annual Savings"
      ],
      badgeText: "Best Value",
      badgeColor: "bg-green-600",
      buttonText: "Choose Annual",
      buttonVariant: "gradient" as const,
      className: "bg-white border-2 border-brand-gold",
      savings: "Save $10 annually"
    }
  ];

  return (
    <div id="pricing-section" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center text-brand-navy mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Choose the plan that best fits your needs. All plans include access to our core features.
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={index}
              {...plan}
              onSelect={() => handlePlanSelection(plan.title.toLowerCase().split(' ')[0])}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}