import { useEffect } from "react";
import { usePlanSelection } from "./usePlanSelection";
import { PricingCard } from "./PricingCard";

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
      buttonVariant: "outline" as const,
      className: "bg-gradient-to-br from-purple-50/30 to-violet-50/30 dark:from-purple-950/30 dark:to-violet-950/30",
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
      buttonVariant: "gradient" as const,
      className: "bg-gradient-to-br from-purple-100/30 to-violet-100/30 dark:from-purple-900/30 dark:to-violet-900/30 relative z-10",
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
      buttonVariant: "gradient" as const,
      className: "bg-gradient-to-br from-purple-50/30 to-violet-50/30 dark:from-purple-950/30 dark:to-violet-950/30",
      savings: "Save $10 annually",
      planId: "annual"
    }
  ];

  return (
    <div id="pricing-section" className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-100/20 via-transparent to-transparent dark:from-purple-500/5 -z-10" />
      
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Choose the plan that best fits your needs. All plans include access to our core features.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
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