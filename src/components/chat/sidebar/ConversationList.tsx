import { Conversation } from "@/types/chat";
import { format } from "date-fns";
import { MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const isMobile = useIsMobile();

  const handleSelect = (conversationId: string, checked: boolean) => {
    setSelectedConversations(prev => 
      checked 
        ? [...prev, conversationId]
        : prev.filter(id => id !== conversationId)
    );
  };

  const handleDeleteSelected = () => {
    selectedConversations.forEach(id => {
      onDeleteConversation(id);
    });
    setSelectedConversations([]);
  };

  const handleConversationClick = (conversationId: string) => {
    if (selectedConversations.length > 0) {
      handleSelect(conversationId, !selectedConversations.includes(conversationId));
    } else {
      onSelectConversation(conversationId);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {selectedConversations.length > 0 && (
        <div className="flex items-center justify-between p-2 bg-destructive/10 border-b border-border">
          <span className="text-sm text-destructive">
            {selectedConversations.length} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}
      <ScrollArea className="flex-1">
        <div className="flex flex-col py-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleConversationClick(conversation.id)}
              className={`group flex items-center px-3 py-3 cursor-pointer transition-all duration-200 hover:bg-white/5 border-l-2 ${
                currentConversationId === conversation.id 
                  ? "bg-white/10 border-l-brand-gold" 
                  : "border-l-transparent hover:border-l-white/20"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {selectedConversations.length > 0 && (
                  <Checkbox
                    checked={selectedConversations.includes(conversation.id)}
                    onCheckedChange={(checked) => 
                      handleSelect(conversation.id, checked as boolean)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                  />
                )}
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
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}