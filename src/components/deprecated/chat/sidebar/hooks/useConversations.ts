import { useState, useEffect } from "react";
import { Conversation } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useConversations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const CHAT_LIMIT_WARNING = 25;

  const fetchConversations = async () => {
    console.log('Fetching conversations...');
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }

    console.log('Fetched conversations:', data?.length);
    return data || [];
  };

  const { data: conversations = [], error, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    retry: 2,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const deleteConversation = async (conversationId: string) => {
    try {
      console.log('Deleting conversation:', conversationId);
      
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) throw messagesError;

      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (conversationError) throw conversationError;

      toast({
        title: "Success",
        description: "Conversation deleted successfully",
      });

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      console.log('Conversation deleted successfully');
      
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteAllConversations = async () => {
    try {
      console.log('Fetching all conversations for deletion');
      const { data: userConversations, error: fetchError } = await supabase
        .from('conversations')
        .select('id');

      if (fetchError) throw fetchError;

      if (!userConversations || userConversations.length === 0) {
        toast({
          title: "Info",
          description: "No conversations to delete.",
        });
        return;
      }

      const conversationIds = userConversations.map(conv => conv.id);

      console.log('Deleting messages for conversations:', conversationIds.length);
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .in('conversation_id', conversationIds);

      if (messagesError) throw messagesError;

      console.log('Deleting conversations');
      const { error: conversationsError } = await supabase
        .from('conversations')
        .delete()
        .in('id', conversationIds);

      if (conversationsError) throw conversationsError;

      toast({
        title: "Success",
        description: "All conversations deleted successfully",
      });

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      console.log('All conversations deleted successfully');
      
    } catch (error) {
      console.error('Error deleting all conversations:', error);
      toast({
        title: "Error",
        description: "Failed to delete all conversations. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Log when error status changes
  useEffect(() => {
    if (error) {
      console.error('Conversations loading error:', error);
    }
  }, [error]);

  return {
    conversations,
    deleteConversation,
    deleteAllConversations,
    CHAT_LIMIT_WARNING,
    error,
    isLoading
  };
}