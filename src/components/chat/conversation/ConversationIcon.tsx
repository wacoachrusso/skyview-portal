
import { MessageSquare } from "lucide-react";

interface ConversationIconProps {
  isSelected: boolean;
}

export function ConversationIcon({ isSelected }: ConversationIconProps) {
  return (
    <div 
      className={`p-2 rounded-lg ${
        isSelected 
          ? "bg-brand-gold/20" 
          : "bg-white/5"
      }`}
      aria-hidden="true" // This is decorative and doesn't need to be announced by screen readers
    >
      <MessageSquare 
        className={`h-4 w-4 ${
          isSelected 
            ? "text-brand-gold" 
            : "text-gray-400"
        }`} 
      />
    </div>
  );
}
