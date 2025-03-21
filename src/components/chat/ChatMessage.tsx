
import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { useState } from "react";
import { MessageContent } from "./message/MessageContent";
import { MessageActions } from "./message/MessageActions";
import { MessageMetadata } from "./message/MessageMetadata";
import { useFeedbackHandling } from "./message/useFeedbackHandling";
import { FlagFeedbackDialog } from "./FlagFeedbackDialog";
import { MessageContainer } from "./message/MessageContainer";
import { MessageWrapper } from "./message/MessageWrapper";

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  onCopy: () => void;
  isLastInGroup?: boolean;
}

export function ChatMessage({ message, isCurrentUser, onCopy, isLastInGroup }: ChatMessageProps) {
  const [isFlagDialogOpen, setIsFlagDialogOpen] = useState(false);
  const { isSubmittingFeedback, feedback, handleFeedback } = useFeedbackHandling(message.id, isCurrentUser);

  const handleFlag = () => {
    setIsFlagDialogOpen(true);
  };

  const handleFlagSubmit = (feedbackText: string) => {
    handleFeedback(1, true, feedbackText);
    setIsFlagDialogOpen(false);
  };

  return (
    <>
      <MessageWrapper isCurrentUser={isCurrentUser}>
        <MessageContainer isCurrentUser={isCurrentUser}>
          <MessageContent message={message} isCurrentUser={isCurrentUser} />
          
          <div className="flex items-center justify-between gap-2 mt-2">
            <MessageMetadata timestamp={message.created_at} feedback={feedback} />
            <MessageActions
              isCurrentUser={isCurrentUser}
              onThumbsUp={() => handleFeedback(5)}
              onThumbsDown={() => handleFeedback(1)}
              onFlag={handleFlag}
              onCopy={onCopy}
              isSubmittingFeedback={isSubmittingFeedback}
            />
          </div>
        </MessageContainer>
      </MessageWrapper>

      <FlagFeedbackDialog
        isOpen={isFlagDialogOpen}
        onClose={() => setIsFlagDialogOpen(false)}
        onSubmit={handleFlagSubmit}
      />
    </>
  );
}
