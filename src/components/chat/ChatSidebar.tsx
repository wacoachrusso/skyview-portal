import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SearchBar } from "./sidebar/SearchBar";
import { ConversationList } from "./sidebar/ConversationList";
import { useNavigate } from "react-router-dom";

interface ChatSidebarProps {
  onSelectConversation: (conversationId: string) => void;
  currentConversationId: string | null;
}

export function ChatSidebar({ onSelectConversation, currentConversationId }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadConversations = async () => {
    console.log('Loading conversations...');
    
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (!session) {
        console.log('No active session found, redirecting to login');
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error loading conversations:', error);
        throw error;
      }

      console.log('Loaded conversations:', data?.length || 0);
      setConversations(data || []);
    } catch (error) {
      console.error('Error in loadConversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations. Please try logging in again.",
        variant: "destructive",
        duration: 3000
      });
      navigate('/login');
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!conversationId) {
      console.error('No conversation ID provided for deletion');
      return;
    }

    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Conversation deleted",
        duration: 3000
      });

      if (currentConversationId === conversationId) {
        onSelectConversation('');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
        duration: 3000
      });
    }
  };

  const deleteAllConversations = async () => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .not('id', 'is', null);

      if (error) throw error;

      toast({
        title: "Success",
        description: "All conversations deleted",
        duration: 3000
      });
      
      onSelectConversation('');
    } catch (error) {
      console.error('Error deleting all conversations:', error);
      toast({
        title: "Error",
        description: "Failed to delete all conversations",
        variant: "destructive",
        duration: 3000
      });
    }
  };

  useEffect(() => {
    loadConversations();

    // Set up real-time subscription for conversations
    const channel = supabase
      .channel('conversations_changes')
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