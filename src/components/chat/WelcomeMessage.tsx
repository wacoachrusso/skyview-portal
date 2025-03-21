
import { Button } from "@/components/ui/button";
import { Sparkles, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMemo } from "react";
import { useContractHandler } from "@/hooks/useContractHandler";

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

// Helper function to get random unique items from an array
const getRandomUniqueItems = (array: string[], count: number): string[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

interface WelcomeMessageProps {
  onSelectQuestion?: (question: string) => void;
}

export function WelcomeMessage({ onSelectQuestion }: WelcomeMessageProps) {
  const isMobile = useIsMobile();
  const { handleContractClick } = useContractHandler();
  
  // Select random questions from the pool
  // Using useMemo to ensure questions only change on component mount
  const randomQuestions = useMemo(() => 
    getRandomUniqueItems(EXAMPLE_QUESTIONS, isMobile ? 2 : 3), 
    [isMobile]
  );
  
  return (
    <div className="h-full flex flex-col items-center justify-center px-2 py-2 overflow-y-auto">
      <div className="max-w-3xl w-full rounded-2xl p-3 sm:p-5 md:p-6 shadow-xl bg-gradient-to-br from-[#1A2035] to-[#2A304A] border border-white/10 animate-fade-in">
        <div className="flex flex-col items-center">
          {/* Logo and header */}
          <div className="mb-2 md:mb-3 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple/20 to-brand-gold/20 rounded-full blur-xl opacity-75 animate-pulse-subtle" aria-hidden="true" />
            <img
              src="/lovable-uploads/030a54cc-8003-4358-99f1-47f47313de93.png"
              alt="SkyGuide Logo"
              className="h-8 md:h-12 w-auto relative animate-float"
            />
          </div>
          
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 text-center">
            Welcome to <span className="text-gradient">SkyGuide</span>
          </h1>
          
          <p className="text-xs sm:text-sm text-gray-300 text-center mb-3 max-w-2xl leading-relaxed">
            I'm your contract interpretation assistant. Ask me anything about your union contract, and I'll provide accurate, relevant information to help you understand your rights and benefits.
          </p>
          
          {/* Example cards */}
          <div className={`grid w-full gap-3 mb-4 grid-cols-1 ${isMobile ? "grid-cols-1" : "sm:grid-cols-2 md:grid-cols-3"}`}>
            <ExampleCard 
              icon={<Sparkles className="h-4 w-4 text-brand-gold" />}
              title="Try asking me:"
              question={randomQuestions[0]}
              color="brand-gold"
              onClick={onSelectQuestion}
            />
            
            <ExampleCard 
              icon={<Sparkles className="h-4 w-4 text-brand-purple" />}
              title="Or ask about:"
              question={randomQuestions[1]}
              color="brand-purple"
              onClick={onSelectQuestion}
            />
            
            {!isMobile && (
              <ExampleCard 
                icon={<Sparkles className="h-4 w-4 text-brand-teal" />}
                title="You can also ask:"
                question={randomQuestions[2]}
                color="brand-teal"
                onClick={onSelectQuestion}
              />
            )}
          </div>
          
          {/* View Contract Button - Replaced Dashboard button */}
          <div className="w-full text-center">
            <div className="flex justify-center items-center">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
                onClick={(e) => handleContractClick(e)}
              >
                <FileText className="mr-2 h-4 w-4" />
                View Contract
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
  onClick?: (question: string) => void;
}

function ExampleCard({ icon, title, question, color, className = "", onClick }: ExampleCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(question);
    }
  };

  return (
    <div 
      className={`bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
    >
      <div className="flex gap-2 items-start">
        <div className={`bg-${color}/20 p-1.5 rounded-lg`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-white text-xs mb-1">{title}</h3>
          <p className="text-gray-300 text-xs">
            "{question}"
          </p>
        </div>
      </div>
    </div>
  );
}
