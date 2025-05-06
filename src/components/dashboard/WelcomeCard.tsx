import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useTheme } from "@/components/theme-provider";

interface WelcomeCardProps {
  userName?: string;
}

export const WelcomeCard = ({ userName }: WelcomeCardProps) => {
  const { theme } = useTheme();
  const firstName = userName ? userName.split(" ")[0] : "";

  const cardBg =
    theme === "dark"
      ? "bg-black/10" // subtle dark base
      : "bg-white/70"; // soft white base for light theme

  const textColor = theme === "dark" ? "text-foreground" : "text-gray-900";
  const mutedText = theme === "dark" ? "text-muted-foreground" : "text-gray-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className={`overflow-hidden relative border-transparent shadow-xl ${cardBg}`}>
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 via-brand-purple/5 to-transparent animate-slide opacity-80 z-0" />

        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-pattern opacity-5 z-0" />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 rounded-full -translate-x-1/3 -translate-y-1/2 blur-3xl z-0" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-gold/10 rounded-full translate-x-1/4 translate-y-1/2 blur-3xl z-0" />

        <CardContent className="p-6 sm:p-8 md:p-10 relative z-10">
          <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
            <div className="h-12 sm:h-16 w-auto mb-1 sm:mb-2">
              <img
                src="/lovable-uploads/c54bfa73-7d1d-464c-81d8-df88abe9a73a.png"
                alt="SkyGuide Logo"
                className="h-full w-auto object-contain premium-logo-glow"
              />
            </div>

            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight rich-text ${textColor}`}>
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

            <p className={`text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed ${mutedText}`}>
              Your assistant for understanding your union contract. Ask questions, get instant answers,
              and stay informed about your rights and benefits.
            </p>

            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-brand-gold to-brand-gold/30 rounded-full my-1 sm:my-2" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
