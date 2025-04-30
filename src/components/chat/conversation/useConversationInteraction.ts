
import { useCallback } from "react";

interface UseConversationInteractionProps {
  conversationId: string;
  showCheckbox?: boolean;
  downloadInProgress: boolean;
  onSelect: (conversationId: string) => void;
  onCheckChange?: (checked: boolean) => void;
  isChecked?: boolean;
}

export function useConversationInteraction({
  conversationId,
  showCheckbox,
  downloadInProgress,
  onSelect,
  onCheckChange,
  isChecked
}: UseConversationInteractionProps) {
  
  const handleInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (showCheckbox) {
      onCheckChange?.(!isChecked);
    } else {
      if (!downloadInProgress) {
        onSelect(conversationId);
      }
    }
  }, [conversationId, showCheckbox, downloadInProgress, onSelect, onCheckChange, isChecked]);

  return {
    handleInteraction
  };
}
