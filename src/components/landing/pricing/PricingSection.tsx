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
      badgeColor: "bg-emerald-500",
      buttonText: "Start Free Trial",
      buttonVariant: "outline" as const,
      className: "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
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
      badgeColor: "bg-gradient-to-r from-emerald-500 to-teal-500",
      buttonText: "Choose Monthly",
      className: "bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 border-emerald-200 dark:border-emerald-800",
      textColor: "text-gray-700 dark:text-gray-300",
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
      badgeColor: "bg-gradient-to-r from-emerald-600 to-teal-600",
      buttonText: "Choose Annual",
      buttonVariant: "gradient" as const,
      className: "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
      savings: "Save $10 annually",
      planId: "annual"
    }
  ];

  return (
    <div id="pricing-section" className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-100/20 via-transparent to-transparent dark:from-emerald-500/5 -z-10" />
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
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