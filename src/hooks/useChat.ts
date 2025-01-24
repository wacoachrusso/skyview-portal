import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useConversation } from "./useConversation";
import { useMessageOperations } from "./useMessageOperations";
import { useUserProfile } from "./useUserProfile";
import { Message } from "@/types/chat";

export function useChat() {
  const { toast } = useToast();
  const { currentUserId, userProfile } = useUserProfile();
  const { 
    currentConversationId, 
    createNewConversation, 
    ensureConversation,
    loadConversation, 
    setCurrentConversationId 
  } = useConversation();

  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    insertUserMessage,
    insertAIMessage,
    loadMessages
  } = useMessageOperations(currentUserId, currentConversationId);

  const sendMessage = async (content: string) => {
    console.log('Sending message:', { content, conversationId: currentConversationId });
    
    if (!currentUserId) {
      console.error('No user ID available');
      toast({
        title: "Error",
        description: "Unable to send message. Please try refreshing the page.",
        variant: "destructive",
        duration: 2000
      });
      return;
    }
    
    setIsLoading(true);
    let tempMessageId: string | null = null;
    
    try {
      // Ensure we have a valid conversation ID before proceeding
      const conversationId = await ensureConversation(currentUserId, content);
      if (!conversationId) {
        throw new Error('Failed to create or get conversation');
      }

      // Set the current conversation ID immediately
      setCurrentConversationId(conversationId);

      // Add user message to UI immediately
      const tempUserMessage: Message = {
        id: crypto.randomUUID(),
        conversation_id: conversationId,
        user_id: currentUserId,
        content: content,
        role: 'user',
        created_at: new Date().toISOString()
      };
      tempMessageId = tempUserMessage.id;
      
      // Update messages state immediately
      setMessages(prev => [...prev, tempUserMessage]);

      console.log('Inserting user message into conversation:', conversationId);
      await insertUserMessage(content, conversationId);
      console.log('User message inserted successfully');

      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: { 
          content: `${content}\n\nPlease include the specific section and page number from the contract that supports your answer, formatted like this: [REF]Section X.X, Page Y: Exact quote from contract[/REF]. If no specific reference exists for this query, please state that clearly in the reference section.`,
          subscriptionPlan: userProfile?.subscription_plan || 'free'
        }
      });

      if (error) {
        console.error('Error from chat-completion:', error);
        throw error;
      }

      if (!data || !data.response) {
        throw new Error('Invalid response from chat-completion');
      }
      
      console.log('Received AI response, inserting message');
      await insertAIMessage(data.response, conversationId);
      console.log('AI message inserted successfully');

    } catch (error) {
      console.error('Error in chat flow:', error);
      // Remove the temporary message if there was an error
      if (tempMessageId) {
        setMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
        duration: 2000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = async () => {
    console.log('Starting new chat session...');
    try {
      setMessages([]); // Clear messages immediately
      setIsLoading(false); // Reset loading state
      
      if (currentUserId) {
        const newConversationId = await createNewConversation(currentUserId);
        if (newConversationId) {
          console.log('New conversation created, setting ID:', newConversationId);
          setCurrentConversationId(newConversationId);
        }
      }
    } catch (error) {
      console.error('Error starting new chat:', error);
      toast({
        title: "Error",
        description: "Failed to start new chat. Please try again.",
        variant: "destructive",
        duration: 2000
      });
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as Message;
          if (newMessage.conversation_id === currentConversationId) {
            console.log('Adding message to chat:', newMessage);
            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentConversationId]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    }
  }, [currentConversationId]);

  return {
    messages,
    currentUserId,
    isLoading,
    sendMessage,
    createNewConversation,
    currentConversationId,
    loadConversation,
    setCurrentConversationId,
    userProfile,
    startNewChat
  };
}