import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendButton } from "./SendButton";
import { MicButton } from "./MicButton";

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || disabled) return;

    const messageContent = message.trim();
    setMessage(""); // Clear input immediately after submission
    
    try {
      console.log('Submitting message:', messageContent);
      await onSendMessage(messageContent);
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore the message if there was an error
      setMessage(messageContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col">
      <form onSubmit={handleSubmit} className="p-4 border-t border-border/50">
        <div className="relative flex items-center">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Chat unavailable while offline" : "Ask about your contract..."}
            className="min-h-[60px] w-full pr-[120px] resize-none bg-background/50 focus-visible:ring-1 focus-visible:ring-offset-0"
            disabled={isLoading || disabled}
          />
          <div className="absolute right-2 flex items-center space-x-1 h-full pr-1">
            <MicButton 
              onRecognized={setMessage} 
              disabled={isLoading || disabled}
            />
            <SendButton 
              isLoading={isLoading} 
              disabled={!message.trim() || disabled}
            />
          </div>
        </div>
      </form>
      <p className="text-xs text-muted-foreground/70 text-center mb-2 px-2">
        SkyGuide can make mistakes. Check important info.
      </p>
    </div>
  );
}