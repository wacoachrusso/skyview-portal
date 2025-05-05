import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect, useRef } from "react";
import { MicButton } from "./MicButton";
import { SendButton } from "./SendButton";

interface ChatInputProps {
    onSendMessage: (content: string) => Promise<void>;
    isLoading?: boolean;
    disabled?: boolean;
    queryCount?: number;
    subscriptionPlan?: string;
    selectedQuestion?: string;
}

const ChatInput = ({ 
  onSendMessage, 
  isLoading, 
  queryCount, 
  subscriptionPlan, 
  selectedQuestion,
  disabled 
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const isSubmittingRef = useRef(false);
  
  // Determine if the chat input should be disabled
  const isInputDisabled = disabled || isLoading || (subscriptionPlan === "free" && queryCount >= 20);
  
  // Handle selectedQuestion changes - key issue fixed here
  useEffect(() => {
    // Log to debug
    console.log("Selected question changed:", selectedQuestion);
    
    // Directly check if selectedQuestion has a value
    if (selectedQuestion && selectedQuestion.trim() !== "") {
      setMessage(selectedQuestion);
    }
  }, [selectedQuestion]); // Removed isInputDisabled dependency

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || isInputDisabled || isSubmittingRef.current) return;
    
    const messageContent = message.trim();
    setMessage(""); // Clear input immediately after submission

    // Prevent double submissions
    isSubmittingRef.current = true;
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
        duration: 2000
      });
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 w-full">
      <div className="bg-background/95 backdrop-blur-sm border-t border-border/50 w-full">
        <div className="mx-auto px-4 sm:px-6 w-full">
          <form onSubmit={handleSubmit} className="py-4">
            <div className="relative flex items-center">
              <Textarea 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                onKeyDown={handleKeyDown}
                placeholder={isInputDisabled ? "Chat unavailable while offline or trial ended" : "Ask about your contract..."}
                className="min-h-[60px] w-full pr-[160px] resize-none bg-background/50 focus-visible:ring-1\2 focus-visible::outline-none  border-brand-slate/20 focus-visible:ring-brand-purple/30 transition-all duration-300 rounded-lg"
                disabled={isInputDisabled}
                aria-label="Chat input"
                aria-describedby="chat-input-description"
              />
              <div className="absolute right-2 flex items-center space-x-1 h-full pr-1">
                <MicButton onRecognized={setMessage} disabled={isInputDisabled} />
                <SendButton isLoading={isLoading} disabled={!message.trim() || isInputDisabled} />
              </div>
            </div>
          </form>
          <p id="chat-input-description" className="text-xs text-muted-foreground/70 text-center pb-2">
            SkyGuide can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;