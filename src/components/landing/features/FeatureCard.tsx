
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FeatureCardProps {
  iconSvg: ReactNode;
  title: string;
  description: string;
  details: string;
  index: number;
}

export function FeatureCard({ iconSvg, title, description, details, index }: FeatureCardProps) {
  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      variants={cardVariants}
      whileHover={{ 
        y: -5,
        boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4), 0 8px 10px -6px rgba(59, 130, 246, 0.2)"
      }}
      className="relative bg-gradient-to-b from-slate-800/80 to-slate-900/90 p-6 rounded-lg shadow-lg border border-white/5 hover-lift-premium hover:border-white/10 transition-all duration-300 group"
    >
      <div className="absolute inset-0 bg-glow-gradient opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg" />
      <div className="relative">
        <div className="flex justify-center mb-6 transform transition-transform duration-300">
          {iconSvg}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2 text-center">{title}</h3>
        <p className="text-gray-300 mb-4 text-center">{description}</p>
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          whileHover={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <p className="text-gray-400 text-sm pt-4 border-t border-white/10 text-center">{details}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
