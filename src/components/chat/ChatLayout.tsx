// Updated ChatLayout.tsx
import React from "react";
import ChatSidebar from "./ChatSidebar";

interface ChatLayoutProps {
  children: React.ReactNode;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  conversations: any[];
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onDeleteAllConversations: () => void;
  isLoading?: boolean;
}

export function ChatLayout({
  children,
  isSidebarOpen,
  setIsSidebarOpen,
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onDeleteAllConversations,
  isLoading,
}: ChatLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-white">
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0 sm:static"
        } sm:relative sm:w-80`}
      >
        <ChatSidebar
          isOpen={isSidebarOpen}
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={onSelectConversation}
          onDeleteConversation={onDeleteConversation}
          onDeleteAllConversations={onDeleteAllConversations}
          isLoading={isLoading}
        />
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col h-full overflow-hidden">
        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900 bg-opacity-50 z-40 sm:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Render children (Chat area) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

export default ChatLayout;