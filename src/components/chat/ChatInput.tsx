
import { useState } from "react";
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
}

export function ChatInput({
  onSendMessage,
  isLoading,
  disabled,
  queryCount = 0,
  subscriptionPlan = "free",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  // Determine if the chat input should be disabled
  const isInputDisabled =
    disabled || isLoading || (subscriptionPlan === "free" && queryCount >= 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || isInputDisabled) return;

    const messageContent = message.trim();
    setMessage(""); // Clear input immediately after submission

    try {
      console.log("Submitting message:", messageContent);
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
      <div className="p-4 border-t border-border/50">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative flex flex-col space-y-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isInputDisabled
                  ? "Chat unavailable while offline or trial ended"
                  : "Ask about your contract..."
              }
              className="min-h-[80px] w-full resize-none bg-background/50 focus-visible:ring-1 focus-visible:ring-offset-0 pr-12"
              disabled={isInputDisabled}
              aria-label="Chat input"
              aria-describedby="chat-input-description"
            />
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
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
      </div>
      <div className="w-full px-4 pb-6 pt-2">
        <div className="w-full mx-auto max-w-3xl">
          <p
            id="chat-input-description"
            className="text-xs text-muted-foreground/70 text-center"
          >
            Ask about your contract...
          </p>
        </div>
      </div>
    </div>
  );
}
