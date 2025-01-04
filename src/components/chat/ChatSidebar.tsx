import { useEffect, useState } from "react";
import { Conversation } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ConversationList } from "./sidebar/ConversationList";
import { SearchBar } from "./sidebar/SearchBar";
import { SidebarHeader } from "./sidebar/SidebarHeader";

interface ChatSidebarProps {
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export function ChatSidebar({ currentConversationId, onSelectConversation }: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const loadConversations = async () => {
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
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      // First delete all messages in the conversation
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) throw messagesError;

      // Then delete the conversation
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
      // Get all conversation IDs for the current user
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

      // First delete all messages in these conversations
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .in('conversation_id', conversationIds);

      if (messagesError) throw messagesError;

      // Then delete all conversations
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

  const filteredConversations = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 sm:w-80 bg-[#1A1F2C] border-r border-white/10 flex flex-col h-full">
      <SidebarHeader onDeleteAll={deleteAllConversations} />
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <div className="flex-1 overflow-y-auto">
        <ConversationList
          conversations={filteredConversations}
          currentConversationId={currentConversationId}
          onSelectConversation={onSelectConversation}
          onDeleteConversation={deleteConversation}
        />
      </div>
    </div>
  );
}