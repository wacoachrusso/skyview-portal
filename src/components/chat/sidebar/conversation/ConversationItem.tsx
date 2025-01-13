import { useState } from "react";
import { Conversation } from "@/types/chat";
import { Checkbox } from "@/components/ui/checkbox";
import { DownloadDialog } from "../DownloadDialog";
import { useDownloadChat } from "@/hooks/useDownloadChat";
import { ConversationMetadata } from "./ConversationMetadata";
import { ConversationIcon } from "./ConversationIcon";
import { ConversationTitle } from "./ConversationTitle";
import { ConversationContainer } from "./ConversationContainer";

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
  onCheckChange
}: ConversationItemProps) {
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const { downloadChat, downloadInProgress } = useDownloadChat();

  const handleDownloadConfirmed = async () => {
    console.log('Download confirmed, starting download process');
    setShowPermissionDialog(false);
    
    try {
      const success = await downloadChat(conversation.id, conversation.title);
      console.log('Download result:', success);
      
      if (success) {
        console.log('Download successful, updating offline status');
        const mockEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        }) as unknown as React.MouseEvent;
        onToggleOffline(mockEvent, conversation.id);
      }
    } catch (error) {
      console.error('Error during download:', error);
    }
  };

  return (
    <>
      <ConversationContainer
        isSelected={isSelected}
        conversation={conversation}
        showCheckbox={showCheckbox}
        isChecked={isChecked}
        onCheckChange={onCheckChange}
        onSelect={onSelect}
        downloadInProgress={downloadInProgress}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {showCheckbox && (
            <Checkbox
              checked={isChecked}
              onCheckedChange={(checked) => 
                onCheckChange?.(checked as boolean)
              }
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
              onToggleOffline={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowPermissionDialog(true);
              }}
            />
          </div>
        </div>
      </ConversationContainer>

      <DownloadDialog
        open={showPermissionDialog}
        onOpenChange={setShowPermissionDialog}
        onConfirm={handleDownloadConfirmed}
      />
    </>
  );
}