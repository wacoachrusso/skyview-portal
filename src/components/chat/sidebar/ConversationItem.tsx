import { useState } from "react";
import { Conversation } from "@/types/chat";
import { Checkbox } from "@/components/ui/checkbox";
import { DownloadDialog } from "./DownloadDialog";
import { useDownloadChat } from "@/hooks/useDownloadChat";
import { ConversationMetadata } from "./conversation/ConversationMetadata";
import { ConversationIcon } from "./conversation/ConversationIcon";
import { ConversationTitle } from "./conversation/ConversationTitle";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  isOffline: boolean;
  onSelect: (conversationId: string) => void;
  onDelete: (e: React.MouseEvent | React.TouchEvent, conversationId: string) => void;
  onToggleOffline: (e: React.MouseEvent | React.TouchEvent, conversationId: string) => void;
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
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const { downloadChat, downloadInProgress } = useDownloadChat();

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (showCheckbox) {
      onCheckChange?.(!isChecked);
    } else {
      if (!downloadInProgress) {
        onSelect(conversation.id);
      }
    }
  };

  const handleToggleOffline = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOffline) {
      onToggleOffline(e, conversation.id);
      return;
    }

    setShowPermissionDialog(true);
  };

  const handleDownloadConfirmed = async () => {
    setShowPermissionDialog(false);

    try {
      const success = await downloadChat(conversation.id, conversation.title);
      if (success) {
        const mockEvent = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        }) as unknown as React.MouseEvent;
        onToggleOffline(mockEvent, conversation.id);
      }
    } catch (error) {
      console.error("Error during download:", error);
    }
  };

  return (
    <>
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

      <DownloadDialog
        open={showPermissionDialog}
        onOpenChange={setShowPermissionDialog}
        onConfirm={handleDownloadConfirmed}
      />
    </>
  );
}