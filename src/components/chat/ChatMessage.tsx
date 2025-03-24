
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
  isLastInGroup?: boolean;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isCurrentUser, onCopy, isLastInGroup, isStreaming = false }: ChatMessageProps) {
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
          "flex w-full gap-2 p-1 sm:p-2 group animate-fade-in",
          isCurrentUser ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "flex max-w-[85%] sm:max-w-[80%] flex-col gap-1 rounded-xl px-3 py-2 sm:px-4 sm:py-2 relative shadow-lg transition-all duration-300",
            isCurrentUser
              ? "bg-chat-user-gradient text-white border border-blue-500/10"
              : "bg-chat-ai-gradient text-white border border-white/5",
            isStreaming && "animate-pulse"
          )}
        >
          {/* Message glow effect */}
          {isCurrentUser && (
            <div className="absolute inset-0 -z-10 bg-blue-500/5 rounded-xl blur-md opacity-75" />
          )}
          
          <MessageContent message={message} isCurrentUser={isCurrentUser} />
          
          <div className="flex items-center justify-between gap-2 mt-2">
            <MessageMetadata 
              timestamp={message.created_at} 
              feedback={feedback}
              isStreaming={isStreaming}
            />
            {!isStreaming && (
              <MessageActions
                isCurrentUser={isCurrentUser}
                onThumbsUp={() => handleFeedback(5)}
                onThumbsDown={() => handleFeedback(1)}
                onFlag={handleFlag}
                onCopy={onCopy}
                isSubmittingFeedback={isSubmittingFeedback}
              />
            )}
          </div>
          
          {/* Subtle shine effect on hover */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
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
