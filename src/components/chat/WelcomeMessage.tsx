
import { Button } from "@/components/ui/button";
import { SparklesIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function WelcomeMessage() {
  const isMobile = useIsMobile();
  
  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-8 md:py-12">
      <div className="max-w-2xl w-full premium-card p-6 sm:p-8 md:p-10 glass-morphism animate-fade-in">
        {/* Logo and sparkle effects */}
        <div className="relative mb-4 md:mb-6">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple/20 to-brand-gold/20 rounded-full blur-xl opacity-75 animate-pulse-subtle" aria-hidden="true" />
          <div className="relative flex justify-center">
            <img
              src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png"
              alt="SkyGuide Logo"
              className="h-14 sm:h-16 md:h-20 w-auto animate-float"
            />
          </div>
        </div>
        
        <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4 text-center">
          Welcome to <span className="text-gradient">SkyGuide</span>
        </h1>
        
        <p className="text-sm sm:text-base text-gray-300 text-center mb-6 md:mb-8 leading-relaxed">
          I'm your contract interpretation assistant. Ask me anything about your union contract, and I'll provide accurate, relevant information to help you understand your rights and benefits.
        </p>
        
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'sm:grid-cols-2 md:grid-cols-3 gap-4'}`}>
          <div className="bg-white/5 rounded-xl p-3 sm:p-4 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10">
            <div className="flex gap-2 sm:gap-3 items-start">
              <div className="bg-brand-gold/20 p-1.5 sm:p-2 rounded-lg">
                <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-brand-gold" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white text-sm sm:text-base mb-0.5 sm:mb-1">Try asking me:</h3>
                <p className="text-gray-300 text-xs sm:text-sm">
                  "What are my rest requirements between flights?"
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-3 sm:p-4 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10">
            <div className="flex gap-2 sm:gap-3 items-start">
              <div className="bg-brand-purple/20 p-1.5 sm:p-2 rounded-lg">
                <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-brand-purple" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white text-sm sm:text-base mb-0.5 sm:mb-1">Or ask about:</h3>
                <p className="text-gray-300 text-xs sm:text-sm">
                  "How much vacation time am I entitled to?"
                </p>
              </div>
            </div>
          </div>
          
          <div className={`bg-white/5 rounded-xl p-3 sm:p-4 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10 ${isMobile ? '' : 'sm:col-span-2 md:col-span-1'}`}>
            <div className="flex gap-2 sm:gap-3 items-start">
              <div className="bg-brand-teal/20 p-1.5 sm:p-2 rounded-lg">
                <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-brand-teal" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white text-sm sm:text-base mb-0.5 sm:mb-1">You can also ask:</h3>
                <p className="text-gray-300 text-xs sm:text-sm">
                  "What are the pay provisions for working on a holiday?"
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-400 mb-2">
            Type your question below to get started
          </p>
          <Button
            className="premium-button text-sm sm:text-base py-1.5 sm:py-2 px-3 sm:px-4 bg-gradient-to-r from-brand-gold/90 to-brand-amber/90 text-brand-navy font-semibold shadow-gold hover:shadow-gold-hover transition-all duration-300 hover:from-brand-gold hover:to-brand-amber"
          >
            Ask Your First Question
          </Button>
        </div>
      </div>
    </div>
  );
}
