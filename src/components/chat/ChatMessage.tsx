
import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { useState } from "react";

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  onCopy: () => void;
}

export function ChatMessage({ message, isCurrentUser, onCopy }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex w-full gap-2 p-4 rounded-lg",
        isCurrentUser 
          ? "bg-primary/10 ml-auto justify-end" 
          : "bg-muted/50 mr-auto justify-start"
      )}
    >
      <div className="flex flex-col gap-2 max-w-[80%]">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs",
            isCurrentUser ? "text-primary" : "text-foreground"
          )}>
            {isCurrentUser ? "You" : "Assistant"}
          </span>
        </div>
        <p className="text-foreground/90 whitespace-pre-wrap break-words">{message.content}</p>
        <div className="flex justify-end">
          <button 
            onClick={handleCopy}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
