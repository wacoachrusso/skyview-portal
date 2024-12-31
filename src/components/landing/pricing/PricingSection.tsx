import { PricingCard } from "./PricingCard";
import { usePlanSelection } from "./usePlanSelection";

export function PricingSection() {
  const { handlePlanSelection, isLoading } = usePlanSelection();

  const pricingPlans = [
    {
      title: "Free Trial",
      price: "0",
      interval: "forever",
      description: "Perfect for trying out our platform with basic features.",
      features: [
        "2 Contract Queries",
        "Basic Features",
        "No Credit Card Required"
      ],
      buttonText: "Start Free Trial",
      variant: "default" as const
    },
    {
      title: "Monthly Plan",
      price: "4.99",
      interval: "month",
      description: "Most popular choice for professionals and teams.",
      features: [
        "Unlimited Queries",
        "All Premium Features",
        "Priority Support"
      ],
      buttonText: "Choose Monthly",
      variant: "featured" as const
    },
    {
      title: "Annual Plan",
      price: "49.99",
      interval: "year",
      description: "Best value for long-term commitment with all features.",
      features: [
        "Everything in Monthly",
        "2 Months Free",
        "Priority Support",
        "Early Access to Features"
      ],
      buttonText: "Choose Annual",
      variant: "premium" as const
    }
  ];

  return (
    <div id="pricing-section" className="py-24 px-4 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent opacity-30" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Choose the plan that best fits your needs. All plans include access to our core features.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 px-4">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.title}
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