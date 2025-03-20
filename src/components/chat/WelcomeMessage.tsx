
import { Button } from "@/components/ui/button";
import { MessageSquareText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";

// Define a pool of example questions
const EXAMPLE_QUESTIONS = [
  // Rest requirements
  "What are my rest requirements between flights?",
  "How many hours of rest am I entitled to after a red-eye flight?",
  "What are the minimum rest periods for international flights?",
  "Can my rest period be reduced for operational reasons?",
  
  // Pay and compensation
  "How much vacation time am I entitled to?",
  "What are the pay provisions for working on a holiday?",
  "How is overtime calculated for flight attendants?",
  "What is the per diem rate for overnight stays?",
  "How are sick days compensated?",
  
  // Schedule and assignments
  "How far in advance should my monthly schedule be published?",
  "What are the rules for voluntary trip trades?",
  "How many consecutive days can I be scheduled to work?",
  "What are my rights if my flight is canceled?",
  
  // Benefits and accommodations
  "What hotel accommodations am I entitled to during layovers?",
  "What are the uniform allowance provisions?",
  "What are my health insurance benefits?",
  "How does maternity/paternity leave work?",
  
  // Training and qualifications
  "How often do I need to renew my safety training?",
  "Is training time compensated, and at what rate?",
  "What are the qualification requirements for international flights?",
];

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
