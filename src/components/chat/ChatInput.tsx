
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendButton } from "./SendButton";
import { MicButton } from "./MicButton";
import { useToast } from "@/hooks/use-toast";
import { FileText } from "lucide-react";
import { useContractHandler } from "@/hooks/useContractHandler";

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
  disabled,
  queryCount = 0,
  subscriptionPlan = "free",
  selectedQuestion,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const { handleContractClick } = useContractHandler();

  // Determine if the chat input should be disabled
  const isInputDisabled =
    disabled || isLoading || (subscriptionPlan === "free" && queryCount >= 1);

  // Handle selectedQuestion changes
  useEffect(() => {
    if (selectedQuestion && !isInputDisabled) {
      setMessage(selectedQuestion);
    }
  }, [selectedQuestion, isInputDisabled]);

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
    <div className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background z-10">
      <div className="flex items-center justify-between px-4 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8 bg-background/80 hover:bg-background/60"
          onClick={handleContractClick}
        >
          <FileText className="h-3.5 w-3.5 mr-1" />
          View Contract
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="p-4 pt-2">
        <div className="relative flex items-center">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isInputDisabled
                ? "Chat unavailable while offline or trial ended"
                : "Ask about your contract..."
            }
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
        className="text-xs text-muted-foreground/70 text-center pb-2"
      >
        SkyGuide can make mistakes. Check important info.
      </p>
    </div>
  );
}
