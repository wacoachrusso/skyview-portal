
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useConversationManager(currentUserId: string | null) {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const createNewConversation = useCallback(async (userId: string, initialMessage?: string) => {
    if (!userId) {
      console.error("User ID is missing");
      return null;
    }

    try {
      // Generate a meaningful title for the conversation based on the initial message
      const title = initialMessage 
        ? initialMessage.substring(0, 50) + (initialMessage.length > 50 ? '...' : '')
        : 'New Chat';
        
      console.log("Creating new conversation with title:", title);

      // Create a new conversation
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .insert([{ 
          user_id: userId,
          title: title
        }])
        .select('*')
        .single();

      if (conversationError) {
        console.error("Error creating conversation:", conversationError);
        return null;
      }

      console.log("New conversation created:", conversationData);
      
      // Set the new conversation as current
      setCurrentConversationId(conversationData.id);
      return conversationData.id;
    } catch (err) {
      console.error("Unexpected error creating conversation:", err);
      return null;
    }
  }, []);

  const selectConversation = useCallback((conversationId: string) => {
    setCurrentConversationId(conversationId);
  }, []);

  return {
    currentConversationId,
    setCurrentConversationId,
    createNewConversation,
    selectConversation
  };
}
