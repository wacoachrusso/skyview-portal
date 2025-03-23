
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SectionContainerProps {
  title: string;
  subtitle: string;
  className?: string;
  children: ReactNode;
}

export function SectionContainer({ title, subtitle, className, children }: SectionContainerProps) {
  return (
    <div className={`relative py-20 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-glow-gradient opacity-30" />
      <div className="container mx-auto px-4 relative">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
          {title}
        </h2>
        <p className="text-lg text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          {subtitle}
        </p>
        {children}
      </div>
    </div>
  );
}

export const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

export function AnimatedSection({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={sectionVariants}
    >
      {children}
    </motion.div>
  );
}
