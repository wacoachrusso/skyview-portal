import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { MicButton } from "./MicButton";
import { SendButton } from "./SendButton";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSendMessage, isLoading = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const isMobile = useIsMobile();
  const { 
    isListening, 
    transcript, 
    toggleListening, 
    stopListening, 
    setTranscript 
  } = useSpeechRecognition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('ChatInput - Submitting message:', message);
    
    if (!message.trim()) {
      console.log('ChatInput - Empty message, not submitting');
      return;
    }
    
    if (isListening) {
      stopListening();
    }
    
    console.log('ChatInput - Calling onSendMessage with:', message);
    await onSendMessage(message);
    setMessage("");
    setTranscript("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log('ChatInput - Enter key pressed, message:', message);
      if (message.trim() && !isLoading) {
        console.log('ChatInput - Submitting via Enter key');
        handleSubmit(e);
      }
    }
  };

  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
    }
  }, [transcript]);

  return (
    <form onSubmit={handleSubmit} className="p-2 sm:p-4 bg-gradient-to-b from-[#1E1E2E] to-[#1A1F2C] border-t border-white/10">
      <div className="flex flex-col gap-2 max-w-5xl mx-auto">
        <div className="flex gap-2 items-end">
          <Textarea
            value={message}
            onChange={(e) => {
              console.log('ChatInput - Message changed:', e.target.value);
              setMessage(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask SkyGuide"
            className="min-h-[40px] sm:min-h-[50px] text-sm sm:text-base resize-none bg-[#2A2F3C] border-white/10 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20"
            disabled={isLoading}
          />
          {!isMobile && (
            <MicButton 
              isListening={isListening}
              isLoading={isLoading}
              onToggle={toggleListening}
            />
          )}
          <SendButton 
            isLoading={isLoading}
            hasMessage={message.trim().length > 0}
            isMobile={isMobile}
          />
        </div>
        <p className="text-xs text-gray-400 text-center">
          SkyGuide can make mistakes. Check important info.
        </p>
      </div>
    </form>
  );
}