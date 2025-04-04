
import { motion } from "framer-motion";
import { FeatureCard } from "./features/FeatureCard";
import { FeaturesHeader } from "./features/FeaturesHeader";
import { featuresData } from "./features/featuresData";

export function Features() {
  return (
    <div className="relative py-20 bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden">
      <div className="absolute inset-0 bg-glow-gradient opacity-20" />
      <div className="container mx-auto px-4 relative">
        <FeaturesHeader />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuresData.map((feature, index) => (
            <FeatureCard 
              key={index}
              iconSvg={feature.iconSvg}
              title={feature.title}
              description={feature.description}
              details={feature.details}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
