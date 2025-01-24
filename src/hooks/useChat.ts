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
    
    try {
      // Create temporary message for immediate display
      const tempMessage: Message = {
        id: crypto.randomUUID(),
        conversation_id: currentConversationId || '',
        user_id: currentUserId,
        content: content,
        role: 'user',
        created_at: new Date().toISOString()
      };
      
      console.log('Adding temporary message to UI:', tempMessage);
      setMessages(prev => [...prev, tempMessage]);

      // Ensure we have a valid conversation ID before proceeding
      const conversationId = await ensureConversation(currentUserId, content);
      if (!conversationId) {
        throw new Error('Failed to create or get conversation');
      }

      console.log('Conversation ID confirmed:', conversationId);
      setCurrentConversationId(conversationId);

      // Insert the actual user message
      const userMessage = await insertUserMessage(content, conversationId);
      console.log('User message inserted successfully:', userMessage);

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
      setCurrentConversationId(null); // Reset conversation ID
      
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

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!currentConversationId) {
      console.log('No conversation ID, skipping real-time subscription');
      return;
    }

    console.log('Setting up real-time subscription for conversation:', currentConversationId);
    const channel = supabase
      .channel(`messages_${currentConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${currentConversationId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as Message;
          setMessages(prev => {
            // Check if message already exists to prevent duplicates
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) {
              console.log('Message already exists in state, skipping');
              return prev;
            }
            console.log('Adding new message to state');
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [currentConversationId, setMessages]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      console.log('Loading messages for conversation:', currentConversationId);
      loadMessages(currentConversationId);
    }
  }, [currentConversationId, loadMessages]);

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