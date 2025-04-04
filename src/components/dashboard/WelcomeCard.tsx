
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export const WelcomeCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-welcome-card border-brand-purple/10 backdrop-blur-sm shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/5 rounded-full -translate-x-1/3 -translate-y-1/2 blur-3xl" />
        <CardContent className="p-8 sm:p-10 relative">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 mb-2">
              <img 
                src="/lovable-uploads/c54bfa73-7d1d-464c-81d8-df88abe9a73a.png" 
                alt="SkyGuide Logo" 
                className="h-full w-auto premium-logo-glow"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight rich-text">
              Welcome to SkyGuide
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Your assistant for understanding your union contract. Ask questions, get instant answers, and stay informed about your rights and benefits.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-brand-gold/80 to-brand-gold/30 rounded-full my-2" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
