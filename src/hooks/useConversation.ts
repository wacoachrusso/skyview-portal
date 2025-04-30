import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { loadConversationMessages } from "@/utils/conversationUtils";

type UseConversationOptions = {
  enabled?: boolean;
  userId?: string | null;
};

export function useConversation(options: UseConversationOptions = {}) {
  const { enabled = true, userId = null } = options;
  const { toast } = useToast();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isFetching = useRef(false);
  const prevUserId = useRef<string | null>(null);
  
  // Reset state when user changes or component is disabled
  useEffect(() => {
    if (!enabled || userId !== prevUserId.current) {
      setCurrentConversationId(null);
      isFetching.current = false;
      setIsLoading(false);
      prevUserId.current = userId;
    }
  }, [enabled, userId]);

  const createNewConversation = useCallback(async (userId: string) => {
    if (!enabled || !userId) return null;
    
    console.log('Creating new conversation...');
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }, [enabled, toast]);

  const ensureConversation = useCallback(async (userId: string, firstMessage?: string) => {
    if (!enabled || !userId) return null;
    
    console.log('Ensuring conversation exists before sending message...');
    
    if (currentConversationId) {
      console.log('Using existing conversation:', currentConversationId);
      return currentConversationId;
    }
  
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }, [enabled, currentConversationId, toast]);

  const loadConversation = useCallback(async (conversationId: string) => {
    if (!enabled || !conversationId || isFetching.current || isLoading) return [];
    
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
  }, [enabled, isLoading, toast]);

  return {
    currentConversationId,
    createNewConversation,
    ensureConversation,
    loadConversation,
    setCurrentConversationId,
    isLoading,
  };
}