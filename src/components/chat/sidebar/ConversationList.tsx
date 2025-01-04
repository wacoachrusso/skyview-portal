import { Conversation } from "@/types/chat";
import { format } from "date-fns";
import { MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const handleDelete = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    onDeleteConversation(conversationId);
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col py-2">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
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
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white hover:bg-white/10"
              onClick={(e) => handleDelete(e, conversation.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}