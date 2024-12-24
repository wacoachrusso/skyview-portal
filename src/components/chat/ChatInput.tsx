import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    onSendMessage(message);
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-white/5">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="min-h-[50px] resize-none bg-white/10"
      />
      <Button 
        type="submit" 
        size="icon"
        disabled={isLoading || !message.trim()}
        className="bg-brand-navy hover:bg-brand-navy/90"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}