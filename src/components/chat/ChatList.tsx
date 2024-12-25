import { Message } from "@/types/chat";
import { ChatMessage } from "./ChatMessage";
import { useEffect, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ChatListProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  subscriptionPlan?: string;
}

export function ChatList({ messages, currentUserId, isLoading, subscriptionPlan }: ChatListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length === 0) {
      scrollToTop();
    } else {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    const autoSave = localStorage.getItem("chat-auto-save") === "true";
    if (autoSave && messages.length > 0) {
      console.log("Auto-saving messages to localStorage:", messages.length, "messages");
      try {
        localStorage.setItem("chat-messages", JSON.stringify(messages));
        console.log("Messages saved successfully");
      } catch (error) {
        console.error("Error saving messages to localStorage:", error);
      }
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {subscriptionPlan === 'free' && (
        <Alert className="m-4 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You are using the free trial version. Responses are for demonstration purposes only and do not reflect actual contract analysis. 
            Watch our demo or upgrade to a paid plan to access real contract interpretation.
          </AlertDescription>
        </Alert>
      )}
      <div ref={containerRef} className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2 p-2 sm:p-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isCurrentUser={message.user_id === currentUserId}
            />
          ))}
          {isLoading && (
            <div className="flex w-full gap-2 p-2 justify-start">
              <div className="flex max-w-[80%] flex-col gap-1 rounded-lg px-3 py-2 sm:px-4 sm:py-2 bg-white/5 text-white">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                  <div className="animate-pulse w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full delay-150"></div>
                  <div className="animate-pulse w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full delay-300"></div>
                  <span className="text-xs sm:text-sm ml-2">Searching the contract...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}