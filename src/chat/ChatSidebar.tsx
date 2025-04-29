import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import React, { useState } from "react";
import { ConversationList } from "@/chat/sidebar/ConversationList";
import { SearchBar } from "@/chat/sidebar/SearchBar";
import { SidebarHeader } from "@/chat/SidebarHeader";

interface ChatSidebarProps {
  isOpen: boolean;
  conversations: any[];
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onDeleteAllConversations: () => void;
  isLoading?: boolean;
}

const ChatSidebar = ({
  isOpen,
  conversations = [],
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onDeleteAllConversations,
  isLoading = false
}: ChatSidebarProps) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const handleSelectConversation = async (conversationId: string) => {
    console.log("Selecting conversation:", conversationId);
    onSelectConversation(conversationId);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    console.log("Deleting conversation:", conversationId);
    await onDeleteConversation(conversationId);
    // Quietly refresh the conversations list in the background
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  const handleDeleteAll = async () => {
    console.log("Deleting all conversations");
    await onDeleteAllConversations();
    // Quietly refresh the conversations list in the background
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  const filteredConversations = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-[#1A1F2C] border-r border-white/10 flex flex-col h-full">
      <SidebarHeader onDeleteAll={() => setDeleteConfirmOpen(true)} />
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <div className="flex-1 overflow-y-auto">
        <ConversationList
          conversations={filteredConversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          isLoading={isLoading}
        />
      </div>
      <div className="p-4 border-t border-slate-700">
        <div className="text-sm text-slate-400">
          <p>© 2025 SkyGuide</p>
        </div>
      </div>

      {deleteConfirmOpen && (
        <div className="absolute inset-0 bg-slate-900 bg-opacity-90 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-xs w-full">
            <h3 className="text-lg font-medium mb-4">
              Delete All Conversations
            </h3>
            <p className="text-sm text-slate-300 mb-6">
              Are you sure you want to delete all conversations? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded bg-slate-700 text-white hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteAllConversations();
                  setDeleteConfirmOpen(false);
                }}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;