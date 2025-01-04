import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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
    const newOfflineConversations = offlineConversations.filter(id => id !== conversationId);
    setOfflineConversations(newOfflineConversations);
    localStorage.setItem('offline-conversations', JSON.stringify(newOfflineConversations));
    localStorage.removeItem(`offline-chat-${conversationId}`);
  };

  const toggleOfflineAvailability = async (conversationId: string) => {
    const isCurrentlyOffline = offlineConversations.includes(conversationId);
    
    if (isCurrentlyOffline) {
      removeFromOfflineStorage(conversationId);
      toast({
        title: "Removed from offline storage",
        description: "This chat will no longer be available offline",
      });
    } else {
      try {
        // Get messages from current-chat-messages if it's the active conversation
        const currentMessages = localStorage.getItem('current-chat-messages');
        
        if (!currentMessages) {
          throw new Error('No messages found for this conversation');
        }
        
        // Store the messages for offline access
        localStorage.setItem(`offline-chat-${conversationId}`, currentMessages);
        const newOfflineConversations = [...offlineConversations, conversationId];
        setOfflineConversations(newOfflineConversations);
        localStorage.setItem('offline-conversations', JSON.stringify(newOfflineConversations));
        
        toast({
          title: "Saved for offline viewing",
          description: "This chat will be available when you're offline",
        });

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