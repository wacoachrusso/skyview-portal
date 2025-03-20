
import { Button } from "@/components/ui/button";
import { MessageSquareText, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";

export function WelcomeMessage() {
  const isMobile = useIsMobile();
  
  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-8 md:py-12">
      <div className="max-w-3xl w-full rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl bg-gradient-to-br from-[#1A2035] to-[#2A304A] border border-white/10 animate-fade-in">
        <div className="flex flex-col items-center">
          {/* Logo and header */}
          <div className="mb-6 md:mb-8 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple/20 to-brand-gold/20 rounded-full blur-xl opacity-75 animate-pulse-subtle" aria-hidden="true" />
            <img
              src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png"
              alt="SkyGuide Logo"
              className="h-16 md:h-20 w-auto relative animate-float"
            />
          </div>
          
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4 text-center">
            Welcome to <span className="text-gradient">SkyGuide</span>
          </h1>
          
          <p className="text-sm sm:text-base text-gray-300 text-center mb-6 md:mb-8 max-w-2xl leading-relaxed">
            I'm your contract interpretation assistant. Ask me anything about your union contract, and I'll provide accurate, relevant information to help you understand your rights and benefits.
          </p>
          
          {/* Example cards */}
          <div className="grid w-full gap-4 mb-6 md:mb-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <ExampleCard 
              icon={<Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-brand-gold" />}
              title="Try asking me:"
              question="What are my rest requirements between flights?"
              color="brand-gold"
            />
            
            <ExampleCard 
              icon={<Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-brand-purple" />}
              title="Or ask about:"
              question="How much vacation time am I entitled to?"
              color="brand-purple"
            />
            
            <ExampleCard 
              icon={<Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-brand-teal" />}
              title="You can also ask:"
              question="What are the pay provisions for working on a holiday?"
              color="brand-teal"
              className={isMobile ? "" : ""}
            />
          </div>
          
          {/* CTA Section */}
          <div className="w-full text-center">
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button
                size="sm"
                className="premium-button py-2 px-4 bg-gradient-to-r from-brand-gold/90 to-brand-amber/90 text-brand-navy font-semibold shadow-gold hover:shadow-gold-hover transition-all duration-300 hover:from-brand-gold hover:to-brand-amber w-full sm:w-auto"
              >
                <MessageSquareText className="mr-2 h-4 w-4" />
                Start Asking Questions
              </Button>
              
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-white/20 text-white/80 hover:bg-white/10 hover:text-white w-full sm:w-auto"
              >
                <Link to="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for example cards
interface ExampleCardProps {
  icon: React.ReactNode;
  title: string;
  question: string;
  color: string;
  className?: string;
}

function ExampleCard({ icon, title, question, color, className = "" }: ExampleCardProps) {
  return (
    <div className={`bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10 ${className}`}>
      <div className="flex gap-3 items-start">
        <div className={`bg-${color}/20 p-2 rounded-lg`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-white text-sm mb-1.5">{title}</h3>
          <p className="text-gray-300 text-xs sm:text-sm">
            "{question}"
          </p>
        </div>
      </div>
    </div>
  );
}
