
import { motion } from "framer-motion";

export function FeaturesHeader() {
  // Header animation variants
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      <motion.h2 
        variants={textVariants}
        className="text-3xl md:text-4xl font-bold text-center text-white mb-4"
      >
        Why Choose SkyGuide?
      </motion.h2>
      <motion.p 
        variants={textVariants}
        className="text-lg text-gray-300 text-center mb-12 max-w-2xl mx-auto"
      >
        Get instant, accurate answers to your contract questions with our advanced contract interpretation technology.
      </motion.p>
    </>
  );
}
