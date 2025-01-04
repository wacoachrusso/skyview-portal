import { Conversation } from "@/types/chat";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
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
      <div className="flex flex-col">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors ${
              currentConversationId === conversation.id ? "bg-white/10" : ""
            }`}
          >
            <div className="flex flex-col min-w-0 flex-shrink overflow-hidden mr-2">
              <span className="text-sm text-white truncate max-w-[180px]">
                {conversation.title}
              </span>
              <span className="text-xs text-gray-400 truncate">
                {format(new Date(conversation.last_message_at), "MMM d, h:mm a")}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 text-gray-400 hover:text-white hover:bg-white/10"
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