import { useState } from "react";
import { Conversation } from "@/types/chat";
import { ConversationList } from "./sidebar/ConversationList";
import { SearchBar } from "./sidebar/SearchBar";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { ChatLimitWarning } from "./sidebar/ChatLimitWarning";
import { useConversations } from "./sidebar/hooks/useConversations";
import { useQueryClient } from "@tanstack/react-query";

interface ChatSidebarProps {
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export function ChatSidebar({ currentConversationId, onSelectConversation }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { conversations, deleteConversation, deleteAllConversations, CHAT_LIMIT_WARNING } = useConversations();
  const queryClient = useQueryClient();

  const handleSelectConversation = async (conversationId: string) => {
    console.log('Selecting conversation:', conversationId);
    onSelectConversation(conversationId);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    await deleteConversation(conversationId);
    // Quietly refresh the conversations list in the background
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  };

  const handleDeleteAll = async () => {
    await deleteAllConversations();
    // Quietly refresh the conversations list in the background
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  };

  const filteredConversations = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 sm:w-80 bg-[#1A1F2C] border-r border-white/10 flex flex-col h-full">
      <SidebarHeader onDeleteAll={handleDeleteAll} />
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      {conversations.length >= CHAT_LIMIT_WARNING && (
        <ChatLimitWarning conversationCount={conversations.length} />
      )}
      <div className="flex-1 overflow-y-auto">
        <ConversationList
          conversations={filteredConversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>
    </div>
  );
}