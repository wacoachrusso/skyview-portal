import { Conversation } from "@/types/chat";

interface ConversationContainerProps {
  children: React.ReactNode;
  isSelected: boolean;
  conversation: Conversation;
  showCheckbox?: boolean;
  isChecked?: boolean;
  onCheckChange?: (checked: boolean) => void;
  onSelect: (conversationId: string) => void;
  downloadInProgress: boolean;
}

export function ConversationContainer({
  children,
  isSelected,
  conversation,
  showCheckbox,
  isChecked,
  onCheckChange,
  onSelect,
  downloadInProgress
}: ConversationContainerProps) {
  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (showCheckbox) {
      onCheckChange?.(!isChecked);
      return;
    }

    console.log('Conversation interaction:', conversation.id);
    if (!downloadInProgress) {
      onSelect(conversation.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleInteraction}
      onTouchEnd={handleInteraction}
      className={`group flex items-center px-3 py-3 cursor-pointer transition-all duration-200 hover:bg-white/5 border-l-2 touch-manipulation ${
        isSelected 
          ? "bg-white/10 border-l-brand-gold" 
          : "border-l-transparent hover:border-l-white/20"
      }`}
    >
      {children}
    </div>
  );
}