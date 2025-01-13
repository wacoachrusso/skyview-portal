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
    // Prevent default behavior to avoid any iOS-specific issues
    e.preventDefault();
    e.stopPropagation();
    
    // Add console logs to track interaction flow
    console.log('Conversation interaction triggered:', {
      conversationId: conversation.id,
      type: e.type,
      showCheckbox,
      downloadInProgress
    });
    
    if (showCheckbox) {
      onCheckChange?.(!isChecked);
      return;
    }

    if (!downloadInProgress) {
      // Add small delay for iOS touch feedback
      setTimeout(() => {
        onSelect(conversation.id);
      }, 50);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleInteraction}
      onTouchStart={(e) => {
        // Prevent iOS double-tap zoom
        e.preventDefault();
      }}
      onTouchEnd={handleInteraction}
      className={`group flex items-center px-3 py-3 cursor-pointer transition-all duration-200 hover:bg-white/5 border-l-2 touch-manipulation ${
        isSelected 
          ? "bg-white/10 border-l-brand-gold" 
          : "border-l-transparent hover:border-l-white/20"
      }`}
      style={{
        // Add iOS-specific touch handling improvements
        WebkitTapHighlightColor: 'transparent',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'manipulation'
      }}
    >
      {children}
    </div>
  );
}