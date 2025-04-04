
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { HelpTooltip } from "@/components/shared/HelpTooltip";

interface WelcomeCardProps {
  userName?: string;
}

export const WelcomeCard = ({ userName }: WelcomeCardProps) => {
  // Get first name from full name
  const firstName = userName ? userName.split(' ')[0] : '';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="overflow-hidden relative border-transparent shadow-xl">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 via-brand-purple/5 to-transparent animate-slide opacity-80 z-0" />
        
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-pattern opacity-5 z-0" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 rounded-full -translate-x-1/3 -translate-y-1/2 blur-3xl z-0" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-gold/10 rounded-full translate-x-1/4 translate-y-1/2 blur-3xl z-0" />
        
        <CardContent className="p-8 sm:p-10 relative z-10">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 mb-2 relative">
              <img 
                src="/lovable-uploads/c54bfa73-7d1d-464c-81d8-df88abe9a73a.png" 
                alt="SkyGuide Logo" 
                className="h-full w-auto object-contain premium-logo-glow"
              />
              <div className="absolute -top-2 -right-2">
                <HelpTooltip 
                  text="Welcome to SkyGuide! This is your personal assistant for all union contract questions."
                  expanded
                  videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
                />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight rich-text">
              {firstName ? (
                <>
                  Welcome back, <span className="text-gradient">{firstName}</span>!
                </>
              ) : (
                <>
                  Welcome to <span className="text-gradient">SkyGuide</span>
                </>
              )}
            </h1>
            
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Your assistant for understanding your union contract. Ask questions, get instant answers, and stay informed about your rights and benefits.
            </p>
            
            <div className="w-24 h-1 bg-gradient-to-r from-brand-gold to-brand-gold/30 rounded-full my-2" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
