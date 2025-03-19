
import { Button } from "@/components/ui/button";
import { SparklesIcon } from "lucide-react";

export function WelcomeMessage() {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full premium-card p-8 sm:p-10 glass-morphism animate-fade-in">
        {/* Logo and sparkle effects */}
        <div className="relative mb-6">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple/20 to-brand-gold/20 rounded-full blur-xl opacity-75 animate-pulse-subtle" aria-hidden="true" />
          <div className="relative flex justify-center">
            <img
              src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png"
              alt="SkyGuide Logo"
              className="h-20 w-auto animate-float"
            />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4 text-center">
          Welcome to <span className="text-gradient">SkyGuide</span>
        </h1>
        
        <p className="text-gray-300 text-center mb-8 leading-relaxed">
          I'm your contract interpretation assistant. Ask me anything about your union contract, and I'll provide accurate, relevant information to help you understand your rights and benefits.
        </p>
        
        <div className="space-y-6">
          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10">
            <div className="flex gap-3 items-start">
              <div className="bg-brand-gold/20 p-2 rounded-lg">
                <SparklesIcon className="h-5 w-5 text-brand-gold" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white mb-1">Try asking me:</h3>
                <p className="text-gray-300 text-sm">
                  "What are my rest requirements between flights?"
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10">
            <div className="flex gap-3 items-start">
              <div className="bg-brand-purple/20 p-2 rounded-lg">
                <SparklesIcon className="h-5 w-5 text-brand-purple" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white mb-1">Or ask about:</h3>
                <p className="text-gray-300 text-sm">
                  "How much vacation time am I entitled to based on my seniority?"
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10">
            <div className="flex gap-3 items-start">
              <div className="bg-brand-teal/20 p-2 rounded-lg">
                <SparklesIcon className="h-5 w-5 text-brand-teal" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white mb-1">You can also ask:</h3>
                <p className="text-gray-300 text-sm">
                  "What are the pay provisions for working on a holiday?"
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 mb-2">
            Type your question below to get started
          </p>
          <Button
            className="premium-button bg-gradient-to-r from-brand-gold/90 to-brand-amber/90 text-brand-navy font-semibold shadow-gold hover:shadow-gold-hover transition-all duration-300 hover:from-brand-gold hover:to-brand-amber"
          >
            Ask Your First Question
          </Button>
        </div>
      </div>
    </div>
  );
}
