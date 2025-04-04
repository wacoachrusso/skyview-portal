
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

export function Testimonials() {
  // Animation variants
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

  const itemVariants = {
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
    <div className="relative py-20 bg-testimonial-gradient overflow-hidden">
      <div className="absolute inset-0 bg-glow-gradient opacity-30" />
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12"
          variants={containerVariants}
        >
          <motion.h2 
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-center text-white mb-4 tracking-tight"
          >
            What Aviation Professionals Say
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-lg text-gray-300 text-center mb-12 max-w-2xl mx-auto"
          >
            Trusted by pilots and flight attendants across major airlines
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {[
            {
              quote: "SkyGuide has transformed how I manage my schedule and interpret contract rules. It's like having a personal contract expert available 24/7.",
              author: "Capt. Emily Rodriguez",
              role: "Senior Captain, United Airlines",
              years: "15 years of experience"
            },
            {
              quote: "The instant access to contract information has been a game-changer during trips. Having clear interpretations available anywhere has helped me protect my rights as a union member.",
              author: "Michael Torres",
              role: "Flight Attendant, Alaska Airlines",
              years: "6 years of service"
            },
            {
              quote: "The accuracy and quick responses have helped me make informed decisions about my schedule and work-life balance. It's an essential tool for any pilot.",
              author: "First Officer James Mitchell",
              role: "First Officer, American Airlines",
              years: "12 years in aviation"
            }
          ].map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="card-hover hover-lift relative bg-card-gradient border-gray-700 group">
                <div className="absolute inset-0 bg-glow-gradient opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                <CardContent className="relative pt-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-brand-gold text-brand-gold hover-scale" />
                    ))}
                  </div>
                  <div className="mb-6">
                    <p className="font-semibold text-white text-lg tracking-tight">{testimonial.author}</p>
                    <p className="text-sm text-gray-400 font-medium">{testimonial.role}</p>
                  </div>
                  <p className="text-gray-300 mb-6 italic text-lg leading-relaxed font-light">{testimonial.quote}</p>
                  <div className="border-t border-gray-700 pt-4">
                    <p className="text-sm text-brand-gold font-medium">{testimonial.years}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
