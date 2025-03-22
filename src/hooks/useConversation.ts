import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { loadConversationMessages } from "@/utils/conversationUtils";

export function useConversation() {
  const { toast } = useToast();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isFetching = useRef(false);

  const createNewConversation = async (userId: string) => {
    console.log('Creating new conversation...');
    try {
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert([{ 
          user_id: userId,
          title: '' 
        }])
        .select()
        .single();

      if (conversationError) {
        throw conversationError;
      }
      
      console.log('New conversation created:', newConversation);
      setCurrentConversationId(newConversation.id);
      return newConversation.id;
    } catch (error) {
      console.error('Error in createNewConversation:', error);
      toast({
        title: "Error",
        description: "Failed to create new conversation",
        variant: "destructive",
        duration: 2000,
      });
      return null;
    }
  };

  const ensureConversation = async (userId: string, firstMessage?: string) => {
    console.log('Ensuring conversation exists before sending message...');
    
    if (currentConversationId) {
      console.log('Using existing conversation:', currentConversationId);
      return currentConversationId;
    }
  
    try {
      const title = firstMessage ? firstMessage.slice(0, 50) : '';
      console.log('Creating new conversation with title:', title || '(Empty - will be set after first message)');
      
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert([{ 
          user_id: userId,
          title: title
        }])
        .select()
        .single();
  
      if (conversationError) {
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
        duration: 2000,
      });
      return null;
    }
  };

  const loadConversation = async (conversationId: string) => {
    if (isFetching.current || isLoading) return; // Prevent overlapping requests
    isFetching.current = true;
    setIsLoading(true);
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
        duration: 2000,
      });
      return [];
    } finally {
      isFetching.current = false;
      setIsLoading(false);
    }
  };

  return {
    currentConversationId,
    createNewConversation,
    ensureConversation,
    loadConversation,
    setCurrentConversationId,
    isLoading,
  };
}
