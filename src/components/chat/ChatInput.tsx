
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendButton } from "./SendButton";
import { MicButton } from "./MicButton";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  queryCount?: number;
  subscriptionPlan?: string;
  selectedQuestion?: string;
}

export function ChatInput({
  onSendMessage,
  isLoading,
  disabled = false,
  queryCount = 0,
  subscriptionPlan = "free",
  selectedQuestion,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  // Simplified logic to prevent unwanted disabling
  const isInputDisabled = disabled || isLoading;

  // Add debug logging
  useEffect(() => {
    console.log("ChatInput rendering with:", {
      isLoading,
      disabled,
      isInputDisabled,
      message: message.length > 0 ? "Has content" : "Empty"
    });
  }, [isLoading, disabled, isInputDisabled, message]);

  // Handle selectedQuestion changes
  useEffect(() => {
    if (selectedQuestion && !isInputDisabled) {
      setMessage(selectedQuestion);
    }
  }, [selectedQuestion, isInputDisabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    console.log("Submitting message:", message.trim());
    const messageContent = message.trim();
    setMessage(""); // Clear input immediately after submission

    try {
      await onSendMessage(messageContent);
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore the message if there was an error
      setMessage(messageContent);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
            placeholder="Ask about your contract..."
            className="min-h-[60px] w-full pr-[120px] resize-none bg-background/50 focus-visible:ring-1 focus-visible:ring-offset-0"
            disabled={isInputDisabled}
            aria-label="Chat input"
            aria-describedby="chat-input-description"
          />
          <div className="absolute right-2 flex items-center space-x-1 h-full pr-1">
            <MicButton
              onRecognized={setMessage}
              disabled={isInputDisabled}
            />
            <SendButton
              isLoading={isLoading}
              disabled={!message.trim() || isInputDisabled}
            />
          </div>
        </div>
      </form>
      <p
        id="chat-input-description"
        className="text-xs text-muted-foreground/70 text-center mb-2 px-2"
      >
        SkyGuide can make mistakes. Check important info.
      </p>
    </div>
  );
}
