import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SidebarHeader } from "./SidebarHeader";
import { SearchBar } from "./sidebar/SearchBar";
import { ConversationList } from "./sidebar/ConversationList";
import { useTheme } from "../theme-provider";

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
  isLoading = false,
}: ChatSidebarProps) => {
  const { theme } = useTheme();
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
    <div
      className={`w-80 border-r border-white/10 flex flex-col h-full ${
        theme === "dark"
          ? "bg-[#1A1F2C] "
          : "bg-gray-100 text-gray-800  border-r border-gray-200 shadow-md"
      }`}
    >
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
      <div
        className={`p-4 border-t ${
          theme === "dark" ? "border-slate-700 " : "border-gray-300 "
        }`}
      >
        <div className={`text-sm ${
          theme === "dark" ? "text-slate-400 " : "text-gray-800 "
        }`}>
          <p className="text-[15px]">© 2025 SkyGuide</p>
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
