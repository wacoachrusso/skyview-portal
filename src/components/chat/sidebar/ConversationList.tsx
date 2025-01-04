import { Conversation } from "@/types/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ConversationItem } from "./ConversationItem";
import { BulkActions } from "./BulkActions";

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
  const [offlineConversations, setOfflineConversations] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load offline conversations from localStorage on component mount
    const savedOfflineConversations = localStorage.getItem('offline-conversations');
    if (savedOfflineConversations) {
      setOfflineConversations(JSON.parse(savedOfflineConversations));
    }
  }, []);

  const handleSelect = (conversationId: string) => {
    if (selectedConversations.length > 0) {
      handleCheckboxChange(conversationId, !selectedConversations.includes(conversationId));
    } else {
      onSelectConversation(conversationId);
    }
  };

  const handleDelete = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    onDeleteConversation(conversationId);
    
    // Also remove from offline storage if it exists
    if (offlineConversations.includes(conversationId)) {
      const newOfflineConversations = offlineConversations.filter(id => id !== conversationId);
      setOfflineConversations(newOfflineConversations);
      localStorage.setItem('offline-conversations', JSON.stringify(newOfflineConversations));
      localStorage.removeItem(`offline-chat-${conversationId}`);
    }
  };

  const handleCheckboxChange = (conversationId: string, checked: boolean) => {
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

  const toggleOfflineAvailability = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    
    const isCurrentlyOffline = offlineConversations.includes(conversationId);
    
    if (isCurrentlyOffline) {
      // Remove from offline storage
      const newOfflineConversations = offlineConversations.filter(id => id !== conversationId);
      setOfflineConversations(newOfflineConversations);
      localStorage.setItem('offline-conversations', JSON.stringify(newOfflineConversations));
      localStorage.removeItem(`offline-chat-${conversationId}`);
      
      toast({
        title: "Removed from offline storage",
        description: "This chat will no longer be available offline",
      });
    } else {
      try {
        // Get messages from chat history for this conversation
        const chatHistory = JSON.parse(localStorage.getItem('chat-history') || '[]');
        const conversationMessages = chatHistory.filter((msg: any) => msg.conversation_id === conversationId);
        
        if (conversationMessages.length === 0) {
          throw new Error('No messages found for this conversation');
        }
        
        // Store for offline use
        localStorage.setItem(`offline-chat-${conversationId}`, JSON.stringify(conversationMessages));
        const newOfflineConversations = [...offlineConversations, conversationId];
        setOfflineConversations(newOfflineConversations);
        localStorage.setItem('offline-conversations', JSON.stringify(newOfflineConversations));
        
        toast({
          title: "Saved for offline viewing",
          description: "This chat will be available when you're offline",
        });
      } catch (error) {
        console.error('Error saving chat for offline viewing:', error);
        toast({
          title: "Error saving chat",
          description: "Unable to save this chat for offline viewing",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <BulkActions
        selectedCount={selectedConversations.length}
        onDeleteSelected={handleDeleteSelected}
      />
      <ScrollArea className="flex-1">
        <div className="flex flex-col py-2">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={conversation.id === currentConversationId}
              isOffline={offlineConversations.includes(conversation.id)}
              onSelect={handleSelect}
              onDelete={handleDelete}
              onToggleOffline={toggleOfflineAvailability}
              showCheckbox={selectedConversations.length > 0}
              isChecked={selectedConversations.includes(conversation.id)}
              onCheckChange={(checked) => handleCheckboxChange(conversation.id, checked)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}