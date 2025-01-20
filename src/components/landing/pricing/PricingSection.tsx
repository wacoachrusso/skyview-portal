import { CreativePricing } from "@/components/ui/creative-pricing";
import type { PricingTier } from "@/components/ui/creative-pricing";
import { Pencil, Star, Sparkles } from "lucide-react";

export function PricingSection() {
  const creativeTiers: PricingTier[] = [
    {
      name: "Free Trial",
      icon: <Pencil className="w-6 h-6" />,
      price: "Free",
      description: "Perfect for trying out SkyGuide",
      color: "amber",
      features: [
        "1 contract query",
        "Basic contract interpretation",
        "24/7 assistance",
        "Mobile app access"
      ],
      priceId: null,
      mode: null
    },
    {
      name: "Monthly",
      icon: <Star className="w-6 h-6" />,
      price: "$4.99",
      description: "Most popular for active flight crew",
      color: "blue",
      features: [
        "Unlimited contract queries",
        "Advanced interpretation",
        "Priority support",
        "Save answers for offline access",
        "Download conversations for offline viewing",
        "Premium features"
      ],
      popular: true,
      priceId: "price_1QcfWYA8w17QmjsPZ22koqjj",
      mode: "subscription" as const
    },
    {
      name: "Annual",
      icon: <Sparkles className="w-6 h-6" />,
      price: "$49.88",
      description: "Best value - Save $10 annually",
      color: "purple",
      features: [
        "Unlimited contract queries",
        "Advanced interpretation",
        "Priority support",
        "Save answers for offline access",
        "Download conversations for offline viewing",
        "Premium features"
      ],
      priceId: "price_1QcfUFA8w17QmjsPe9KXKFpT",
      mode: "subscription" as const
    }
  ];

  return (
    <section id="pricing-section" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient opacity-50" />
      <div className="absolute inset-0 bg-glow-gradient opacity-30" />
      <div className="container mx-auto px-4 relative">
        <CreativePricing 
          tiers={creativeTiers}
          tag="Simple, Transparent Pricing"
          title="Choose Your Plan"
          description="Choose the perfect plan for your needs. All plans include our core features. No hidden costs."
          paymentMethods="We accept all major credit cards, Apple Pay, Google Pay, and Amazon Pay"
        />
      </div>
    </section>
  );
}