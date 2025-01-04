import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { SendButton } from "./SendButton";
import { MicButton } from "./MicButton";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, isLoading, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    hasRecognitionSupport 
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setMessage(prev => prev + transcript);
    }
  }, [transcript]);

  const handleSubmit = async () => {
    if (message.trim() && !isLoading && !disabled) {
      await onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-t">
      <div className="relative flex items-center max-w-4xl mx-auto">
        <Textarea
          ref={textareaRef}
          placeholder={disabled ? "Chat not available offline" : "Ask a question about your contract..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          className="min-h-[44px] w-full resize-none bg-background px-4 py-2.5 focus:outline-none focus:ring-0 focus:ring-offset-0"
          disabled={disabled}
        />
        <div className="absolute right-0 flex items-center gap-2 pr-2">
          {hasRecognitionSupport && (
            <MicButton
              isListening={isListening}
              onStart={startListening}
              onStop={stopListening}
              disabled={isLoading || disabled}
            />
          )}
          <SendButton 
            onClick={handleSubmit} 
            disabled={!message.trim() || isLoading || disabled} 
          />
        </div>
      </div>
    </div>
  );
}