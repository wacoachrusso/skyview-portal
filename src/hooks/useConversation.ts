import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { updateConversationTitle, loadConversationMessages } from "@/utils/conversationUtils";

export function useConversation() {
  const { toast } = useToast();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const createNewConversation = async (userId: string) => {
    console.log('Creating new conversation for user:', userId);
    try {
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert([{ user_id: userId }])
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
        variant: "destructive"
      });
      return null;
    }
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
        variant: "destructive"
      });
      return [];
    }
  };

  return {
    currentConversationId,
    createNewConversation,
    loadConversation,
    setCurrentConversationId
  };
}