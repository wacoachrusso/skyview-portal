import { Conversation } from "@/types/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConversationItem } from "./ConversationItem";
import { BulkActions } from "../BulkActions";
import { useOfflineConversations } from "@/hooks/useOfflineConversations";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { useTheme } from "@/components/theme-provider";

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  isLoading,
}: ConversationListProps) {
  const { theme } = useTheme();
  const {
    offlineConversations,
    removeFromOfflineStorage,
    toggleOfflineAvailability,
  } = useOfflineConversations();

  const {
    selectedConversations,
    handleCheckboxChange,
    clearSelection,
  } = useBulkSelection();

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
    removeFromOfflineStorage(conversationId);
  };

  const handleToggleOffline = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    toggleOfflineAvailability(conversationId);
  };

  const handleDeleteSelected = () => {
    selectedConversations.forEach((id) => {
      onDeleteConversation(id);
      removeFromOfflineStorage(id);
    });
    clearSelection();
  };

  return (
    <div className="flex flex-col h-full">
      <BulkActions
        selectedCount={selectedConversations.length}
        onDeleteSelected={handleDeleteSelected}
      />
      <ScrollArea className="flex-1">
        <div className="flex flex-col py-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-pulse space-y-2 w-full">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-white/5 rounded-lg" />
                ))}
              </div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center p-4 text-gray-400">
              No conversations yet
            </div>
          ) : (
            conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === currentConversationId}
                isOffline={offlineConversations.includes(conversation.id)}
                onSelect={handleSelect}
                onDelete={handleDelete}
                onToggleOffline={handleToggleOffline}
                showCheckbox={selectedConversations.length > 0}
                isChecked={selectedConversations.includes(conversation.id)}
                onCheckChange={(checked) => handleCheckboxChange(conversation.id, checked)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}