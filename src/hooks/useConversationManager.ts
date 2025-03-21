
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useConversationManager(currentUserId: string | null) {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const createNewConversation = useCallback(async (initialMessage?: string) => {
    if (!currentUserId) {
      console.error("User ID is missing");
      return null;
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
        return null;
      }

      // Set the new conversation as current
      setCurrentConversationId(conversationData.id);
      return conversationData.id;
    } catch (err) {
      console.error("Unexpected error creating conversation:", err);
      return null;
    }
  }, [currentUserId]);

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
