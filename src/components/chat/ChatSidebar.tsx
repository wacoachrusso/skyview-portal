import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SearchBar } from "./sidebar/SearchBar";
import { ConversationList } from "./sidebar/ConversationList";

interface ChatSidebarProps {
  onSelectConversation: (conversationId: string) => void;
  currentConversationId: string | null;
}

export function ChatSidebar({ onSelectConversation, currentConversationId }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { toast } = useToast();

  const loadConversations = async () => {
    console.log('Loading conversations...');
    
    // Check authentication first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('No active session found');
      toast({
        title: "Authentication required",
        description: "Please log in to view conversations",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error loading conversations:', error);
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive",
        });
        return;
      }

      console.log('Loaded conversations:', data);
      setConversations(data || []);
    } catch (error) {
      console.error('Unexpected error loading conversations:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!conversationId) {
      console.error('No conversation ID provided for deletion');
      return;
    }

    console.log('Deleting conversation:', conversationId);
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Conversation deleted",
    });

    if (currentConversationId === conversationId) {
      onSelectConversation('');
    }
  };

  const deleteAllConversations = async () => {
    console.log('Deleting all conversations...');
    const { error } = await supabase
      .from('conversations')
      .delete()
      .not('id', 'is', null);

    if (error) {
      console.error('Error deleting all conversations:', error);
      toast({
        title: "Error",
        description: "Failed to delete all conversations",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "All conversations deleted",
    });
    
    onSelectConversation('');
  };

  useEffect(() => {
    loadConversations();

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
          console.log('Conversation change received:', payload);
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredConversations = conversations.filter(conversation =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 sm:w-80 bg-gradient-to-b from-[#1A1F2C] to-[#2A2F3C] border-r border-white/10 flex flex-col">
      <SidebarHeader onDeleteAll={deleteAllConversations} />
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <ConversationList
        conversations={filteredConversations}
        currentConversationId={currentConversationId}
        onSelectConversation={onSelectConversation}
        onDeleteConversation={deleteConversation}
      />
    </div>
  );
}