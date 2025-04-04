
import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hello! How can I help you with your union contract today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    // Simulate AI response after a short delay
    setTimeout(() => {
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: "I can only answer questions directly related to your union contract terms. For specific details, please refer to your contract documentation or contact your union representative.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat toggle button */}
      <Button
        onClick={toggleChat}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg premium-button", 
          isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
        )}
        aria-label={isOpen ? "Close support chat" : "Open support chat"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </Button>

      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-96 bg-card rounded-lg shadow-xl flex flex-col overflow-hidden border border-white/10 animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 bg-brand-gold text-brand-navy font-semibold flex items-center justify-between">
            <span>Contract Support</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleChat} 
              className="h-6 w-6 text-brand-navy hover:bg-white/20"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[80%] rounded-lg p-3 break-words",
                  msg.sender === "user"
                    ? "bg-chat-user-gradient text-white ml-auto"
                    : "bg-chat-ai-gradient text-white"
                )}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="bg-chat-ai-gradient text-white rounded-lg p-3 max-w-[80%] flex space-x-1">
                <span className="animate-pulse">.</span>
                <span className="animate-pulse animation-delay-150">.</span>
                <span className="animate-pulse animation-delay-300">.</span>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-card">
            <div className="flex">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about your contract..."
                className="min-h-10 resize-none bg-white/5 border-white/10 focus:border-white/30 text-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="ml-2 bg-brand-gold text-brand-navy hover:bg-brand-gold/90"
                disabled={!message.trim() || isTyping}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
