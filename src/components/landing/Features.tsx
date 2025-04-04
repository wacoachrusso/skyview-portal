
import { motion } from "framer-motion";
import { FeatureCard } from "./features/FeatureCard";
import { FeaturesHeader } from "./features/FeaturesHeader";
import { featuresData } from "./features/featuresData";

export function Features() {
  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  return (
    <div className="relative py-20 bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden">
      <div className="absolute inset-0 bg-glow-gradient opacity-20" />
      <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-brand-gold/5 rounded-full filter blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
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
        </motion.div>
      </div>
    </div>
  );
}
