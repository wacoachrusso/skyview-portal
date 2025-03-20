import { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { Button } from "@/components/ui/button";

interface ChatContentProps {
  messages: any[];
  currentUserId: string | null;
  isLoading: boolean;
  onSendMessage: (message: string) => Promise<void>;
  onNewChat: () => void;
  isChatDisabled: boolean;
}

function WelcomeMessage() {
  return (
    <div className="text-center text-muted-foreground">
      <h2 className="text-xl font-semibold mb-4">Welcome to SkyGuide AI</h2>
      <p className="mb-2">Ask me anything about your contract!</p>
      <p className="text-sm">
        For best results, be specific and provide context.
      </p>
    </div>
  );
}

export function ChatContent({ 
  messages, 
  currentUserId, 
  isLoading, 
  onSendMessage, 
  onNewChat,
  isChatDisabled
}: ChatContentProps) {
  const bottomRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Scroll to bottom effect when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <ChatHeader onNewChat={onNewChat} />
      
      {/* Chat Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-6" 
        ref={messagesContainerRef}
      >
        {/* Welcome message or messages list */}
        {messages.length === 0 ? (
          <WelcomeMessage />
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              currentUserId={currentUserId}
            />
          ))
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center space-x-2 p-4 rounded-lg bg-muted/30">
            <div className="h-6 w-6 rounded-full border-2 border-t-transparent border-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              SkyGuide is thinking...
            </p>
          </div>
        )}
        
        {/* Auto-scroll anchor */}
        <div ref={bottomRef} />
      </div>
      
      {/* Input area */}
      <div className="mt-auto w-full">
        <ChatInput 
          onSendMessage={onSendMessage} 
          isLoading={isLoading}
          disabled={isChatDisabled}
        />
      </div>
      
      {/* Chat suggestions area - ensure this doesn't get cut off */}
      <div className="w-full px-4 pb-6">
        <div className="rounded-lg p-4 bg-secondary/10 mb-4">
          <h3 className="text-lg font-medium mb-2 text-center">Ask about your contract...</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              className="text-sm text-left justify-start h-auto py-3 px-4 bg-secondary/20"
              onClick={() => onSendMessage("What are my rest period rights if my flight is delayed?")}
            >
              What are my rights if my flight is delayed?
            </Button>
            <Button 
              variant="outline" 
              className="text-sm text-left justify-start h-auto py-3 px-4 bg-secondary/20"
              onClick={() => onSendMessage("What are the minimum rest periods for international flights?")}
            >
              What are the minimum rest periods for international flights?
            </Button>
            <Button 
              variant="outline" 
              className="text-sm text-left justify-start h-auto py-3 px-4 bg-secondary/20"
              onClick={() => onSendMessage("Can my rest period be reduced for operational reasons?")}
            >
              Can my rest period be reduced for operational reasons?
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
