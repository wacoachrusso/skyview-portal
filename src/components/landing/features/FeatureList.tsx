
import { FeatureCard } from "./FeatureCard";
import { Award, Rocket, Globe, Clock } from "lucide-react";

export function FeatureList() {
  const features = [
    {
      icon: <Rocket className="w-8 h-8 text-brand-gold" />,
      title: "Instant Answers",
      description: "Get immediate responses to your contract questions, 24/7",
      details: "Our AI processes your queries in real-time, providing accurate interpretations of complex contract clauses instantly."
    },
    {
      icon: <Award className="w-8 h-8 text-brand-gold" />,
      title: "High Accuracy",
      description: "Trained on your specific contract for precise interpretations",
      details: "Our system is trained on airline-specific contracts, ensuring responses are tailored to your exact situation."
    },
    {
      icon: <Globe className="w-8 h-8 text-brand-gold" />,
      title: "Always Available",
      description: "Access from anywhere, on any device, whenever you need it",
      details: "Whether you're at home or on layover, get instant contract clarification from any device."
    },
    {
      icon: <Clock className="w-8 h-8 text-brand-gold" />,
      title: "Time Saving",
      description: "Save hours searching through contract documents",
      details: "Stop spending hours reading through contract pages. Get the answers you need in seconds."
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          details={feature.details}
        />
      ))}
    </div>
  );
}
