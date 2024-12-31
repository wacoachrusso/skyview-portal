import { PricingCard } from "./PricingCard";
import { useEffect } from "react";
import { usePlanSelection } from "./usePlanSelection";

export function PricingSection() {
  const { handlePlanSelection, isLoading } = usePlanSelection();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      badgeText: "Start Free",
      buttonText: "Start Free Trial",
      planId: "free"
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
      buttonText: "Choose Monthly",
      isPopular: true,
      planId: "monthly"
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
      buttonText: "Choose Annual",
      savings: "Save $10 annually",
      planId: "annual"
    }
  ];

  return (
    <div id="pricing-section" className="py-20 px-4 relative overflow-hidden bg-[#1A1F2C]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent -z-10" />
      
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center text-emerald-400 mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Choose the plan that best fits your needs. All plans include access to our core features.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.planId}
              {...plan}
              onSelect={() => handlePlanSelection(plan.planId)}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}