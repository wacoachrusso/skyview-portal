import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { ChatNavbar } from "@/components/chat/layout/ChatNavbar";
import { ChatLayout } from "@/components/chat/layout/ChatLayout";
import { ChatContent } from "@/components/chat/ChatContent";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Message } from '@/types/chat';

export default function Chat() {
  const { currentUserId } = useUserProfile();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const { copyToClipboard } = useCopyToClipboard();
  const { toast } = useToast();
  
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
        setError(error as any);
      } else if (data) {
        // Ensure the role is properly typed as "user" | "assistant"
        const typedMessages = data.map(msg => ({
          ...msg,
          role: msg.role as "user" | "assistant"
        }));
        setMessages(typedMessages);
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

  const handleCopyMessage = (content: string) => {
    copyToClipboard(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content copied to clipboard",
      duration: 2000,
    });
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!currentUserId || !currentConversationId) {
      console.error("User or conversation ID is missing.");
      return;
    }

    // First add a user message
    const userMessage = {
      conversation_id: currentConversationId,
      user_id: currentUserId,
      content: messageContent,
      role: 'user' as "user" | "assistant"  // Explicitly type as "user"
    };

    try {
      // Insert user message
      const { data: userData, error: userError } = await supabase
        .from('messages')
        .insert([userMessage])
        .select('*')
        .single();

      if (userError) {
        console.error("Error sending user message:", userError);
        setError(userError as any);
        return;
      }

      // Ensure the typed message is added to state
      setMessages(prevMessages => [
        ...prevMessages, 
        { ...userData, role: userData.role as "user" | "assistant" }
      ]);

      // Now simulate AI response
      setIsLoading(true);
      
      // Simulate AI thinking time
      setTimeout(async () => {
        // Create AI response
        const aiMessage = {
          conversation_id: currentConversationId,
          user_id: currentUserId,
          content: "I'm sorry, but I can only answer questions directly related to your union contract's terms, policies, or provisions. For other topics, please contact appropriate resources or refocus your question on contract-related matters.",
          role: 'assistant' as "user" | "assistant"  // Explicitly type as "assistant"
        };

        try {
          const { data: aiData, error: aiError } = await supabase
            .from('messages')
            .insert([aiMessage])
            .select('*')
            .single();

          if (aiError) {
            console.error("Error sending AI message:", aiError);
            setError(aiError as any);
          } else if (aiData) {
            // Ensure the typed message is added to state
            setMessages(prevMessages => [
              ...prevMessages, 
              { ...aiData, role: aiData.role as "user" | "assistant" }
            ]);
          }
        } catch (err) {
          console.error("Unexpected error sending AI message:", err);
          setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
        } finally {
          setIsLoading(false);
        }
      }, 1500);

    } catch (err) {
      console.error("Unexpected error in message flow:", err);
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
      setIsLoading(false);
    }
  };

  const handleSelectQuestion = (question: string) => {
    // If no conversation exists yet, create one
    if (!currentConversationId) {
      createNewConversation(question);
    } else {
      // Otherwise just send the message in the current conversation
      handleSendMessage(question);
    }
  };

  const createNewConversation = async (initialMessage?: string) => {
    if (!currentUserId) {
      console.error("User ID is missing");
      return;
    }

    try {
      // Create a new conversation
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .insert([{ 
          user_id: currentUserId,
          title: initialMessage ? initialMessage.substring(0, 50) : 'New Chat' 
        }])
        .select('*')
        .single();

      if (conversationError) {
        console.error("Error creating conversation:", conversationError);
        setError(conversationError as any);
        return;
      }

      // Set the new conversation as current
      setCurrentConversationId(conversationData.id);
      setMessages([]);
      setShowWelcome(false);

      // If there's an initial message, send it
      if (initialMessage) {
        setTimeout(() => {
          handleSendMessage(initialMessage);
        }, 100);
      }
    } catch (err) {
      console.error("Unexpected error creating conversation:", err);
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
    }
  };

  const handleNewChat = () => {
    createNewConversation();
  };

  return (
    <div className="flex flex-col h-screen w-full">
      <ChatNavbar />
      <div className="flex flex-1 overflow-hidden">
        <ChatLayout
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          onSelectConversation={handleSelectConversation}
          currentConversationId={currentConversationId}
        >
          <ChatContent
            messages={messages}
            currentUserId={currentUserId}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onNewChat={handleNewChat}
            error={error}
            showWelcome={showWelcome}
            currentConversationId={currentConversationId}
          >
            <ChatContainer
              messages={messages}
              currentUserId={currentUserId}
              isLoading={isLoading}
              onCopyMessage={handleCopyMessage}
              onSelectQuestion={handleSelectQuestion}
            />
          </ChatContent>
        </ChatLayout>
      </div>
    </div>
  );
}
