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
      badgeText: "Try it Free",
      badgeColor: "bg-brand-navy",
      buttonText: "Start Free Trial",
      buttonVariant: "outline" as const,
      className: "bg-white border border-brand-navy/20 shadow-sm",
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
      badgeColor: "bg-brand-gold",
      buttonText: "Choose Monthly",
      className: "bg-brand-navy shadow-lg border-0",
      textColor: "text-gray-200",
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
      badgeColor: "bg-green-500",
      buttonText: "Choose Annual",
      buttonVariant: "gradient" as const,
      className: "bg-white border border-brand-gold/50 shadow-sm",
      savings: "Save $10 annually",
      planId: "annual"
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