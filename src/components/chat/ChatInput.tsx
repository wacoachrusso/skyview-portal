import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Send } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('ChatInput - Submitting message:', message);
    if (!message.trim()) {
      console.log('ChatInput - Empty message, not submitting');
      return;
    }
    
    console.log('ChatInput - Calling onSendMessage with:', message);
    onSendMessage(message);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log('ChatInput - Enter key pressed, message:', message);
      if (message.trim() && !isLoading) {
        console.log('ChatInput - Submitting via Enter key');
        handleSubmit(e);
      } else {
        console.log('ChatInput - Not submitting: empty message or loading', { 
          messageEmpty: !message.trim(), 
          isLoading 
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-[#151821] border-t border-white/10">
      <div className="flex gap-2 items-end max-w-5xl mx-auto">
        <Textarea
          value={message}
          onChange={(e) => {
            console.log('ChatInput - Message changed:', e.target.value);
            setMessage(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Message SkyGuide..."
          className="min-h-[50px] resize-none bg-white/5 border-white/10 text-white placeholder:text-gray-400"
          disabled={isLoading}
        />
        <Button 
          type="button"
          size="icon"
          variant="ghost"
          className="text-white hover:bg-white/10"
          disabled={isLoading}
        >
          <Mic className="h-5 w-5" />
        </Button>
        <Button 
          type="submit" 
          size="icon"
          disabled={isLoading || !message.trim()}
          className="bg-[#2563EB] hover:bg-[#2563EB]/90 text-white"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}