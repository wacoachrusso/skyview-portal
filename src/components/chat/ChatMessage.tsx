import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { useState } from "react";
import { MessageContent } from "./message/MessageContent";
import { MessageActions } from "./message/MessageActions";
import { MessageMetadata } from "./message/MessageMetadata";
import { useFeedbackHandling } from "./message/useFeedbackHandling";
import { FlagFeedbackDialog } from "./FlagFeedbackDialog";

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  onCopy: () => void;
}

export function ChatMessage({ message, isCurrentUser, onCopy }: ChatMessageProps) {
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
      <div
        className={cn(
          "flex w-full gap-2 p-1 sm:p-2 group",
          isCurrentUser ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "flex max-w-[85%] sm:max-w-[80%] flex-col gap-1 rounded-lg px-3 py-2 sm:px-4 sm:py-2 relative",
            isCurrentUser
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
              : "bg-gradient-to-r from-[#2A2F3C] to-[#1E1E2E] text-white shadow-md"
          )}
        >
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
        </div>
      </div>
      <FlagFeedbackDialog
        isOpen={isFlagDialogOpen}
        onClose={() => setIsFlagDialogOpen(false)}
        onSubmit={handleFlagSubmit}
      />
    </>
  );
}