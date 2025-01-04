import { useState, useEffect } from "react";
import { Conversation } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { toast } = useToast();
  const CHAT_LIMIT_WARNING = 25;

  const loadConversations = async () => {
    console.log('Loading conversations...');
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations.",
        variant: "destructive",
      });
      return;
    }

    setConversations(data);
    console.log('Loaded conversations:', data.length);

    if (data.length >= CHAT_LIMIT_WARNING) {
      toast({
        title: "Chat History Notice",
        description: "You have quite a few chats saved. Consider deleting old ones to keep things organized.",
        duration: 5000,
      });
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
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

      setConversations(prev => prev.filter(convo => convo.id !== conversationId));
      
      toast({
        title: "Success",
        description: "Conversation deleted successfully",
      });

      console.log('Conversation deleted:', conversationId);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation.",
        variant: "destructive",
      });
    }
  };

  const deleteAllConversations = async () => {
    try {
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

      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .in('conversation_id', conversationIds);

      if (messagesError) throw messagesError;

      const { error: conversationsError } = await supabase
        .from('conversations')
        .delete()
        .in('id', conversationIds);

      if (conversationsError) throw conversationsError;

      setConversations([]);
      
      toast({
        title: "Success",
        description: "All conversations deleted successfully",
      });

      console.log('All conversations deleted');
    } catch (error) {
      console.error('Error deleting all conversations:', error);
      toast({
        title: "Error",
        description: "Failed to delete all conversations.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    console.log('Setting up real-time subscription for conversations...');
    const channel = supabase
      .channel('conversations_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('Conversation change detected:', payload);
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up conversations subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    conversations,
    deleteConversation,
    deleteAllConversations,
    CHAT_LIMIT_WARNING
  };
}