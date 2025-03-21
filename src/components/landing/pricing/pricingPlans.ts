
export const plans = [
  {
    name: "Free Trial",
    price: "Free",
    description: "Perfect for trying out SkyGuide",
    features: [
      "1 contract query",
      "Basic contract interpretation",
      "24/7 assistance",
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
      "Download conversations for offline access",
      "Save important answers for later",
      "Premium features"
    ],
    buttonText: "Get Started",
    gradient: "bg-gradient-to-br from-brand-navy via-brand-navy to-brand-slate",
    isPopular: true,
    priceId: "price_1Qcwb9A8w17QmjsPVkX20dZJ", // Updated to test price ID
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
      "Download conversations for offline access",
      "Save important answers for later",
      "Premium features"
    ],
    buttonText: "Best Value",
    gradient: "bg-gradient-to-br from-brand-gold/20 to-brand-gold/10",
    priceId: "price_1Qcwc1A8w17QmjsPAcTITJvv", // Updated to test price ID
    mode: "subscription"
  }
];
