import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import { useConversation } from "./useConversation";
import { useMessageHandling } from "./useMessageHandling";

export function useChat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { 
    currentConversationId, 
    createNewConversation, 
    ensureConversation,
    loadConversation, 
    setCurrentConversationId 
  } = useConversation();

  const { updateConversation, insertUserMessage, insertAIMessage } = useMessageHandling(currentUserId, currentConversationId);

  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUserProfile(profile);
      }
    };
    loadUserProfile();
  }, []);

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
      const conversationId = await ensureConversation(currentUserId, content);
      if (!conversationId) {
        throw new Error('Failed to create or get conversation');
      }

      console.log('Inserting user message into conversation:', conversationId);
      const userMessage = await insertUserMessage(content, conversationId);
      console.log('User message inserted:', userMessage);

      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: { 
          content,
          subscriptionPlan: userProfile?.subscription_plan || 'free'
        }
      });

      if (error) throw error;
      
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
    setMessages([]);
    setCurrentConversationId(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking authentication...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No user found, redirecting to login');
        return null;
      }
      console.log('User authenticated:', session.user.id);
      setCurrentUserId(session.user.id);
      return session.user.id;
    };

    const setupChat = async () => {
      const userId = await checkAuth();
      if (!userId) return;
    };

    setupChat();

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
    const loadMessages = async () => {
      if (currentConversationId) {
        console.log('Loading messages for conversation:', currentConversationId);
        const { data: messages, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', currentConversationId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading messages:', error);
          return;
        }

        console.log('Loaded messages:', messages?.length || 0);
        setMessages(messages || []);
      }
    };

    loadMessages();
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