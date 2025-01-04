import { Conversation } from "@/types/chat";
import { format } from "date-fns";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
}

export function ConversationList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
}: ConversationListProps) {
  const isMobile = useIsMobile();
  const [swipeState, setSwipeState] = useState<{ [key: string]: number }>({});
  const touchStartX = useRef<number>(0);
  const currentlySwipingId = useRef<string | null>(null);
  const DELETE_THRESHOLD = -80; // Pixels to swipe before delete

  const handleTouchStart = (e: React.TouchEvent, conversationId: string) => {
    touchStartX.current = e.touches[0].clientX;
    currentlySwipingId.current = conversationId;
  };

  const handleTouchMove = (e: React.TouchEvent, conversationId: string) => {
    if (currentlySwipingId.current !== conversationId) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;
    
    // Only allow left swipe (negative diff) and limit the swipe distance
    const newOffset = Math.max(diff, DELETE_THRESHOLD);
    
    setSwipeState(prev => ({
      ...prev,
      [conversationId]: newOffset < 0 ? newOffset : 0
    }));
  };

  const handleTouchEnd = (conversationId: string) => {
    const offset = swipeState[conversationId] || 0;
    
    if (offset <= DELETE_THRESHOLD) {
      // Trigger delete animation
      setSwipeState(prev => ({
        ...prev,
        [conversationId]: -100 // Slide fully out
      }));
      
      // Delete after animation
      setTimeout(() => {
        onDeleteConversation(conversationId);
      }, 200);
    } else {
      // Reset position
      setSwipeState(prev => ({
        ...prev,
        [conversationId]: 0
      }));
    }
    currentlySwipingId.current = null;
  };

  // Reset swipe states when conversations change
  useEffect(() => {
    setSwipeState({});
  }, [conversations]);

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col py-2">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className="relative overflow-hidden"
            onTouchStart={(e) => isMobile && handleTouchStart(e, conversation.id)}
            onTouchMove={(e) => isMobile && handleTouchMove(e, conversation.id)}
            onTouchEnd={() => isMobile && handleTouchEnd(conversation.id)}
          >
            {/* Delete background */}
            <div className="absolute inset-y-0 right-0 bg-red-500 w-20 flex items-center justify-center text-white">
              Delete
            </div>
            
            {/* Conversation item */}
            <div
              onClick={() => onSelectConversation(conversation.id)}
              style={{
                transform: `translateX(${swipeState[conversation.id] || 0}px)`,
                transition: 'transform 0.2s ease-out'
              }}
              className={`group flex items-center justify-between px-3 py-3 cursor-pointer transition-all duration-200 hover:bg-white/5 border-l-2 ${
                currentConversationId === conversation.id 
                  ? "bg-white/10 border-l-brand-gold" 
                  : "border-l-transparent hover:border-l-white/20"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-shrink overflow-hidden mr-2">
                <div className={`p-2 rounded-lg ${
                  currentConversationId === conversation.id 
                    ? "bg-brand-gold/20" 
                    : "bg-white/5"
                }`}>
                  <MessageSquare className={`h-4 w-4 ${
                    currentConversationId === conversation.id 
                      ? "text-brand-gold" 
                      : "text-gray-400"
                  }`} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-white truncate max-w-[180px]">
                    {conversation.title}
                  </span>
                  <span className="text-xs text-gray-400">
                    {format(new Date(conversation.last_message_at), "MMM d, h:mm a")}
                  </span>
                </div>
              </div>
              
              {/* Only show delete button on desktop */}
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}