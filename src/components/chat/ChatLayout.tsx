import React, { useEffect } from "react";
import ChatSidebar from "./ChatSidebar";
import { useTheme } from "../theme-provider";

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
  const { theme } = useTheme();

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      // For large screens (lg: 1024px and above), keep sidebar open
      // For small/medium screens, close sidebar by default
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state based on screen size
    handleResize();

    // Listen for window resize events
    window.addEventListener('resize', handleResize);

    // Cleanup event listener
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsSidebarOpen]);

  return (
    <div className={`flex h-screen overflow-hidden ${theme === "dark" ? "bg-slate-900 text-white" : "bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100 text-gray-800"}`}>
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out transform lg:relative lg:translate-x-0 lg:w-80 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ChatSidebar
          isOpen={isSidebarOpen}
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={onSelectConversation}
          onDeleteConversation={onDeleteConversation}
          onDeleteAllConversations={onDeleteAllConversations}
          isLoading={isLoading}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col h-full overflow-hidden">
        {/* Overlay for small/medium screens when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900 bg-opacity-50 z-40 lg:hidden"
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