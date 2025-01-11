import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useOfflineConversations = () => {
  const [offlineConversations, setOfflineConversations] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load offline conversations from localStorage on component mount
    const savedOfflineConversations = localStorage.getItem('offline-conversations');
    if (savedOfflineConversations) {
      setOfflineConversations(JSON.parse(savedOfflineConversations));
    }
  }, []);

  const removeFromOfflineStorage = (conversationId: string) => {
    console.log('Removing conversation from offline storage:', conversationId);
    const newOfflineConversations = offlineConversations.filter(id => id !== conversationId);
    setOfflineConversations(newOfflineConversations);
    localStorage.setItem('offline-conversations', JSON.stringify(newOfflineConversations));
    localStorage.removeItem(`offline-chat-${conversationId}`);
  };

  const toggleOfflineAvailability = async (conversationId: string) => {
    const isCurrentlyOffline = offlineConversations.includes(conversationId);
    
    if (isCurrentlyOffline) {
      removeFromOfflineStorage(conversationId);
    } else {
      try {
        console.log('Fetching messages for offline storage:', conversationId);
        // Fetch messages for the conversation
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;
        
        if (!messages || messages.length === 0) {
          throw new Error('No messages found for this conversation');
        }

        // Fetch conversation details
        const { data: conversation, error: conversationError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single();

        if (conversationError) throw conversationError;
        
        // Store both conversation and messages
        const offlineData = {
          conversation,
          messages
        };
        
        // Store the chat data for offline access
        localStorage.setItem(`offline-chat-${conversationId}`, JSON.stringify(offlineData));
        const newOfflineConversations = [...offlineConversations, conversationId];
        setOfflineConversations(newOfflineConversations);
        localStorage.setItem('offline-conversations', JSON.stringify(newOfflineConversations));
        
        console.log('Chat saved for offline viewing:', conversationId);
      } catch (error) {
        console.error('Error saving chat for offline viewing:', error);
        toast({
          title: "Error saving chat",
          description: "Unable to save this chat for offline viewing",
          variant: "destructive",
        });
      }
    }
  };

  return {
    offlineConversations,
    removeFromOfflineStorage,
    toggleOfflineAvailability
  };
};