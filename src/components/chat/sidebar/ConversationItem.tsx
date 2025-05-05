import { useState } from "react";
import { Conversation } from "@/types/chat";
import { Checkbox } from "@/components/ui/checkbox";
import { ConversationMetadata } from "../conversation/ConversationMetadata";
import { ConversationIcon } from "../conversation/ConversationIcon";
import { ConversationTitle } from "../conversation/ConversationTitle";
import { DownloadHandler } from "../conversation/DownloadHandler";
import { useConversationInteraction } from "../conversation/useConversationInteraction";
import { useTheme } from "@/components/theme-provider";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  isOffline: boolean;
  onSelect: (conversationId: string) => void;
  onDelete: (
    e: React.MouseEvent | React.TouchEvent,
    conversationId: string
  ) => void;
  onToggleOffline: (
    e: React.MouseEvent | React.TouchEvent,
    conversationId: string
  ) => void;
  showCheckbox?: boolean;
  isChecked?: boolean;
  onCheckChange?: (checked: boolean) => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  isOffline,
  onSelect,
  onDelete,
  onToggleOffline,
  showCheckbox,
  isChecked,
  onCheckChange,
}: ConversationItemProps) {
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const { theme } = useTheme();
  // Custom hook for handling conversation interaction
  const { handleInteraction } = useConversationInteraction({
    conversationId: conversation.id,
    showCheckbox,
    downloadInProgress,
    onSelect,
    onCheckChange,
    isChecked,
  });

  const handleToggleOffline = async (
    e: React.MouseEvent | React.TouchEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // If already offline, just toggle it off
    if (isOffline) {
      onToggleOffline(e, conversation.id);
      return;
    }

    // Access the DownloadHandler element to trigger the dialog
    const handler = document.querySelector(
      `[data-testid="download-handler-${conversation.id}"]`
    );
    if (handler) {
      // Update the download in progress state from the handler
      setDownloadInProgress(
        handler.getAttribute("data-download-in-progress") === "true"
      );
      // Trigger the dialog
      (handler as HTMLElement).click();
    }
  };

  const handleDownloadComplete = (success: boolean) => {
    if (success) {
      const mockEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      }) as unknown as React.MouseEvent;
      onToggleOffline(mockEvent, conversation.id);
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleInteraction}
        onTouchEnd={handleInteraction}
        className={`group flex items-center px-3 py-3 cursor-pointer transition-all duration-200 touch-manipulation border-l-2 ${
          isSelected
            ? theme === "dark"
              ? "bg-white/10 border-l-brand-gold"
              : "bg-gray-200 border-l-brand-gold"
            : theme === "dark"
            ? "hover:bg-white/5 border-l-transparent hover:border-l-white/20"
            : "bg-gray-100 hover:bg-gray-200 border-l-transparent hover:border-l-gray-300"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {showCheckbox && (
            <Checkbox
              checked={isChecked}
              onCheckedChange={(checked) => onCheckChange?.(checked as boolean)}
              onClick={(e) => e.stopPropagation()}
              className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
            />
          )}
          <ConversationIcon isSelected={isSelected} />
          <div className="flex flex-col min-w-0 flex-1">
            <ConversationTitle title={conversation.title} />
            <ConversationMetadata
              lastMessageAt={conversation.last_message_at}
              downloadedAt={conversation.downloaded_at}
              isOffline={isOffline}
              downloadInProgress={downloadInProgress}
              onDelete={(e) => onDelete(e, conversation.id)}
              onToggleOffline={handleToggleOffline}
            />
          </div>
        </div>
      </div>

      <DownloadHandler
        conversationId={conversation.id}
        title={conversation.title}
        onDownloadComplete={handleDownloadComplete}
      />
    </>
  );
}
