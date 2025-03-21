
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { ChatNavbar } from "./layout/ChatNavbar";
import { ChatLayout } from "./layout/ChatLayout";
import { ChatContent } from "./ChatContent";

export default function ChatContainer() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const conversationIdFromParams = searchParams.get('conversationId');

  const fetchMessages = useCallback(async (conversationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        setError(error);
      } else {
        setMessages(data || []);
      }
    } catch (err) {
      console.error("Unexpected error fetching messages:", err);
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (conversationIdFromParams) {
      setCurrentConversationId(conversationIdFromParams);
      fetchMessages(conversationIdFromParams);
      setShowWelcome(false);
    }
  }, [conversationIdFromParams, fetchMessages]);

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    fetchMessages(conversationId);
    setShowWelcome(false);
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!currentConversationId) {
      console.error("Conversation ID is missing.");
      return;
    }

    // Get user ID from the session
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      console.error("User ID is missing.");
      return;
    }

    const newMessage = {
      conversation_id: currentConversationId,
      user_id: userId,
      content: messageContent,
      role: 'user' // Add the required 'role' field
    };

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select('*')
        .single();

      if (error) {
        console.error("Error sending message:", error);
        setError(error);
      } else {
        setMessages(prevMessages => [...prevMessages, data]);
      }
    } catch (err) {
      console.error("Unexpected error sending message:", err);
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
    }
  };

  const filteredMessages = messages.filter(msg => msg.conversation_id === currentConversationId);

  return (
    <div className="flex flex-col h-screen w-full">
      <ChatNavbar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <ChatLayout
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          onSelectConversation={handleSelectConversation}
          currentConversationId={currentConversationId}
        >
          <ChatContent
            messages={filteredMessages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            showWelcome={showWelcome}
            currentConversationId={currentConversationId}
          />
        </ChatLayout>
      </div>
    </div>
  );
}
