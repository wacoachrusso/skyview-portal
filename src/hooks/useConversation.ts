import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { updateConversationTitle, loadConversationMessages } from "@/utils/conversationUtils";

export function useConversation() {
  const { toast } = useToast();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const createNewConversation = async (userId: string) => {
    console.log('Creating new conversation...');
    setCurrentConversationId(null);
    return null;
  };

  const ensureConversation = async (userId: string, firstMessage?: string) => {
    console.log('Ensuring conversation exists before sending message...');
    if (!currentConversationId) {
      try {
        const title = firstMessage ? firstMessage.slice(0, 50) : 'New Chat';
        const { data: newConversation, error: conversationError } = await supabase
          .from('conversations')
          .insert([{ 
            user_id: userId,
            title: title
          }])
          .select()
          .single();

        if (conversationError) {
          console.error('Error creating conversation:', conversationError);
          throw conversationError;
        }
        
        console.log('New conversation created:', newConversation);
        setCurrentConversationId(newConversation.id);
        return newConversation.id;
      } catch (error) {
        console.error('Error creating new conversation:', error);
        toast({
          title: "Error",
          description: "Failed to create new conversation",
          variant: "destructive",
          duration: 2000
        });
        return null;
      }
    }
    return currentConversationId;
  };

  const loadConversation = async (conversationId: string) => {
    console.log('Loading conversation:', conversationId);
    try {
      const messages = await loadConversationMessages(conversationId);
      setCurrentConversationId(conversationId);
      return messages;
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
        duration: 2000
      });
      return [];
    }
  };

  return {
    currentConversationId,
    createNewConversation,
    ensureConversation,
    loadConversation,
    setCurrentConversationId
  };
}