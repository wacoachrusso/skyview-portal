
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  details: string;
}

export function FeatureCard({ icon, title, description, details }: FeatureCardProps) {
  return (
    <div className="relative bg-card-gradient p-6 rounded-lg shadow-lg border border-white/10 hover:border-brand-gold/30 transition-all duration-300 group cursor-pointer">
      <div className="absolute inset-0 bg-glow-gradient opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
      <div className="relative">
        <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-300 mb-4">{description}</p>
        <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300 opacity-0 group-hover:opacity-100">
          <p className="text-gray-400 text-sm pt-4 border-t border-white/10">{details}</p>
        </div>
      </div>
    </div>
  );
}
